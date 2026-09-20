#!/usr/bin/env bash
# Daily backup of the database and the uploads directory.
#
# A backup only counts once it has been read back. Each archive is written
# under a temporary name, checked, and renamed last; older backups are rotated
# only after the new pair passed. A broken run therefore never replaces good
# files with bad ones, and never leaves something that merely looks like a
# backup. Every run records its outcome in last-status.json. Failures and
# warnings are also posted to the webhook named in ALERT_WEBHOOK_FILE when that
# file exists; a successful run stays silent.
#
#   ./backup.sh            take a backup
#   ./backup.sh --check    exit non-zero unless the last good backup is recent
#
# What this script cannot notice is itself not running (cron removed, host
# down). That needs a check from outside this machine.
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="${BACKUP_DIR:-/data/backup}"
UPLOADS_DIR="${BACKUP_UPLOADS_DIR:-/data/uploads}"
ALERT_WEBHOOK_FILE="${BACKUP_ALERT_WEBHOOK_FILE:-/opt/website/.backup-alert-webhook}"
RETENTION_DAYS=7
# The schema has 28 tables today. The floor only has to catch a dump that is
# structurally empty, so it sits well below the real number.
MIN_TABLES="${BACKUP_MIN_TABLES:-20}"
MIN_FREE_KB="${BACKUP_MIN_FREE_KB:-524288}"
MAX_AGE_HOURS="${BACKUP_MAX_AGE_HOURS:-26}"

STATUS_FILE="$BACKUP_DIR/last-status.json"
LAST_SUCCESS_FILE="$BACKUP_DIR/last-success"

if [ "${1:-}" = "--check" ]; then
  if [ ! -s "$LAST_SUCCESS_FILE" ]; then
    echo "No successful backup has been recorded in $BACKUP_DIR."
    exit 1
  fi
  last_success="$(head -n 1 "$LAST_SUCCESS_FILE" | tr -d '[:space:]')"
  case "$last_success" in
    '' | *[!0-9]*)
      echo "Unreadable timestamp in $LAST_SUCCESS_FILE."
      exit 1
      ;;
  esac
  age_hours=$((($(date +%s) - last_success) / 3600))
  if [ "$age_hours" -ge "$MAX_AGE_HOURS" ]; then
    echo "Last successful backup was ${age_hours}h ago; the limit is ${MAX_AGE_HOURS}h."
    exit 1
  fi
  echo "Last successful backup was ${age_hours}h ago."
  exit 0
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DB_NAME="db-$TIMESTAMP.sql.gz"
UPLOADS_NAME="uploads-$TIMESTAMP.tar.gz"
DB_PARTIAL="$BACKUP_DIR/$DB_NAME.partial"
UPLOADS_PARTIAL="$BACKUP_DIR/$UPLOADS_NAME.partial"

STAGE="starting"
FAIL_REASON=""
WARNINGS=""
DB_BYTES=0
DB_TABLES=0
UPLOADS_BYTES=0
UPLOADS_FILES=0

fail() {
  FAIL_REASON="$1"
  exit 1
}

# Values end up inside a JSON string, so drop the characters that would break one.
json_safe() {
  printf '%s' "$1" | tr -d '"\\' | tr '\n\r\t' '   '
}

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$@"
  else
    shasum -a 256 "$@"
  fi
}

write_status() {
  local status="$1"
  local stage=""
  [ "$status" = "ok" ] || stage="$STAGE"
  {
    printf '{\n'
    printf '  "status": "%s",\n' "$status"
    printf '  "finishedAt": "%s",\n' "$(date +%Y-%m-%dT%H:%M:%S%z)"
    printf '  "stage": "%s",\n' "$(json_safe "$stage")"
    printf '  "error": "%s",\n' "$(json_safe "$FAIL_REASON")"
    printf '  "warnings": "%s",\n' "$(json_safe "$WARNINGS")"
    printf '  "database": {"file": "%s", "bytes": %s, "tables": %s},\n' "$DB_NAME" "$DB_BYTES" "$DB_TABLES"
    printf '  "uploads": {"file": "%s", "bytes": %s, "files": %s}\n' "$UPLOADS_NAME" "$UPLOADS_BYTES" "$UPLOADS_FILES"
    printf '}\n'
  } > "$STATUS_FILE.tmp" && mv "$STATUS_FILE.tmp" "$STATUS_FILE"
}

send_alert() {
  local text url payload response_file http_status
  [ -s "$ALERT_WEBHOOK_FILE" ] || return 0
  url="$(head -n 1 "$ALERT_WEBHOOK_FILE" | tr -d '[:space:]')"
  case "$url" in
    https://*) ;;
    *)
      echo "Alert webhook file does not hold an https URL; alert skipped." >&2
      return 0
      ;;
  esac
  text="$(json_safe "$1")"
  payload="{\"msg_type\":\"text\",\"content\":{\"text\":\"$text\"}}"
  # Keep the URL on stdin and never log the platform response: either may
  # contain credentials. Alert failure must not overwrite the backup outcome.
  if ! response_file="$(mktemp "$BACKUP_DIR/.alert-response.XXXXXX")"; then
    echo "Alert could not be checked (the backup result is unaffected)." >&2
    return 0
  fi
  if ! http_status="$(printf 'url = "%s"\n' "$url" \
    | curl --disable --silent --max-time 10 --config - \
      --proto '=https' --max-filesize 65536 \
      --header 'Content-Type: application/json' --data "$payload" \
      --output "$response_file" --write-out '%{http_code}' 2>/dev/null)"; then
    echo "Alert could not be delivered (the backup result is unaffected)." >&2
  elif [ "$http_status" != "200" ]; then
    echo "Alert received a non-success HTTP response (the backup result is unaffected)." >&2
  elif ! python3 - "$response_file" 2>/dev/null <<'CHECK_ALERT'
import json
import sys
try:
    with open(sys.argv[1], 'rb') as response:
        raw = response.read(65537)
    if len(raw) > 65536:
        raise ValueError('oversized response')
    result = json.loads(raw)
    code = result.get('code', result.get('StatusCode'))
    accepted = type(code) is int and code == 0
except Exception:
    accepted = False
sys.exit(0 if accepted else 1)
CHECK_ALERT
  then
    echo "Alert acceptance could not be confirmed by the platform (the backup result is unaffected)." >&2
  fi
  rm -f -- "$response_file" || true
  return 0
}

on_exit() {
  local code=$?
  trap - EXIT
  [ "$code" -ne 0 ] || return 0
  # Only this run's own temporary files; finished backups are never touched here.
  rm -f -- "$DB_PARTIAL" "$UPLOADS_PARTIAL"
  [ -n "$FAIL_REASON" ] || FAIL_REASON="command failed (exit $code)"
  write_status failed 2>/dev/null || true
  echo "Backup FAILED at stage '$STAGE': $FAIL_REASON" >&2
  # Braces matter here: bash 3.2 reads the first byte of a following non-ASCII
  # character as part of the variable name.
  send_alert "官网备份失败｜$(hostname)｜阶段：${STAGE}｜原因：${FAIL_REASON}｜上一份好的备份仍保留在 ${BACKUP_DIR}" || true
  exit "$code"
}
trap on_exit EXIT

STAGE="preflight"
[ -f "$ENV_FILE" ] || fail "missing $ENV_FILE"
[ -d "$UPLOADS_DIR" ] || fail "uploads directory $UPLOADS_DIR does not exist"
mkdir -p "$BACKUP_DIR"
free_kb="$(df -Pk "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
case "$free_kb" in
  '' | *[!0-9]*) fail "could not read free space for $BACKUP_DIR" ;;
esac
[ "$free_kb" -ge "$MIN_FREE_KB" ] || fail "only ${free_kb}KB free in $BACKUP_DIR; ${MIN_FREE_KB}KB required"

# Find the previous dump before this run adds a new one.
previous_db="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'db-*.sql.gz' | sort | tail -n 1)"

STAGE="database dump"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U corporate -d corporate_site | gzip > "$DB_PARTIAL"

STAGE="database verification"
gzip -t "$DB_PARTIAL" || fail "the compressed dump is corrupt"
# pg_dump writes this marker last. A dump cut short does not have it, yet it
# still decompresses cleanly, so gzip -t alone would wave it through.
# Newer pg_dump versions add an \unrestrict line after it, hence the margin.
dump_tail="$(gzip -dc "$DB_PARTIAL" | tail -n 12)"
case "$dump_tail" in
  *'PostgreSQL database dump complete'*) ;;
  *) fail "the dump has no completion marker, so it was cut short" ;;
esac
DB_TABLES="$(gzip -dc "$DB_PARTIAL" | grep -c '^CREATE TABLE' || true)"
[ "$DB_TABLES" -ge "$MIN_TABLES" ] || fail "the dump holds $DB_TABLES tables; at least $MIN_TABLES expected"
DB_BYTES="$(wc -c < "$DB_PARTIAL" | tr -d ' ')"
if [ -n "$previous_db" ]; then
  previous_bytes="$(wc -c < "$previous_db" | tr -d ' ')"
  # Shrinking is suspicious but can be legitimate (a purge), so it warns rather
  # than throwing a valid backup away.
  if [ "$((DB_BYTES * 2))" -lt "$previous_bytes" ]; then
    WARNINGS="database dump shrank from ${previous_bytes} to ${DB_BYTES} bytes"
  fi
fi

STAGE="uploads archive"
files_on_disk="$(find "$UPLOADS_DIR" -type f | wc -l | tr -d ' ')"
tar -czf "$UPLOADS_PARTIAL" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"

STAGE="uploads verification"
gzip -t "$UPLOADS_PARTIAL" || fail "the uploads archive is corrupt"
UPLOADS_FILES="$(tar -tzf "$UPLOADS_PARTIAL" | grep -vc '/$' || true)"
[ "$UPLOADS_FILES" -ge "$files_on_disk" ] \
  || fail "the archive lists $UPLOADS_FILES files but $files_on_disk were on disk"
UPLOADS_BYTES="$(wc -c < "$UPLOADS_PARTIAL" | tr -d ' ')"

STAGE="publish"
mv "$DB_PARTIAL" "$BACKUP_DIR/$DB_NAME"
mv "$UPLOADS_PARTIAL" "$BACKUP_DIR/$UPLOADS_NAME"
(cd "$BACKUP_DIR" && sha256_of "$DB_NAME" "$UPLOADS_NAME" > "backup-$TIMESTAMP.sha256")

STAGE="rotation"
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'db-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'uploads-*.tar.gz' -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'backup-*.sha256' -mtime +"$RETENTION_DAYS" -delete
# Temporary files of a run that was killed before its exit handler could act.
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.partial' -mtime +0 -delete

date +%s > "$LAST_SUCCESS_FILE"
write_status ok
if [ -n "$WARNINGS" ]; then
  echo "Backup WARNING: $WARNINGS" >&2
  send_alert "官网备份告警｜$(hostname)｜${WARNINGS}｜备份已保存，请确认数据是否被误删"
fi

echo "Backup completed: $BACKUP_DIR (db $DB_TABLES tables $DB_BYTES bytes, uploads $UPLOADS_FILES files $UPLOADS_BYTES bytes)"

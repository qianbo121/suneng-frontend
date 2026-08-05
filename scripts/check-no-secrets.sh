#!/usr/bin/env bash
set -euo pipefail

failed=0

check_pattern() {
  local label="$1"
  local pattern="$2"
  local matches
  matches="$(git ls-files -co --exclude-standard -z \
    | xargs -0 grep -IlE -- "$pattern" 2>/dev/null \
    | grep -v '^scripts/check-no-secrets.sh$' || true)"
  if [ -n "$matches" ]; then
    echo "Secret guard failed: $label detected in repository files:"
    echo "$matches"
    failed=1
  fi
}

check_pattern 'bcrypt password hash' '\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}'
check_pattern 'private key material' 'BEGIN ([A-Z0-9 ]+ )?PRIVATE KEY'
check_pattern 'GitHub token' 'gh[pousr]_[A-Za-z0-9_]{30,}'

while IFS= read -r sql_file; do
  if [ ! -f "$sql_file" ]; then
    continue
  fi
  case "$sql_file" in
    backend/prisma/migrations/*/migration.sql) ;;
    *)
      echo "Secret guard failed: tracked SQL dump is outside Prisma migrations: $sql_file"
      failed=1
      ;;
  esac
done < <(git ls-files -co --exclude-standard '*.sql')

if [ "$failed" -ne 0 ]; then
  exit 1
fi

echo 'Secret guard passed.'

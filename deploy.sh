#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill production values first."
  exit 1
fi

pull_latest() {
  if [ "${DEPLOY_SKIP_PULL:-0}" = "1" ]; then
    echo "Skipping git pull because DEPLOY_SKIP_PULL=1."
    return 0
  fi

  local attempt=1
  local max_attempts=3

  until git pull --ff-only origin main; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "git pull failed after $attempt attempts."
      return 1
    fi

    echo "git pull failed; retrying in 10 seconds ($attempt/$max_attempts)..."
    attempt=$((attempt + 1))
    sleep 10
  done
}

pull_latest

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"

if ! command -v logrotate >/dev/null 2>&1; then
  echo "Missing logrotate; install it before deploying."
  exit 1
fi

if ! grep -Fq 'server_name factory.jssngyl.cn;' nginx.prod.conf.template; then
  echo "Refusing deployment: nginx.prod.conf.template is missing the smart-factory route."
  exit 1
fi

# The production host also serves the separately deployed Chengwen app through
# this shared Nginx container. Refuse a full-site deploy if the checked-in
# template would silently remove that route.
if docker inspect chengwen-web >/dev/null 2>&1 \
  && ! grep -Fq 'server_name chengwen.jssngyl.cn;' nginx.prod.conf.template; then
  echo "Refusing deployment: nginx.prod.conf.template is missing the active Chengwen route."
  exit 1
fi

work_scan_rule_count="$(grep -Fc 'location ^~ /h5/work-scan/' nginx.prod.conf.template || true)"
if [ "$work_scan_rule_count" -ne 3 ]; then
  echo "Refusing deployment: expected 3 legacy work-scan redirect rules, found $work_scan_rule_count."
  exit 1
fi

root_redirect_rule_count="$(grep -Fc 'return 308 https://$DOMAIN/zh;' nginx.prod.conf.template || true)"
if [ "$root_redirect_rule_count" -ne 1 ]; then
  echo "Refusing deployment: expected exactly one permanent www root redirect, found $root_redirect_rule_count."
  exit 1
fi

for required_container in furnace-web furnace-api; do
  if ! docker inspect "$required_container" >/dev/null 2>&1; then
    echo "Refusing deployment: required smart-factory container $required_container is missing."
    exit 1
  fi
done

install -d -m 0755 /data/nginx-logs
install -m 0644 ops/logrotate/corp-site-nginx /etc/logrotate.d/corp-site-nginx

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

# Back up the DB + uploads BEFORE applying migrations, so a bad migration or a
# failed deploy is recoverable (backup.sh writes to /data/backup, keeps 7 days).
bash backup.sh

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

# A bind-mounted single file can keep pointing at the pre-pull inode after Git
# replaces the host file. Copy the checked-in template into the running
# container explicitly, then render from that deployment copy. This guarantees
# the candidate is built from the bytes just audited above.
nginx_container_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q nginx)"
if [ -z "$nginx_container_id" ]; then
  echo "Refusing deployment: nginx container is not running."
  exit 1
fi
docker cp nginx.prod.conf.template "$nginx_container_id:/tmp/nginx.conf.template.deploy"

# Render with the exact same substitution list used by the container command,
# test the candidate before replacing the active file, then reload gracefully.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T \
  -e 'NGINX_SUBST_VARS=$DOMAIN $ADMIN_DOMAIN' nginx sh -lc '
    set -eu
    candidate=/tmp/nginx.conf.deploy
    envsubst "$NGINX_SUBST_VARS" < /tmp/nginx.conf.template.deploy > "$candidate"
    nginx -t -c "$candidate"
    cp "$candidate" /etc/nginx/nginx.conf
    nginx -t
    nginx -s reload
    cmp -s "$candidate" /etc/nginx/nginx.conf
  '

# Health-check the REAL backend health route inside the container. The previous
# `curl -f http://localhost` was a false positive: nginx 301-redirects :80 to
# HTTPS and `curl -f` (without -L) exits 0 on a 3xx even when the app is down.
echo "Waiting for backend /api/health..."
backend_healthy=0
for attempt in {1..30}; do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    node -e "require('http').get('http://127.0.0.1:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
    echo "Backend health check passed."
    backend_healthy=1
    break
  fi

  if [ "$attempt" -lt 30 ]; then
    sleep 2
  fi
done

if [ "$backend_healthy" -ne 1 ]; then
  echo "Health check failed: backend /api/health"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50
  exit 1
fi

echo "Waiting for smart-factory routes..."
factory_healthy=0
for attempt in {1..15}; do
  factory_web_status="$(curl -sS -o /dev/null -w '%{http_code}' https://factory.jssngyl.cn/h5/login || true)"
  factory_api_status="$(curl -sS -o /dev/null -w '%{http_code}' https://factory.jssngyl.cn/api/accounts || true)"

  if [ "$factory_web_status" = "200" ] && [ "$factory_api_status" = "401" ]; then
    echo "Smart-factory route checks passed."
    factory_healthy=1
    break
  fi

  if [ "$attempt" -lt 15 ]; then
    sleep 2
  fi
done

if [ "$factory_healthy" -ne 1 ]; then
  echo "Health check failed: smart-factory routes (web=$factory_web_status api=$factory_api_status)"
  exit 1
fi

echo "Checking public domains and legacy work-scan redirects..."
www_status="$(curl -sS -o /dev/null -w '%{http_code}' https://www.jssngyl.cn/zh || true)"
admin_status="$(curl -sS -o /dev/null -w '%{http_code}' https://admin.jssngyl.cn/login || true)"
root_status="$(curl -sS -o /dev/null -w '%{http_code}' https://jssngyl.cn/zh || true)"

if [ "$www_status" != "200" ] || [ "$admin_status" != "200" ] || [ "$root_status" != "301" ]; then
  echo "Health check failed: public domains (www=$www_status admin=$admin_status root=$root_status)"
  exit 1
fi

work_scan_path="/h5/work-scan/deploy-health"
expected_work_scan_target="https://factory.jssngyl.cn${work_scan_path}"
for source in \
  "https://www.jssngyl.cn${work_scan_path}" \
  "https://jssngyl.cn${work_scan_path}" \
  "http://www.jssngyl.cn${work_scan_path}"; do
  response="$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' "$source" || true)"
  if [ "$response" != "302 $expected_work_scan_target" ]; then
    echo "Health check failed: legacy work-scan redirect ($source -> $response)"
    exit 1
  fi
done

echo "Deployment completed."

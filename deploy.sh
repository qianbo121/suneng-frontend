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

# The app containers were recreated and got new bridge IPs; nginx uses static
# upstreams with no resolver, so reload it to re-resolve them and avoid the
# stale-upstream-IP 502 failure mode.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nginx nginx -t
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nginx nginx -s reload

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

echo "Deployment completed."

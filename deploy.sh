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

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

# Back up the DB + uploads BEFORE applying migrations, so a bad migration or a
# failed deploy is recoverable (backup.sh writes to /data/backup, keeps 7 days).
bash backup.sh

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

# The app containers were recreated and got new bridge IPs; nginx uses static
# upstreams with no resolver, so reload it to re-resolve them and avoid the
# stale-upstream-IP 502 failure mode.
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

echo "Deployment completed."

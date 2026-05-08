#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill production values first."
  exit 1
fi

git pull origin main

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --no-cache
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

sleep 30

if ! curl -f http://localhost >/dev/null 2>&1; then
  echo "Health check failed: http://localhost"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50
  exit 1
fi

if ! curl -f http://localhost/api/v1/news >/dev/null 2>&1; then
  echo "Health check failed: http://localhost/api/v1/news"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50
  exit 1
fi

echo "Deployment completed."

#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/data/backup"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U corporate -d corporate_site | gzip > "$BACKUP_DIR/db-$TIMESTAMP.sql.gz"

tar -czf "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" -C /data uploads

find "$BACKUP_DIR" -type f -name 'db-*.sql.gz' -mtime +7 -delete
find "$BACKUP_DIR" -type f -name 'uploads-*.tar.gz' -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"

#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose --env-file /opt/website/.env.production -f docker-compose.prod.yml"
STATIC_EXTRACT_DIR="/tmp/frontend_static_extract"
STATIC_CONTAINER="tmp-frontend-static"
FRONTEND_CONTAINER="corp-site-frontend"
FRONTEND_IMAGE="website-frontend:latest"
STATIC_VOLUME="website_frontend_static"
SITE_URL="https://www.jssngyl.cn"
A3_CASE_PATH="/zh/case/anonymous-tsingshan-1250-renovation"
A3_SERVICE_PATH="/zh/service/furnace-renovation-overhaul"

cleanup() {
  docker rm -f "$STATIC_CONTAINER" 2>/dev/null || true
}
trap cleanup EXIT

require_repo_root() {
  if [ ! -d ".git" ] || [ ! -f "docker-compose.prod.yml" ] || [ ! -d "frontend" ]; then
    echo "必须在 repo 根目录执行 scripts/deploy-prod.sh"
    exit 1
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required command: $1"
    exit 1
  fi
}

require_http_code() {
  local url="$1"
  local expected="$2"
  local code

  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$url => HTTP $code"

  if [ "$code" != "$expected" ]; then
    echo "Expected HTTP $expected but got HTTP $code for $url"
    exit 1
  fi
}

echo "[1/10] 检查环境"
require_repo_root
test -f /opt/website/.env.production || {
  echo "/opt/website/.env.production not found"
  exit 1
}
require_command docker
require_command curl
require_command git
require_command timeout
docker info >/dev/null
docker compose version >/dev/null

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "当前分支不是 main，停止部署。current=$CURRENT_BRANCH"
  exit 1
fi

echo "[2/10] 检查 git 状态"
GIT_STATUS=$(git status --short)
if [ -n "$GIT_STATUS" ] && [ "$GIT_STATUS" != " M nginx.prod.conf.template" ]; then
  echo "工作区不干净，除 nginx.prod.conf.template 外存在其他改动，停止部署。"
  git status --short
  exit 1
fi

echo "[3/10] 拉取 main"
GIT_TERMINAL_PROMPT=0 timeout 60 git fetch origin || {
  echo "git fetch timeout/failed"
  exit 1
}
GIT_TERMINAL_PROMPT=0 timeout 60 git pull --ff-only origin main || {
  echo "git pull timeout/failed"
  exit 1
}

echo "[4/10] 构建 frontend"
$COMPOSE build frontend || {
  echo "frontend build failed. 可人工决定是否执行 docker builder prune -af + build --no-cache。"
  exit 1
}

echo "[5/10] 启动 frontend"
$COMPOSE up -d frontend

echo "[6/10] 等待 frontend healthy"
for i in {1..30}; do
  STATUS=$(docker inspect "$FRONTEND_CONTAINER" --format '{{.State.Health.Status}}' 2>/dev/null || echo "missing")
  if [ "$STATUS" = "healthy" ]; then
    echo "frontend ready after ${i}s"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "frontend not healthy after 30s"
    exit 1
  fi
  sleep 1
done

echo "[7/10] 提取并同步 static"
rm -rf "$STATIC_EXTRACT_DIR"
mkdir -p "$STATIC_EXTRACT_DIR"
docker rm -f "$STATIC_CONTAINER" 2>/dev/null || true

docker create --name "$STATIC_CONTAINER" "$FRONTEND_IMAGE" sh >/dev/null
docker cp "$STATIC_CONTAINER:/app/.next/static/." "$STATIC_EXTRACT_DIR/"
docker rm "$STATIC_CONTAINER" >/dev/null

test -d "$STATIC_EXTRACT_DIR/chunks" || {
  echo "extracted static missing chunks directory"
  exit 1
}
test -n "$(find "$STATIC_EXTRACT_DIR" -type f | head -1)" || {
  echo "extracted static has no files"
  exit 1
}

docker run --rm \
  -v "$STATIC_VOLUME:/dest" \
  -v "$STATIC_EXTRACT_DIR:/src:ro" \
  alpine sh -c "rm -rf /dest/* && cp -a /src/. /dest/"

docker run --rm -v "$STATIC_VOLUME:/dest" alpine sh -c "test -d /dest/chunks && test -n \"\$(find /dest -type f | head -1)\"" || {
  echo "static volume verification failed"
  exit 1
}

echo "[8/10] 重启 nginx"
$COMPOSE restart nginx
sleep 10

echo "[9/10] 线上验证"
CHUNK=$(curl -s "$SITE_URL$A3_CASE_PATH" | grep -oE '/_next/static/chunks/app[^"]+\.js' | head -1)
if [ -z "$CHUNK" ]; then
  echo "Failed to extract app chunk from A3 case page"
  exit 1
fi

CHUNK_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$CHUNK")
echo "$SITE_URL$CHUNK => HTTP $CHUNK_CODE"
if [ "$CHUNK_CODE" != "200" ]; then
  echo "chunk verification failed"
  exit 1
fi

require_http_code "$SITE_URL$A3_CASE_PATH" "200"
require_http_code "$SITE_URL/en/case/anonymous-tsingshan-1250-renovation" "404"
require_http_code "$SITE_URL$A3_SERVICE_PATH" "200"

curl -s "$SITE_URL$A3_SERVICE_PATH" | grep -q "anonymous-tsingshan-1250-renovation" || {
  echo "A3 service page case link verification failed"
  exit 1
}

echo "[10/10] 完成"
echo "DEPLOY_SUCCESS"

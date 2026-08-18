#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
RELEASE_MARKER="DEPLOY_COMMIT"
DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-/var/lock/corp-site-deploy.lock}"

if ! command -v flock >/dev/null 2>&1; then
  echo "Missing flock; install util-linux before deploying."
  exit 1
fi

# CI takes this lock before unpacking/rsyncing the release so the working tree
# cannot change underneath a running Docker build. Direct/manual invocations
# take the same lock here.
if [ "${DEPLOY_LOCK_HELD:-0}" != "1" ]; then
  exec 9>"$DEPLOY_LOCK_FILE"
  echo "Waiting for production deployment lock: $DEPLOY_LOCK_FILE"
  if ! flock -w "${DEPLOY_LOCK_TIMEOUT_SECONDS:-1800}" 9; then
    echo "Timed out waiting for the production deployment lock: $DEPLOY_LOCK_FILE"
    exit 75
  fi
  export DEPLOY_LOCK_HELD=1
fi

if [ -f ".DO_NOT_DEPLOY" ]; then
  echo "Refusing deployment: this checkout is explicitly marked as a non-deployable worktree."
  cat .DO_NOT_DEPLOY
  exit 64
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill production values first."
  exit 1
fi

pull_latest() {
  if [ "${DEPLOY_SKIP_PULL:-0}" = "1" ]; then
    echo "Skipping git pull because DEPLOY_SKIP_PULL=1."
    return 0
  fi

  if [ "$(git branch --show-current)" != "$DEPLOY_BRANCH" ]; then
    echo "Refusing deployment: expected branch $DEPLOY_BRANCH, current branch is $(git branch --show-current)."
    exit 64
  fi

  if [ -n "$(git status --porcelain)" ]; then
    echo 'Refusing deployment: the deployment checkout has uncommitted changes.'
    exit 64
  fi

  local attempt=1
  local max_attempts=3

  until git pull --ff-only origin "$DEPLOY_BRANCH"; do
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

if [ "${DEPLOY_SKIP_PULL:-0}" = "1" ]; then
  if [ ! -s "$RELEASE_MARKER" ]; then
    echo "Refusing deployment: CI source bundle is missing $RELEASE_MARKER."
    exit 64
  fi
  release_commit="$(tr -d '[:space:]' < "$RELEASE_MARKER")"
else
  release_commit="$(git rev-parse HEAD)"
fi

if [[ ! "$release_commit" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Refusing deployment: invalid release commit marker: $release_commit"
  exit 64
fi

if [ -n "${DEPLOY_EXPECTED_COMMIT:-}" ] && [ "$release_commit" != "$DEPLOY_EXPECTED_COMMIT" ]; then
  echo "Refusing deployment: release marker does not match DEPLOY_EXPECTED_COMMIT."
  exit 64
fi

export DEPLOY_COMMIT="$release_commit"
echo "Deploying release $DEPLOY_COMMIT from canonical branch $DEPLOY_BRANCH."

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"

if ! command -v logrotate >/dev/null 2>&1; then
  echo "Missing logrotate; install it before deploying."
  exit 1
fi

if ! grep -Fq 'server_name factory.jssngyl.cn;' nginx.prod.conf.template; then
  echo "Refusing deployment: nginx.prod.conf.template is missing the smart-factory route."
  exit 1
fi

if ! grep -Fq 'server_name shuju.jssngyl.cn;' nginx.prod.conf.template \
  || ! grep -Fq 'location = /api/internal' nginx.prod.conf.template \
  || ! grep -Fq 'location ^~ /api/internal/' nginx.prod.conf.template \
  || ! grep -Fq 'location = /api/ready' nginx.prod.conf.template; then
  echo "Refusing deployment: nginx.prod.conf.template is missing the protected Shuju route."
  exit 1
fi

shuju_public_domain="shuju.jssngyl.cn"
shuju_edge_cert="/etc/nginx/certs/fullchain.pem"
shuju_expected_ip="$(awk -F= '$1 == "SHUJU_EXPECTED_PUBLIC_IP" {sub(/^[^=]*=/, ""); print; exit}' "$ENV_FILE")"
if [ -z "$shuju_expected_ip" ]; then
  echo "Refusing deployment: SHUJU_EXPECTED_PUBLIC_IP is missing."
  exit 1
fi
if ! command -v getent >/dev/null 2>&1; then
  echo "Refusing deployment: getent is required for Shuju DNS verification."
  exit 1
fi
shuju_resolved_ips="$(getent ahosts "$shuju_public_domain" | awk '{print $1}' | sort -u)"
if ! grep -Fxq "$shuju_expected_ip" <<< "$shuju_resolved_ips"; then
  echo "Refusing deployment: Shuju DNS does not match SHUJU_EXPECTED_PUBLIC_IP."
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1 \
  || [ ! -r "$shuju_edge_cert" ] \
  || ! openssl x509 -in "$shuju_edge_cert" -noout -checkend 604800 >/dev/null; then
  echo "Refusing deployment: the shared edge certificate is not ready for Shuju."
  exit 1
fi
if ! openssl x509 -in "$shuju_edge_cert" -noout -ext subjectAltName \
  | tr ',' '\n' \
  | awk '{$1=$1};1' \
  | grep -Fxq "DNS:$shuju_public_domain"; then
  echo "Refusing deployment: the shared edge certificate is not ready for Shuju."
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

required_solution_pages=(
  continuous-heat-treatment-line
  jiangsu-gongye-lu-changjia
  rechuli-lu-changjia
  rechuli-lu-dian-gai-ran-yure-huishou
  rechuli-lu-gaizao-fengxian-zhouqi
  rechuli-lu-kongzhi-xitong-shengji
  rechuli-lu-luchen-fanxin
  rechuli-lu-tingchan-chongqi-banqian-fuchan
  rechuli-lu-wendu-bujun-zhenggai
)

for solution_slug in "${required_solution_pages[@]}"; do
  solution_page="frontend/src/app/[locale]/solutions/${solution_slug}/page.tsx"
  if [ ! -f "$solution_page" ]; then
    echo "Refusing deployment: required solution route is missing: $solution_page"
    exit 64
  fi
done

for required_container in furnace-web furnace-api; do
  if ! docker inspect "$required_container" >/dev/null 2>&1; then
    echo "Refusing deployment: required smart-factory container $required_container is missing."
    exit 1
  fi
done

install -d -m 0755 /data/nginx-logs
install -m 0644 ops/logrotate/corp-site-nginx /etc/logrotate.d/corp-site-nginx

force_no_cache_build="${DEPLOY_FORCE_NO_CACHE_BUILD:-0}"
case "$force_no_cache_build" in
  0|1) ;;
  *)
    echo "Refusing deployment: DEPLOY_FORCE_NO_CACHE_BUILD must be 0 or 1."
    exit 64
    ;;
esac

if [ "${DEPLOY_SKIP_BUILD:-0}" = "1" ]; then
  if [ "$force_no_cache_build" = "1" ]; then
    echo "Refusing deployment: build skip and forced no-cache build cannot be combined."
    exit 64
  fi
  echo "Skipping image builds because no production image inputs changed."
  for service in backend frontend admin; do
    if [ -z "$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" images -q "$service")" ]; then
      echo "Refusing build skip: no existing image found for service $service."
      exit 75
    fi
  done
else
  # Preserve useful caches when capacity is healthy. Reclaim only unused data
  # when needed, then fail before touching containers if the host still cannot
  # safely hold old and candidate images at the same time.
  # 门槛按 2026-08-18 实测标定（原值 12 是未经测量的估值，虚高约 3 倍）：
  #   三个新镜像独占合计 2.48G（backend 1.62 + frontend 0.84 + admin 0.02）
  #   Next.js 预渲染中间产物峰值约 1.5G
  #   实需约 4G，取 6G = 实需 + 50% 余量
  # 虚高的门槛会在磁盘尚有余力时拒绝发布，逼人绕过流程手工部署——
  # 那比磁盘不足更危险（今天实际发生过一次，绕过时漏传 env 导致 API 抖动3分钟）。
  min_free_gb="${DEPLOY_MIN_FREE_GB:-6}"
  available_kb="$(df -Pk . | awk 'NR == 2 { print $4 }')"
  required_kb="$((min_free_gb * 1024 * 1024))"
  if [ "$available_kb" -lt "$required_kb" ]; then
    docker builder prune -f >/dev/null
    docker image prune -f >/dev/null
    available_kb="$(df -Pk . | awk 'NR == 2 { print $4 }')"
  fi

  if [ "$available_kb" -lt "$required_kb" ]; then
    echo "Refusing image build: at least ${min_free_gb}GB free disk is required."
    df -h .
    docker system df
    exit 75
  fi

  # Build one service at a time. A single `docker compose build` lets BuildKit
  # retain three expanded workspaces concurrently and can exhaust this host.
  for service in backend frontend admin; do
    if [ "$force_no_cache_build" = "1" ]; then
      docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --no-cache "$service"
    else
      docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build "$service"
    fi
  done
fi

# Email-only inquiries cannot be represented by the pre-V2 backend/admin pair.
# Refuse to migrate or replace containers unless the candidate image proves it
# contains the forward-only inquiry contract gate. An old image does not have
# this executable and therefore fails before the database is touched.
if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --no-deps backend \
  node backend/dist/src/inquiry-contract-gate.js image; then
  echo "Refusing deployment: backend image does not support inquiry contract V2."
  exit 64
fi
if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --no-deps admin \
  sh -c 'test "$(cat /usr/share/nginx/html/inquiry-contract-version.txt 2>/dev/null)" = "2"'; then
  echo "Refusing deployment: admin image does not support inquiry contract V2."
  exit 64
fi

# The consumer must be upgraded and its frozen cutover initialized before the
# producer can accept email-only inquiries. Both systems use the same cutover
# ID; a missing, disabled or mismatched Shuju readiness response fails closed.
inquiry_read_enabled="$(awk -F= '$1=="SHUJU_INQUIRY_READ_ENABLED"{sub(/^[^=]*=/,""); print; exit}' "$ENV_FILE")"
inquiry_cutover_id="$(awk -F= '$1=="SHUJU_INQUIRY_READ_MIN_ID"{sub(/^[^=]*=/,""); print; exit}' "$ENV_FILE")"
case "$inquiry_cutover_id" in
  ''|0|*[!0-9]*)
    echo "Refusing deployment: SHUJU_INQUIRY_READ_MIN_ID must be a positive integer."
    exit 64
    ;;
esac
if [ "$inquiry_read_enabled" != "true" ]; then
  echo "Refusing deployment: SHUJU_INQUIRY_READ_ENABLED must be true for inquiry contract V2."
  exit 64
fi
if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --no-deps backend \
  node backend/dist/src/inquiry-contract-gate.js shuju-health \
    http://shuju:18321/api/ready "$inquiry_cutover_id"; then
  echo "Refusing deployment: Shuju V2 consumer is not ready at the frozen inquiry cutover."
  exit 64
fi

# The shared edge must already be running before any database migration. The
# staged release below deliberately keeps this container alive while backend
# and admin are replaced, reloads the audited V2 routes, and only then replaces
# the public frontend.
nginx_container_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q nginx)"
if [ -z "$nginx_container_id" ] \
  || [ "$(docker inspect "$nginx_container_id" --format '{{.State.Running}}' 2>/dev/null || true)" != "true" ]; then
  echo "Refusing deployment: nginx container is not running."
  exit 1
fi

# Back up the DB + uploads BEFORE applying migrations, so a bad migration or a
# failed deploy is recoverable (backup.sh writes to /data/backup, keeps 7 days).
bash backup.sh

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm backend \
  ./backend/node_modules/.bin/prisma migrate deploy --schema backend/prisma/schema.prisma
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d backend admin

# Keep the old frontend serving its V1-compatible form until the new backend
# and admin are proven healthy. The new backend still accepts V1 submissions,
# so this order does not create an inquiry-loss window.
echo "Waiting for backend /api/health..."
backend_healthy=0
for attempt in {1..30}; do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    node backend/dist/src/inquiry-contract-gate.js health \
      http://127.0.0.1:3001/api/health; then
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
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50 backend admin
  exit 1
fi

echo "Waiting for admin inquiry contract..."
admin_healthy=0
for attempt in {1..30}; do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T admin sh -c \
    'test "$(cat /usr/share/nginx/html/inquiry-contract-version.txt 2>/dev/null)" = "2" && wget -q -O /dev/null http://127.0.0.1/'; then
    echo "Admin health check passed."
    admin_healthy=1
    break
  fi

  if [ "$attempt" -lt 30 ]; then
    sleep 2
  fi
done

if [ "$admin_healthy" -ne 1 ]; then
  echo "Health check failed: admin inquiry contract"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50 backend admin
  exit 1
fi

# A bind-mounted single file can keep pointing at the pre-pull inode after Git
# replaces the host file. Copy the checked-in template into the running
# container explicitly, then render from that deployment copy. This guarantees
# the candidate is built from the bytes just audited above.
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

# Only after Nginx has the exact V2 inquiry route may the public frontend start
# sending V2 submissions. This preserves the documented producer rollout order.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d frontend

echo "Waiting for frontend health..."
frontend_healthy=0
for attempt in {1..30}; do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T frontend \
    node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"; then
    echo "Frontend health check passed."
    frontend_healthy=1
    break
  fi

  if [ "$attempt" -lt 30 ]; then
    sleep 2
  fi
done

if [ "$frontend_healthy" -ne 1 ]; then
  echo "Health check failed: frontend"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50 frontend
  exit 1
fi

# The frontend container now has a new bridge IP. Reload the already-validated
# config once more so Nginx resolves that final address instead of retaining the
# old frontend upstream from the route-preload reload above.
echo "Reloading Nginx after frontend replacement..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nginx sh -lc '
  set -eu
  nginx -t
  nginx -s reload
'

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

echo "Waiting for Chengwen route..."
chengwen_healthy=0
for attempt in {1..15}; do
  chengwen_login_status="$(curl -sS -o /dev/null -w '%{http_code}' https://chengwen.jssngyl.cn/login || true)"

  if [ "$chengwen_login_status" = "200" ]; then
    echo "Chengwen route check passed."
    chengwen_healthy=1
    break
  fi

  if [ "$attempt" -lt 15 ]; then
    sleep 2
  fi
done

if [ "$chengwen_healthy" -ne 1 ]; then
  echo "Health check failed: Chengwen route (login=$chengwen_login_status)"
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

echo "Deployment completed: $DEPLOY_COMMIT"

# Production Merge Checklist

在 `chore/tech-debt-remediation` 合并 `main` 前执行。

## 必须通过

- [ ] GitHub branch protection 已启用，至少要求 PR review 与 CI 通过。
- [ ] 服务器 `/opt/website/.env.production` 存在。
- [ ] `DB_PASSWORD`、`JWT_SECRET`、`DOMAIN`、`ADMIN_DOMAIN` 不是占位值。
- [ ] `docker compose --env-file .env.production -f docker-compose.prod.yml exec -T nginx nginx -t` 通过。
- [ ] 每日备份 cron 存在：

```cron
0 2 * * * cd /opt/website && ./backup.sh >> /var/log/suneng-backup.log 2>&1
```

- [ ] 合并前至少有一份可用备份：

```bash
ls -lh /data/backup
```

- [ ] 容器健康：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

## 2026-06-15 只读检查结果

- `/opt/website/.env.production`：存在。
- `DB_PASSWORD`、`JWT_SECRET`、`DOMAIN`、`ADMIN_DOMAIN`、`PUBLIC_SITE_URL`：均存在，且不是占位值；未打印密钥。
- `nginx -t`：通过；存在 `listen ... http2` deprecated warning，非阻塞。
- 备份 cron：已补充。
- 手动备份：已生成 `db-20260615.sql.gz` 与 `uploads-20260615.tar.gz`。
- 容器状态：frontend/backend/admin/postgres 均 healthy；nginx running。
- Branch protection：GitHub API 需要鉴权，当前本地环境无法确认，需在 GitHub 后台人工确认。

## 2026-06-15 后续技术债处理状态

- Admin JWT：已迁移为 `admin_session` HttpOnly cookie，前端不再写入 `corp_admin_token`，后端保留 Bearer 兼容路径。
- Admin CSRF：对 cookie 认证的 `/api/admin/*` 非 GET 请求增加 Origin/Referer 校验。
- CSP：`nginx.prod.conf.template` 已从 `Content-Security-Policy-Report-Only` 切为 `Content-Security-Policy` enforce；策略仍保留当前 Next/Vite 运行所需的 `unsafe-inline` / `unsafe-eval`，后续可再收紧。
- 图片资产：已完成第一轮同格式压缩，`frontend/public/images` 从约 211M 降至约 116M。

## 2026-06-15 合并前复查结果

- 本地 `lint`、`test`、backend/admin/frontend build：通过。
- 本地渲染后的 `nginx.prod.conf.template` 已复制到生产服务器 `/tmp`，并用现有 `corp-site-nginx` 容器执行 `nginx -t -c /tmp/suneng-nginx-prod-test.conf`：通过，仅保留既有 `listen ... http2` deprecated warning。
- 生产 `/opt/website/.env.production`：存在。
- `DB_PASSWORD`、`JWT_SECRET`、`DOMAIN`、`ADMIN_DOMAIN`、`PUBLIC_SITE_URL`：均存在，且不是占位值；未打印密钥。
- 生产当前 `nginx -t`：通过。
- 备份 cron：存在。
- 最新备份：`db-20260615.sql.gz`、`uploads-20260615.tar.gz`。
- 生产容器：`docker compose ps --format json` 返回 5 个服务记录。
- Branch protection：GitHub API 返回 `401 Requires authentication`，本地无法确认，仍需在 GitHub 后台人工确认或提供已鉴权 `gh` 环境。

## 禁止

- 未确认 branch protection 前，不建议直接合并到 `main`。
- 未确认最新备份存在前，不建议触发部署。
- 不要使用 `scripts/deploy-prod.sh` 作为独立部署逻辑；该入口仅兼容转发到 `deploy.sh`。

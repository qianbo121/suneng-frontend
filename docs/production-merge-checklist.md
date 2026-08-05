# Production Merge Checklist

在 `geo/p0-p1-p2-20260729` 合并 `main` 前执行。`main` 的 push 会触发自动部署，禁止绕过本清单直推。

## 必须通过

- [ ] GitHub branch protection 已启用，至少要求 PR review 与 CI 通过。
- [ ] 公开仓库中的历史管理员密码哈希已在生产密码轮换后完成历史清理。
- [ ] 服务器 `$DEPLOY_PATH/.env.production` 存在（以 GitHub Secret `DEPLOY_PATH` 或实际生产目录为准）。
- [ ] `DB_PASSWORD`、`JWT_SECRET`、`DOMAIN`、`ADMIN_DOMAIN` 不是占位值。
- [ ] `docker compose --env-file .env.production -f docker-compose.prod.yml exec -T nginx nginx -t` 通过。
- [ ] 每日备份 cron 存在：

```cron
0 2 * * * cd <DEPLOY_PATH> && ./backup.sh >> /var/log/suneng-backup.log 2>&1
```

- [ ] 合并前至少有一份可用备份：

```bash
ls -lh /data/backup
```

新备份文件按秒级时间戳命名，例如 `db-YYYYMMDD-HHMMSS.sql.gz` 与 `uploads-YYYYMMDD-HHMMSS.tar.gz`，避免同一天多次部署覆盖。

- [ ] 容器健康：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

- [ ] `FEISHU_INQUIRY_WEBHOOK_URL` 已配置，并完成一条不含敏感测试内容的真实通知验收。
- [ ] `pnpm test:visual` 的 15 张基线全部通过。
- [ ] `prisma migrate deploy` 已执行，`News.contentUpdatedAt` 已存在。
- [ ] 后台登录、退出、刷新、浏览器前进/后退和未知路由回退均通过。

## 2026-08-05 发布前只读核验

- 正式工作区：`geo/p0-p1-p2-20260729`，比 `origin/main` 领先 52 个提交；当前改动尚未提交。
- 生产目录：`/opt/website`；`.env.production` 存在，必需变量和飞书询盘 Webhook 均已配置（未打印值）。
- 生产容器：frontend、backend、admin、postgres 均 healthy；nginx running；`nginx -t` 通过。
- 生产管理员：仅 `admin` 一个启用的 `super_admin`；密码尚待本轮轮换。
- 最新备份：2026-08-05 02:00 的数据库与上传文件备份均存在；每日 02:00 cron 正常。
- 生产磁盘：Docker 未使用构建缓存清理后由 90% 降至 56%，约 17 GB 可用；未删除运行镜像、容器、数据库或备份。
- GitHub：本机 Git HTTPS 凭据可 dry-run push，但 `gh` token 已失效，branch protection 尚未验证。
- 发布标记：生产目录当前没有 `DEPLOY_COMMIT`；本轮发布后必须由 CI 写入完整 40 位 commit。

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

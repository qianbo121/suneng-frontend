# 部署步骤

生产部署以根目录 [DEPLOY.md](../DEPLOY.md) 和 `deploy.sh` 为准。本文只保留入口说明，避免出现两套互相冲突的发布流程。

## 1. 生产部署入口

生产服务器使用：

```bash
cd /opt/suneng-official-site
./deploy.sh
```

实际服务器目录以 GitHub Secret `DEPLOY_PATH` 或运维约定为准；如果不是 `/opt/suneng-official-site`，请替换为真实路径。

`deploy.sh` 会按固定顺序执行：

1. `git pull --ff-only origin main`，CI 远程包部署时通过 `DEPLOY_SKIP_PULL=1` 跳过。
2. `docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache`。
3. 调用 `backup.sh` 做部署前备份。
4. 执行 `prisma migrate deploy`。
5. `up -d` 启动或重建容器，不执行整站 `down`。
6. 对 nginx 执行 `nginx -s reload`，避免容器 IP 变化后 upstream 缓存导致 502。
7. 在 backend 容器内检查 `/api/health`。

## 2. 生产环境变量

生产环境统一使用根目录 `.env.production`，从 `.env.production.example` 复制后填写：

- `DB_PASSWORD`
- `JWT_SECRET`
- `DOMAIN`
- `ADMIN_DOMAIN`
- `PUBLIC_SITE_URL`

`DATABASE_URL`、`ALLOWED_ORIGINS`、`FRONTEND_URL`、`ADMIN_URL` 由 `docker-compose.prod.yml` 根据上述变量拼装，生产环境不需要在 `.env.production` 中重复声明。

## 3. 后台访问路径

生产后台部署在独立后台域名根路径：

```text
https://${ADMIN_DOMAIN}/
```

因此生产构建使用：

```env
VITE_APP_BASE_PATH=/
VITE_API_BASE_URL=/api
```

本地 Docker 开发栈仍然可以通过主站 `/admin/` 访问，对应 `docker-compose.yml` 中的 `VITE_APP_BASE_PATH=/admin/`。

## 4. GitHub Actions

`.github/workflows/deploy.yml` 负责：

1. 先跑 lint、typecheck、test 和三端 build。
2. 打包源码到服务器。
3. 通过 SSH 调用 `DEPLOY_SKIP_PULL=1 bash deploy.sh`。

必须配置 GitHub Secrets：

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_KEY`
- `DEPLOY_PATH`

未配置这些 Secrets 时，不要依赖 push main 自动部署。

## 5. 本地 Docker 验证

本地联调可以继续使用开发 compose：

```bash
docker compose up -d --build
```

本地默认地址：

- 前台：`http://localhost/zh`
- 后端 API：`http://localhost/api`
- Swagger：`http://localhost/api/docs`
- 后台：`http://localhost/admin/`

本地 compose 不等同生产部署；上线、回滚、备份和健康检查以 `DEPLOY.md` 为准。

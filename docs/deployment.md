# 部署步骤

本文档描述制造业企业官网系统的生产部署步骤，包含 `frontend`、`backend`、`admin`、`PostgreSQL` 和 `Nginx`。

## 1. 环境准备

- 安装 Docker 与 Docker Compose
- 准备可访问公网的 Linux 服务器
- 准备域名，并将域名解析到服务器
- 确认服务器开放 `80` 与 `443` 端口

## 2. 配置环境变量

分别复制并修改以下文件：

- `frontend/.env.example`
- `backend/.env.example`
- `admin/.env.example`

生产环境建议：

- `frontend`
  - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
  - `NEXT_PUBLIC_API_URL=/api`
  - `NEXT_PUBLIC_API_BASE_URL=/api`
  - `API_BASE_URL_INTERNAL=http://backend:3001/api`

- `backend`
  - `APP_URL=https://your-domain.com`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET` 使用高强度随机字符串
  - `ALLOWED_ORIGINS=https://your-domain.com,https://admin.your-domain.com`

- `admin`
  - `VITE_API_BASE_URL=/api`
  - `VITE_APP_BASE_PATH=/admin/`

## 3. 首次部署

在项目根目录执行：

```bash
docker compose build
docker compose up -d
```

首次启动后执行数据库迁移与种子：

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

## 4. Nginx 反向代理

根目录的 `nginx.conf` 已包含以下能力：

- `/` 转发到 Next.js 前台
- `/api/` 转发到 NestJS
- `/admin/` 转发到后台管理端
- `/uploads/` 直接服务上传目录
- `gzip`
- 静态资源缓存策略
- Let's Encrypt SSL 占位

如果你要启用 HTTPS：

1. 申请并签发证书
2. 修改 `nginx.conf` 中的域名与证书路径
3. 打开 `443 ssl` 对应的 `server` 段
4. 重载 Nginx

## 5. 更新发布

```bash
git pull origin main
docker compose up -d --build
```

如果 Prisma Schema 发生变更：

```bash
docker compose exec backend npx prisma migrate deploy
```

## 6. GitHub Actions 自动部署

`.github/workflows/deploy.yml` 已提供基础流程：

- 构建前台、后端、管理端
- 当存在部署 Secrets 时自动 SSH 到服务器执行部署

需要配置的 GitHub Secrets：

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_KEY`
- `DEPLOY_PATH`

## 7. 生产建议

- PostgreSQL 使用独立磁盘卷和定时备份
- `uploads` 目录做好对象存储迁移预案
- 管理员默认密码首次登录后立即修改
- 建议将 `APP_URL`、`NEXT_PUBLIC_SITE_URL` 和 SEO 域名保持一致
- 建议在 CDN 或云 WAF 层增加流量防护

# 常见故障排查

## 1. `pnpm: command not found`

原因：

- 本机未安装 `pnpm`
- 或未通过 `corepack` 启用

解决：

```bash
corepack enable
corepack pnpm -v
```

如果仍失败，确认 Node.js 版本是否正常。

## 2. `docker: command not found`

原因：

- Docker Desktop 未安装
- 或服务未启动

解决：

- 安装并启动 Docker Desktop
- 重新执行：

```bash
docker compose up -d
```

## 3. Prisma 生成失败

常见报错：

- 找不到 `schema.prisma`
- 数据库连接失败

解决：

```bash
corepack pnpm --dir backend prisma:generate
```

确认：

- `backend/prisma/schema.prisma` 存在
- `DATABASE_URL` 正确

## 4. 后端启动但前端请求失败

检查项：

- `frontend/.env.example` 中 `NEXT_PUBLIC_API_URL`
- 服务端渲染场景下 `API_BASE_URL_INTERNAL`
- 后端 CORS 白名单 `ALLOWED_ORIGINS`

容器部署时建议：

```env
NEXT_PUBLIC_API_URL=/api
API_BASE_URL_INTERNAL=http://backend:3001/api
```

## 5. 后台登录后跳回登录页

检查项：

- `JWT_SECRET` 是否变化
- `VITE_API_BASE_URL` 是否指向正确的 `/api`
- 浏览器本地存储中的旧 token 是否过期

解决：

- 清理浏览器本地存储
- 重新登录

## 6. 上传图片失败

检查项：

- 文件类型是否在白名单中
- 文件大小是否超过 10MB
- `uploads` 目录是否可写
- Nginx 是否正确暴露 `/uploads/`

允许类型：

- `jpg`
- `jpeg`
- `png`
- `gif`
- `webp`
- `svg`
- `pdf`

## 7. SEO 页面的图片或分享图地址错误

原因：

- `NEXT_PUBLIC_SITE_URL` 未设置为真实域名
- 服务端内部 API 地址被错误用于公开资源 URL

解决：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=/api
API_BASE_URL_INTERNAL=http://backend:3001/api
```

## 8. 后台刷新 404

检查项：

- 生产后台是否通过 `ADMIN_DOMAIN` 根路径访问：`https://${ADMIN_DOMAIN}/`
- 生产管理端构建时应为 `VITE_APP_BASE_PATH=/`
- 本地 Docker 栈才使用 `/admin/` 子路径，对应 `docker-compose.yml` 与 `nginx.conf`
- 如果是本地 `/admin/` 刷新 404，检查 Nginx `/admin/` 反代配置是否存在

## 9. 数据已更新但前台未立即变化

原因：

- 前台部分页面使用了 ISR

当前策略：

- 首页：ISR 3600
- 产品详情：SSG + ISR
- 静态页：ISR
- 新闻列表：SSR

如果需要立刻生效：

- 临时降低 `revalidate`
- 或引入后续的按标签/路径 revalidate 机制

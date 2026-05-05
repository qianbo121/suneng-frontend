# 企业官网全栈项目

制造业企业官网系统，包含前台站点、NestJS API、React 管理后台以及生产部署配置。

## 技术栈

- `frontend`: Next.js App Router + TypeScript + Tailwind CSS + next-intl
- `backend`: NestJS + Prisma + PostgreSQL
- `admin`: React 18 + Vite + Ant Design 5
- `deploy`: Docker Compose + Nginx + GitHub Actions

## 项目结构

```text
.
├── admin
├── backend
├── docs
├── frontend
├── .github/workflows
├── docker-compose.yml
├── nginx.conf
├── package.json
└── pnpm-workspace.yaml
```

## 本地开发

安装依赖：

```bash
pnpm install
```

启动数据库：

```bash
docker compose up -d postgres
```

生成 Prisma Client：

```bash
pnpm --dir backend prisma:generate
```

启动三端：

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm dev:admin
```

## 生产部署

一键构建并启动：

```bash
docker compose up -d --build
```

初始化数据库：

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

默认访问地址：

- 前台：`http://localhost/zh`
- 后端 API：`http://localhost/api`
- Swagger：`http://localhost/api/docs`
- 后台：`http://localhost/admin/`

## 环境变量

请根据环境复制并修改以下文件：

- `frontend/.env.example`
- `backend/.env.example`
- `admin/.env.example`

## 文档

- 部署文档：[docs/deployment.md](docs/deployment.md)
- 数据库初始化：[docs/database-init.md](docs/database-init.md)
- 故障排查：[docs/troubleshooting.md](docs/troubleshooting.md)
- 上线检查清单：[docs/prelaunch-checklist.md](docs/prelaunch-checklist.md)
- 逆向分析与模型文档：`docs/` 目录下其他文件

## 说明

- 前台已接入动态 SEO、`sitemap.xml`、`robots.txt`、JSON-LD 和双语路由
- 后端已提供管理端 JWT 鉴权、上传、内容管理和仪表盘接口
- 管理端已完成登录、权限框架、内容模块、产品模块、新闻模块和管理员管理

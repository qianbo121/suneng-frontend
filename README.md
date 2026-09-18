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

**唯一入口是 [DEPLOY.md](DEPLOY.md)，请先读它。** 合并 `main` 不会自动发布，`deploy.sh` 也不再是发布方式。

当前流程：从已通过 CI 的 `main` 提交构建固定程序包，导入服务器后用 `ops/releases/frontend_release.py` 明确执行替换，只换前台。命令与清单样例见 [固定程序包发布说明](ops/releases/README.md)。

不要做这三件事：

- 不要运行 `deploy.sh` 或 `scripts/release-one-click.sh`（历史整站流程，会在生产机重建镜像并执行数据库迁移）
- 不要手动触发已停用的 `Build And Deploy` 工作流
- 不要删除生产目录里的 `verified-images.override.yml`、`RELEASE_ARTIFACTS.json`、`DEPLOYMENT_IN_PROGRESS.json`（它们是发布保护与运行身份记录）

生产默认访问地址：

- 前台：`https://${DOMAIN}/zh`
- 后端 API：`https://${DOMAIN}/api`
- 后台：`https://${ADMIN_DOMAIN}/`

本地 Docker 验证仍可使用：

```bash
docker compose up -d --build
```

本地后台入口为 `http://localhost/admin/`。

## 环境变量

请根据环境复制并修改以下文件：

- `frontend/.env.example`
- `backend/.env.example`
- `admin/.env.example`

## 文档

- 生产部署文档：[DEPLOY.md](DEPLOY.md)
- 部署入口说明：[docs/deployment.md](docs/deployment.md)
- 数据库初始化：[docs/database-init.md](docs/database-init.md)
- 故障排查：[docs/troubleshooting.md](docs/troubleshooting.md)
- 上线检查清单：[docs/prelaunch-checklist.md](docs/prelaunch-checklist.md)
- 逆向分析与模型文档：`docs/` 目录下其他文件

## 说明

- 前台已接入动态 SEO、`sitemap.xml`、`robots.txt`、JSON-LD 和双语路由
- 后端已提供管理端 JWT 鉴权、上传、内容管理和仪表盘接口
- 管理端已完成登录、权限框架、内容模块、产品模块、新闻模块和管理员管理

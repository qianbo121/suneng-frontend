# 数据库初始化

本文档说明如何初始化 PostgreSQL、执行 Prisma 迁移、导入内容种子数据以及安全管理后台账号。

## 1. 启动数据库

本地开发：

```bash
docker compose up -d postgres
```

## 2. 配置后端环境变量

确认 `backend/.env.example` 或实际 `.env` 中至少包含：

```env
DATABASE_URL=postgresql://corporate:corporate@localhost:5432/corporate_site?schema=public
JWT_SECRET=replace-with-a-strong-secret
```

## 3. 生成 Prisma Client

```bash
corepack pnpm --dir backend prisma:generate
```

## 4. 执行迁移

开发环境：

```bash
cd backend
npx prisma migrate dev --name init
```

生产环境：

```bash
docker compose exec backend npx prisma migrate deploy
```

## 5. 导入内容种子数据

内容 seed 只处理横幅、产品、新闻、关于我们和合作伙伴等演示/初始化内容，永远不会创建、修改、重置或重新启用管理员账号。

本地开发环境可以执行：

```bash
cd backend
npx prisma db seed
```

生产部署默认只执行 `prisma migrate deploy`，不执行 seed。当前 seed 会删除并重建部分内容数据；生产环境只有在完成备份、确认影响范围并经过人工批准后，才能显式解除 `ALLOW_DESTRUCTIVE_SEED` 门禁。

## 6. 管理员账号

- 内容 seed 不提供默认账号和默认密码。
- 新数据库的首个超级管理员必须通过独立、受控的一次性流程创建，不得写入源码、初始化文档或通用 seed。
- 已有环境通过后台账号管理功能创建或停用普通管理员。
- 管理员密码由负责人单独保管，不进入 Git、日志、命令示例或共享文档。

已有管理员修改密码入口：

- 右上角用户菜单
- `修改密码`

## 7. 常见初始化顺序

```bash
corepack pnpm install --no-frozen-lockfile
corepack pnpm --dir backend prisma:generate
docker compose up -d postgres
cd backend && npx prisma migrate dev --name init
cd backend && npx prisma db seed
corepack pnpm --dir backend start:dev
```

上述顺序仅适用于本地开发。生产环境不得照搬开发 seed 步骤。

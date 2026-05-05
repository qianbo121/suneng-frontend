# 数据库初始化

本文档说明如何初始化 PostgreSQL、执行 Prisma 迁移、导入种子数据以及处理默认管理员账号。

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

## 5. 导入种子数据

```bash
cd backend
npx prisma db seed
```

或在容器中执行：

```bash
docker compose exec backend npx prisma db seed
```

## 6. 默认管理员

种子数据会创建默认管理员：

- 用户名：`admin`
- 密码：`admin123456`

首次登录后台后必须立即修改密码。

后台修改密码入口：

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

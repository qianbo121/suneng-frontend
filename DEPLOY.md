# 江苏苏能工业炉官网部署文档

> 本机唯一允许的部署源为 `/Users/qianbo/Desktop/Coding/官网-GEO-P0`。历史工作区 `/Users/qianbo/Desktop/Coding/官网+GEO` 已标记为禁止部署；不得从该目录运行部署脚本或制作生产包。

## 1. 服务器初始化

目标服务器：阿里云 ECS，Ubuntu 24.04。

已规划的基础环境：

- Docker
- Docker Compose
- UFW
- fail2ban
- 2G Swap

建议开放端口：

- `22/tcp` SSH
- `80/tcp` HTTP
- `443/tcp` HTTPS

## 2. 首次部署步骤

1. 克隆代码：

```bash
git clone <your-repository-url> /opt/website
cd /opt/website
```

2. 创建生产环境变量：

```bash
cp .env.production.example .env.production
vim .env.production
```

必须填写：

- `DB_PASSWORD`
- `JWT_SECRET`
- `DOMAIN`
- `ADMIN_DOMAIN`

3. 创建数据目录：

```bash
sudo mkdir -p /data/postgres /data/uploads /data/backup
sudo chown -R "$USER":"$USER" /data/postgres /data/uploads /data/backup
```

4. 准备 SSL 证书后运行部署：

```bash
chmod +x deploy.sh backup.sh
./deploy.sh
```

## 3. SSL 证书申请

生产 Nginx 预留证书路径：

- `/etc/nginx/certs/fullchain.pem`
- `/etc/nginx/certs/privkey.pem`

如果使用 Certbot standalone 模式，首次签发时先确保 80 端口可用：

```bash
sudo apt update
sudo apt install -y certbot
sudo certbot certonly --standalone \
  -d your-main-domain.com \
  -d your-admin-domain.com
```

复制证书到 Nginx 预留路径：

```bash
sudo mkdir -p /etc/nginx/certs
sudo cp /etc/letsencrypt/live/your-main-domain.com/fullchain.pem /etc/nginx/certs/fullchain.pem
sudo cp /etc/letsencrypt/live/your-main-domain.com/privkey.pem /etc/nginx/certs/privkey.pem
sudo chmod 600 /etc/nginx/certs/privkey.pem
```

如果两个域名分别签发证书，需要将 fullchain 和 privkey 合并为覆盖两个域名的同一张证书，或后续拆成两组证书路径。

证书续期建议加入 crontab：

```bash
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-main-domain.com/fullchain.pem /etc/nginx/certs/fullchain.pem && cp /etc/letsencrypt/live/your-main-domain.com/privkey.pem /etc/nginx/certs/privkey.pem && docker compose --env-file /opt/website/.env.production -f /opt/website/docker-compose.prod.yml restart nginx
```

## 4. 日常更新流程

```bash
cd /opt/website
./deploy.sh
```

部署脚本会执行：

1. 校验当前分支必须为 `main`、工作区必须干净，再执行 `git pull --ff-only origin main`
2. 重新构建镜像（`docker compose build`，保留 Docker layer cache；源码变更仍会触发对应 `COPY . .` 之后的构建层重跑）
3. **部署前备份**（`backup.sh`：DB + uploads → `/data/backup`，可回滚）
4. 执行 Prisma 数据库迁移（`prisma migrate deploy`）
5. 分阶段启动 backend 和 admin，确认健康；旧 frontend 继续承接兼容的 V1 表单
6. 校验并 reload Nginx，先让 V2 精确询盘路由生效
7. 启动并确认新 frontend 健康，再次 reload Nginx 解析 frontend 的新 bridge IP
8. 健康检查：核对官网、管理端、智能工厂、成文及历史跳转（失败则中止并打印日志）

> 改了 `nginx.prod.conf.template` 后，先校验语法再上生产——语法错会让 reload 失败 / nginx 起不来：
>
> ```bash
> docker run --rm -v "$PWD/nginx.prod.conf.template:/etc/nginx/nginx.conf:ro" nginx:1.27-alpine nginx -t
> ```

### 4.1 构建缓存与部署耗时

`deploy.sh` 默认使用：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
```

不要在日常部署中加 `--no-cache`。三个应用的 Dockerfile 都按缓存分层组织：先复制 `package.json` 和 `pnpm-lock.yaml` 安装依赖，再复制源码并执行构建。保留 Docker layer cache 后：

- 只改页面、文案、样式时，依赖安装层应直接命中缓存。
- 源码变化仍会让 `COPY . .` 之后的构建层失效并重新编译，不会部署旧代码。
- backend / admin 没有源码或依赖变化时，大部分构建层应缓存命中。

只有在怀疑 Docker 构建缓存损坏、基础镜像层异常、或依赖安装层需要彻底重建时，才通过同一个受控发布入口强制无缓存构建：

```bash
DEPLOY_FORCE_NO_CACHE_BUILD=1 ./deploy.sh
```

不要在构建后绕过发布脚本直接启动整套容器。无缓存只改变镜像构建方式，候选契约、数炬切换点、分阶段健康检查和两次 Nginx reload 仍必须全部经过 `deploy.sh`。

GitHub Actions 仍会先执行 lint、typecheck、test 和三端 build 作为质量门禁；服务器侧 build 是生产镜像构建，不再默认清空缓存。

### 4.2 回滚

#### 询盘契约 V2 上线后的强制边界

一旦新版表单对外开放，客户可以只留下邮箱。旧版官网后台和旧版数炬只认识电话，无法完整呈现这类询盘。因此，从询盘契约 V2 上线开始，**禁止按下面的旧流程整体切回旧版 backend、admin 或数炬镜像**，也禁止用迁移前数据库覆盖迁移后产生的询盘。

当前发布脚本会在数据库迁移前检查候选 backend 是否支持询盘契约 V2；生产编排的 backend 健康检查也要求 V2。旧镜像缺少这道能力，必须在替换服务前失败。不要绕过这两道门手工启动旧 backend。

发布顺序固定为：**先升级数炬并完成切换点初始化，再发布官网 backend 和 admin，随后校验并重载包含 V2 询盘路由的 Nginx，最后发布 frontend 放开新版表单，并在 frontend 健康后再次 reload Nginx 解析其新地址**。官网发布脚本会通过同机内部网络核对数炬的消费契约、运行模式和切换点；任一不一致都会在官网备份和迁移前停止。脚本还会确认 backend 和 admin 健康，并保证 Nginx 新路由已经生效后才替换 frontend。不得为了赶进度跳过此检查或先发布新版表单。

发生故障时只允许采用以下顺序：

1. 保留当前数据库、新版 backend、新版 admin 和新版数炬，优先做前向修复；
2. 如需立即停止新的邮箱询盘，只回退 frontend 到仍提交旧版电话表单的版本，不回退 backend、admin 和数炬；
3. 用新版数炬从既定切换点完整重扫，并逐条对账官网提交编号、联系方式、飞书状态和数炬记录；
4. 确认迁移后所有询盘都已导出并完成对账之前，不得恢复迁移前数据库。任何例外必须由负责人书面批准并保留操作记录。

下面的整体回滚命令只适用于询盘契约 V2 上线前的旧版本，或完全不涉及 backend、admin、数炬和询盘数据库的历史场景；V2 上线后不得照抄执行。

镜像在服务器本地构建、无独立 tag，回滚 = 切回上一个正常提交后重新部署：

```bash
cd /opt/website
git log --oneline -10                 # 找上一个正常提交
git checkout <last-good-commit>       # 切回（建议平时给稳定版打 tag）
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T nginx nginx -s reload
```

> Prisma 没有自动 down 迁移：若被回滚的版本含破坏性 schema 变更，必须先用该次部署**前**生成的 `/data/backup/db-*.sql.gz` 恢复数据库（见第 5 节），否则旧代码会对新 schema 报错。
>
> 上述数据库恢复说明不适用于询盘契约 V2：直接恢复迁移前备份会删除部署后收到的询盘，必须先按本节完成导出和逐条对账。

## 5. 备份与恢复

手动备份：

```bash
cd /opt/website
./backup.sh
```

备份文件按秒级时间戳命名，避免同一天多次部署互相覆盖：

- 数据库：`/data/backup/db-YYYYMMDD-HHMMSS.sql.gz`
- 上传文件：`/data/backup/uploads-YYYYMMDD-HHMMSS.tar.gz`

恢复数据库示例：

```bash
gunzip -c /data/backup/db-YYYYMMDD-HHMMSS.sql.gz | docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U corporate -d corporate_site
```

恢复上传文件示例：

```bash
sudo tar -xzf /data/backup/uploads-YYYYMMDD-HHMMSS.tar.gz -C /data
```

建议加入每日定时备份：

```bash
0 2 * * * cd /opt/website && ./backup.sh >> /var/log/suneng-backup.log 2>&1
```

## 6. 常见故障排查

### 容器起不来

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100
```

重点检查：

- `.env.production` 是否存在
- `DB_PASSWORD`、`JWT_SECRET`、`DOMAIN`、`ADMIN_DOMAIN` 是否填写
- `/data/postgres`、`/data/uploads` 权限是否正确

### 502

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs nginx --tail=100
docker compose --env-file .env.production -f docker-compose.prod.yml logs frontend --tail=100
docker compose --env-file .env.production -f docker-compose.prod.yml logs backend --tail=100
```

重点检查：

- frontend/backend/admin 是否健康
- Nginx 证书路径是否存在
- Nginx upstream 服务名是否正常

### 数据库连不上

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs postgres --tail=100
docker compose --env-file .env.production -f docker-compose.prod.yml logs backend --tail=100
```

重点检查：

- `DATABASE_URL` 是否由 `DB_PASSWORD` 正确拼接
- `/data/postgres` 是否为空目录或旧数据目录
- PostgreSQL 健康检查是否通过

### 上传失败

```bash
ls -la /data/uploads
docker compose --env-file .env.production -f docker-compose.prod.yml logs backend --tail=100
docker compose --env-file .env.production -f docker-compose.prod.yml logs nginx --tail=100
```

重点检查：

- `/data/uploads` 是否可写
- 上传文件是否超过 `UPLOAD_MAX_FILE_SIZE_MB`
- Nginx `client_max_body_size` 是否满足当前上传需求

# 江苏苏能工业炉官网部署文档

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
git clone <your-repository-url> /opt/suneng-official-site
cd /opt/suneng-official-site
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
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-main-domain.com/fullchain.pem /etc/nginx/certs/fullchain.pem && cp /etc/letsencrypt/live/your-main-domain.com/privkey.pem /etc/nginx/certs/privkey.pem && docker compose --env-file /opt/suneng-official-site/.env.production -f /opt/suneng-official-site/docker-compose.prod.yml restart nginx
```

## 4. 日常更新流程

```bash
cd /opt/suneng-official-site
./deploy.sh
```

部署脚本会执行：

1. `git pull origin main`
2. 重新构建镜像
3. 执行 Prisma 数据库迁移
4. 启动容器
5. 检查首页和新闻公开接口

## 5. 备份与恢复

手动备份：

```bash
cd /opt/suneng-official-site
./backup.sh
```

备份文件：

- 数据库：`/data/backup/db-YYYYMMDD.sql.gz`
- 上传文件：`/data/backup/uploads-YYYYMMDD.tar.gz`

恢复数据库示例：

```bash
gunzip -c /data/backup/db-YYYYMMDD.sql.gz | docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U corporate -d corporate_site
```

恢复上传文件示例：

```bash
sudo tar -xzf /data/backup/uploads-YYYYMMDD.tar.gz -C /data
```

建议加入每日定时备份：

```bash
0 2 * * * cd /opt/suneng-official-site && ./backup.sh >> /var/log/suneng-backup.log 2>&1
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

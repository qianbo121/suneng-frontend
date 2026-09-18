# 官网发布与恢复入口

当前生产使用已验收的固定程序包。日常前台发布和回退以 [固定程序包发布说明](ops/releases/README.md) 为唯一操作入口，不在生产服务器构建，也不通过同步整棵源码目录更新站点。

## 当前发布方式

1. 从经过检查与审阅的完整 Git 提交运行 `Prepare Immutable Frontend Candidate`，得到程序包、来源提交及校验记录。该流程只构建候选，不连接生产服务器。
2. 将程序包存入已确认的独立存储；导入前检查服务器空间，核对文件校验值、镜像身份、来源提交和当前运行版本。执行候选检查及真实浏览器验收。
3. 完成通知收件和独立备份验证后，使用 `ops/releases/frontend_release.py` 明确执行发布。只替换前台；后端、管理端、数据库和附件保持原状。发布失败时工具恢复前一前台并重新验收。

命令格式、清单样例与中断处理见 [发布工具说明](ops/releases/README.md)。未满足前置条件时，不通过修改标记或绕过工具强行发布。

## 旧部署流程的状态

`Build And Deploy` 的 main 推送触发已移除，仓库开关继续关闭。`deploy.sh` 保留为历史整站流程，会拒绝当前带固定版本标记的生产目录；不得删除标记来恢复这个入口。历史本机目录不再构成发布来源依据，来源以候选构建的完整提交和校验清单为准。

`verified-images.override.yml`、`RELEASE_ARTIFACTS.json` 和 `DEPLOYMENT_IN_PROGRESS.json` 是发布保护与运行身份记录。不能用普通源码同步覆盖、删除这些文件。有中断标记时先按照私有操作记录核对真实状态，再恢复，不直接重试发布。

## 回退与数据保护

前台回退使用同一个发布工具，并重新验证中英文页面、询价入口、已撤下内容及网站地图。不能回退到重新公开旧案例或旧方案的程序包。

前台回退不恢复数据库、不替换后端或管理端，也不回退数炬。含数据库、询盘契约、后端或管理端的变更须另做迁移与发布方案，保留上线后产生的询盘并完成逐条对账。

询盘契约 V2 已允许客户只填写邮箱，因此禁止整体切回旧版 backend、admin 或数炬镜像。需要退回页面时只回退 frontend，并通过当前撤下规则检查；不得恢复迁移前数据库。数据对账须由新版数炬从既定切换点完整重扫，再逐条核对联系方式、处理状态和官网提交记录。未来涉及全链路升级时，须先升级数炬并完成切换点初始化，再验证后端、管理端及代理路由，最后开放新版前台表单。

每日备份由服务器上的 cron 执行，这里是它唯一的记录：

```cron
0 2 * * * cd /opt/website && ./backup.sh >> /var/log/suneng-backup.log 2>&1
```

`backup.sh` 把数据库导出与附件打包写进 `/data/backup`，保留 7 天。每份产物先写成 `.partial`，读回校验通过后才改成正式文件名，新的一对都通过了才轮换旧的：

- 数据库：压缩包完整、结尾有 pg_dump 的完成标记（被截断的导出同样能正常解压，只靠 `gzip -t` 查不出来）、建表语句不少于 20 张（当前 28 张）。
- 附件：压缩包完整、包内文件数不少于打包前磁盘上的文件数。
- 体积比上一份缩水一半以上只告警、不丢弃——清理数据是合法操作，不能因此扔掉一份有效备份。
- 每次运行把结果写进 `/data/backup/last-status.json`，成功时另写 `last-success`（时间戳）和当次的 `backup-<时间>.sha256`。
- `./backup.sh --check`：最近一次成功备份超过 26 小时即退出码非零。发布前、交接时可以手工跑一次。

**失败告警**默认关闭。要打开：在飞书建一个专用的运维群机器人（不要复用询盘机器人——那个机器人的关键词是「新询盘」，会把运维消息发进销售群），安全设置的关键词填「官网备份」，然后把 webhook 地址单独写进服务器文件 `/opt/website/.backup-alert-webhook`（`chmod 600`，一行，不进仓库、不进日志）。脚本只在失败或缩水告警时发消息，成功不发。地址经标准输入交给 curl，不会出现在进程列表里。

仍然没有解决的两件事：

1. **同机同盘**。磁盘或整机出问题时备份一起丢。数据量很小（数据库约 1.1MB、附件约 30MB），异地一份的成本几乎为零，缺的只是一个经确认的目的地。
2. **脚本自己没跑**（cron 被删、机器宕机）这类故障，机器自己发现不了，需要机器外部的定时检查。

换机或重装时必须重新装上这条 cron。发布前的隔离恢复演练用的是另一套 `ops/releases/data_backup.py`（capture + restore），不要与这条 cron 混为一谈。

原有每日数据库和附件备份继续保留。同机备份不是独立备份；独立备份须经确认目的地、加密上传、下载校验和隔离恢复演练。恢复演练使用无网络、无公开端口的独立容器及独立数据目录，不能指向生产挂载目录。

真实灾难恢复应先确认恢复点、最新询盘与附件增量、负责人和停机安排，再制定专项操作。本文不提供可直接覆盖生产数据库或附件的复制命令。

## 运行配置

当前生产目录由运维配置指定，与历史 `DEPLOY_PATH` 保持一致。生产配置保留在服务器私有 `.env.production`，不进入源码包、普通文档或公开日志。主要配置包括数据库凭据、签名密钥、网站及后台域名；其取值通过已部署的编排文件传入应用。

证书变更单独核对证书路径、到期时间及代理配置，再做语法检查与受控重载，避免把证书维护混入前台发布。不要复制旧文档中未经当前环境核对的重启命令。

## 只读故障排查

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

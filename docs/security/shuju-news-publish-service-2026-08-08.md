# 数炬新闻独立发布服务

更新时间：2026-08-08

## 用途与当前状态

官网为数炬提供一组只在 Docker 内网使用的新闻写接口。代码上线后默认保持：

```bash
SHUJU_NEWS_PUBLISH_ENABLED=false
SHUJU_NEWS_PUBLISH_JWT_SECRET=
```

关闭状态下请求由官网服务端拒绝，不会创建、更新或下线新闻。首次打开必须等待用户批准具体的真实新闻。

## 专用接口

- `POST /api/svc/news/media`：校验并转存 JPEG、PNG、GIF 或 WebP，按 SHA-256 复用已存图片。
- `POST /api/svc/news/publish`：幂等创建或更新一条数炬所有的新闻。
- `POST /api/svc/news/offline`：下线一条数炬所有的新闻，不删除数据。

接口不读取 `AdminUser`、定制需求、线索事件或其他客户数据，也没有 PUT、PATCH 或 DELETE 路由。公网 nginx 对 `/api/svc/` 保持 404。

只读信任域另提供 `GET /api/svc/news/categories`，仅返回已发布分类的 ID、中文名和 slug。数炬草稿必须显式选择分类，不使用隐式默认分类。

## 独立信任域

- 写密钥不得等于官网后台 `JWT_SECRET` 或数炬只读密钥。
- 开启时写密钥必须至少 32 字节，否则官网后端拒绝启动。
- 令牌固定 `iss=shuju-engine`、`aud=corp-site-news-publish`、`sub=shuju-engine`、`scope=news:publish`。
- 服务端强制 HS256 和 `maxAge=5m`；缺少 `iat`、过期、错误 scope 或出现 `role` 均拒绝。
- 请求来源必须是私网地址，nginx 和应用守卫各有一道门禁。

## 幂等、归属与审计

`ShujuNewsPublication` 记录草稿与官网 `News` 的稳定归属。只有已绑定给数炬的新闻能被数炬更新或下线。`ShujuNewsOperation` 保存幂等键、载荷指纹、状态和错误结果；同一幂等键换载荷会拒绝。

官网日志只记录 action、subject、scope、requestId、来源草稿/版本、新闻 ID 和是否重放。密钥、令牌和新闻正文不得进入日志。

## 部署门禁

1. 先应用 Prisma 迁移，再启动新镜像。
2. 首次上线保持写开关关闭，且不配置真实写密钥。
3. 回归官网首页、管理后台登录、`/api/health`、公开新闻和原有数炬只读接口。
4. 在内网用无令牌的空载荷请求写接口，必须先被认证层拒绝，并证明新闻表、绑定表、操作表都没有新增。
5. 密钥同值的启动失败测试只在隔离容器执行，不得在生产服务上制造停机。

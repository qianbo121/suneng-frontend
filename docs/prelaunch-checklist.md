# 上线前检查清单

## 安全

- [x] API 参数校验完整
- [x] XSS 防护：新闻富文本前台输出已做 `sanitize`
- [x] 上传限制：类型白名单、大小限制、随机文件名
- [x] CORS 配置仅允许环境变量中声明的来源
- [x] JWT 密钥使用环境变量
- [x] 管理端接口需 JWT
- [x] 登录接口失败次数限制
- [x] 留言提交基础限流
- [x] 敏感信息未硬编码到前端页面
- [x] 默认管理员密码已在种子提示中要求首次修改

## SEO

- [x] 页面级动态 metadata
- [x] canonical URL
- [x] Open Graph
- [x] Twitter Card
- [x] 首页 `Organization` JSON-LD
- [x] 产品详情 `Product` JSON-LD
- [x] 新闻详情 `Article` JSON-LD
- [x] `sitemap.xml`
- [x] `robots.txt`
- [x] 图片 `alt` 标签策略
- [x] H1-H3 标题层级已规范化

## 国际化

- [x] `next-intl` 已接入
- [x] `/zh` 与 `/en` 双语路由
- [x] 默认中文
- [x] 语言切换保持当前路径
- [x] 后端 `*Zh / *En` 字段已做前端适配
- [x] 后台管理端保持中文

## 性能

- [x] 首页 ISR：`revalidate = 3600`
- [x] 产品详情 SSG + ISR
- [x] 新闻列表 SSR
- [x] 静态页 ISR
- [x] `next/image` 与 WebP/AVIF 输出
- [x] `next/font` 接入
- [x] 重组件按需 `dynamic import`
- [ ] Lighthouse 实测 Performance > 85
- [ ] Lighthouse 实测 SEO > 90

## 部署

- [x] 三端 Dockerfile
- [x] `docker-compose.yml`（本地验证）
- [x] `docker-compose.prod.yml`
- [x] `nginx.conf`（本地验证）
- [x] `nginx.prod.conf.template`
- [x] `deploy.sh` 生产发布脚本
- [x] GitHub Actions 基础流程
- [ ] 生产域名已解析
- [ ] SSL 证书已签发并启用
- [ ] 生产数据库备份策略已验证
- [ ] 日志、监控、告警已接入

## 联调与验收

- [ ] 前端、后端、后台三端在目标环境完整联调
- [ ] 上传、富文本、分页、筛选、状态切换逐页验证
- [ ] 多语言内容抽样检查
- [ ] SEO 配置与分享卡片抽样检查
- [ ] 默认管理员密码已人工修改

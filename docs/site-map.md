# 站点地图与路由结构

## 1. 路由总览

```text
/
/about
/about/company
/about/chairman-message
/about/culture
/about/timeline
/about/organization
/products
/products/[categorySlug]
/products/[categorySlug]/[productSlug]
/strength
/strength/technical-team
/strength/honors
/strength/certificates
/strength/equipment
/service
/service/after-sales
/service/online-support
/service/sales-network
/partners
/partners/companies
/partners/delivery
/partners/delivery/[slug]
/news
/news/company
/news/industry
/news/[categorySlug]/[slug]
/contact
/contact/info
/contact/message
```

## 2. 推荐路由规则

- `/about` 建议重定向到 `/about/company`
- `/strength` 建议重定向到 `/strength/honors` 或 `/strength/technical-team`
- `/service` 建议重定向到 `/service/after-sales`
- `/partners` 建议重定向到 `/partners/companies`
- `/news` 建议重定向到 `/news/company`
- `/contact` 建议重定向到 `/contact/info`

## 3. 页面清单

| 一级栏目 | 二级页面 | 路由 | 模板类型 | 动态参数 | 备注 |
| --- | --- | --- | --- | --- | --- |
| 首页 | 首页 | `/` | 首页 | 无 | 已有完整截图 |
| 关于我们 | 公司简介 | `/about/company` | Banner + Tab + 单栏内容 | 无 | 已确认 |
| 关于我们 | 董事长寄语 | `/about/chairman-message` | Banner + Tab + 图文内容 | 无 | 缺图 |
| 关于我们 | 企业文化 | `/about/culture` | Banner + Tab + 价值观内容 | 无 | 缺图 |
| 关于我们 | 发展历程 | `/about/timeline` | Banner + Tab + 时间轴 | 无 | 缺图，且未在导航图中直接出现 |
| 关于我们 | 组织架构 | `/about/organization` | Banner + Tab + 架构图 | 无 | 已确认 |
| 产品中心 | 分类总览 | `/products` | Banner + 左侧分类 + 产品列表 | 无 | 已确认 |
| 产品中心 | 分类列表 | `/products/[categorySlug]` | Banner + 左侧分类 + 产品列表 | `categorySlug` | 已确认 |
| 产品中心 | 产品详情 | `/products/[categorySlug]/[productSlug]` | 左侧分类 + 详情 + 参数 + 表单 | `categorySlug`, `productSlug` | 已确认 |
| 企业实力 | 技术团队 | `/strength/technical-team` | Banner + Tab + 列表/图文 | 无 | 缺图 |
| 企业实力 | 荣誉资质 | `/strength/honors` | Banner + Tab + 图片宫格 | 无 | 已确认 |
| 企业实力 | 资质证书 | `/strength/certificates` | Banner + Tab + 图片宫格 | 无 | 已确认 |
| 企业实力 | 生产设备 | `/strength/equipment` | Banner + Tab + 图片宫格 | 无 | 已确认 |
| 服务支持 | 售后服务 | `/service/after-sales` | Banner + Tab + 长文本 | 无 | 已确认 |
| 服务支持 | 在线客服 | `/service/online-support` | Banner + Tab + 联系入口/表单 | 无 | 缺图 |
| 服务支持 | 销售网络 | `/service/sales-network` | Banner + Tab + 地图/网点列表 | 无 | 缺图 |
| 合作伙伴 | 合作企业 | `/partners/companies` | Banner + Tab + Logo 宫格 | 无 | 已确认 |
| 合作伙伴 | 交车现场 | `/partners/delivery` | Banner + Tab + 案例列表 | 无 | 已确认 |
| 合作伙伴 | 交车现场详情 | `/partners/delivery/[slug]` | 详情页 | `slug` | 列表可点击，建议保留 |
| 新闻中心 | 公司新闻 | `/news/company` | Banner + Tab + 新闻列表 | 无 | 已确认 |
| 新闻中心 | 行业新闻 | `/news/industry` | Banner + Tab + 新闻列表 | 无 | 缺图 |
| 新闻中心 | 新闻详情 | `/news/[categorySlug]/[slug]` | 双栏详情页 | `categorySlug`, `slug` | 已确认 |
| 联系我们 | 联系方式 | `/contact/info` | Banner + Tab + 联系信息 + 地图 | 无 | 已确认 |
| 联系我们 | 在线留言 | `/contact/message` | Banner + Tab + 表单 | 无 | 已确认，同页已出现 |

## 4. 动态路由建议

### 产品中心

- `categorySlug`：适合做产品分类英文别名，例如 `charging-truck-series`
- `productSlug`：适合做产品英文或拼音别名，例如 `xmpyt-36-450`
- 推荐保留分类层级到 URL，便于 SEO、面包屑生成和后台路由映射

### 新闻中心

- `categorySlug`：建议限定为 `company` / `industry`
- `slug`：新闻详情英文或拼音别名

### 交车现场

- `slug`：交付案例唯一别名
- 若阶段一只做前端样板，可先实现列表页，详情页预留动态路由

## 5. 通用页面骨架

### 首页骨架

`Header -> Hero -> Featured Products -> Product Series Blocks -> Company Stats -> News -> Footer`

### 内页骨架

`Header -> PageBanner -> Breadcrumb -> Section Tabs -> Main Content -> Footer`

### 产品详情页骨架

`Header -> Breadcrumb -> Sidebar Categories -> Product Summary -> Product Content -> Specs -> Drawings -> Inquiry Form -> Related Products -> Footer`

## 6. 当前必须补充的截图

- 董事长寄语
- 企业文化
- 发展历程
- 技术团队
- 在线客服
- 销售网络
- 行业新闻列表
- 交车现场详情
- 手机端首页
- 手机端任一内页


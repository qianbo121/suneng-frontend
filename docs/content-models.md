# 内容模型与字段定义

## 0. 建模原则

- 所有模型默认包含：`id`、`createdAt`、`updatedAt`
- 需要排序的模型加：`sortOrder`
- 需要上下架的模型加：`status`，默认枚举为 `draft | published | offline`
- 需要双语的字段采用：`*_zh` / `*_en`
- 需要前台 URL 的模型加：`slug @unique`
- 需要 SEO 的模型加：`seoTitle_*`、`seoDescription_*`、`seoKeywords_*`、`ogImage`
- 富文本正文建议统一为 `Text`，复杂结构化数据建议统一为 `Json`

## 1. 推荐补充模型

除你要求的模型外，建议补充以下 3 个基础模型：

| 模型 | 理由 |
| --- | --- |
| `SiteSetting` | 管理网站级配置，例如 Logo、服务热线、二维码、备案号、语言开关、浮动工具条 |
| `NavigationItem` | 管理头部与页脚导航，避免菜单写死在代码里 |
| `MediaAsset` | 统一管理图片、PDF、二维码、视频封面、alt 文案，方便后台复用 |

## 2. 关系建议

- `ProductCategory 1 - n Product`
- `NewsCategory 1 - n News`
- `StrengthCategory 1 - n StrengthItem`
- `StrengthCategory 1 - n Certificate`
- `Product 1 - n Delivery`
- `AdminUser 1 - n ContactMessage`（处理人）
- `MediaAsset` 可被多个内容模型复用

## 3. 模型字段定义

## Banner

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `sectionKey` | `String` | 是 | 标识首页首屏、栏目 Banner、专题 Banner 等位置 | 否 | 否 |
| `title_zh` | `String` | 是 | 中文标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `subtitle_zh` | `String` | 否 | 中文副标题 | 是 | 否 |
| `subtitle_en` | `String` | 否 | 英文副标题 | 是 | 否 |
| `description_zh` | `Text` | 否 | 长描述/说明文案 | 是 | 否 |
| `description_en` | `Text` | 否 | 英文长描述 | 是 | 否 |
| `desktopImage` | `String` | 是 | PC Banner 图 | 否 | 否 |
| `mobileImage` | `String` | 否 | 移动端 Banner 图 | 否 | 否 |
| `linkUrl` | `String` | 否 | 按钮跳转地址 | 否 | 否 |
| `linkTarget` | `String` | 否 | `_self` / `_blank` | 否 | 否 |
| `sortOrder` | `Int` | 否 | 同位置多 Banner 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |

## ProductCategory

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `parentId` | `String` | 否 | 上级分类，支持多级分类 | 否 | 否 |
| `name_zh` | `String` | 是 | 分类中文名 | 是 | 否 |
| `name_en` | `String` | 否 | 分类英文名 | 是 | 否 |
| `slug` | `String` | 是 | 前台 URL 别名 | 否 | 是 |
| `summary_zh` | `Text` | 否 | 分类简介 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文简介 | 是 | 否 |
| `coverImage` | `String` | 否 | 分类封面图 | 否 | 否 |
| `bannerImage` | `String` | 否 | 分类 Banner 图 | 否 | 否 |
| `icon` | `String` | 否 | 分类图标 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 分类排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 社交分享图 | 否 | 是 |

## Product

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `categoryId` | `String` | 是 | 所属产品分类 | 否 | 否 |
| `name_zh` | `String` | 是 | 产品中文名 | 是 | 否 |
| `name_en` | `String` | 否 | 产品英文名 | 是 | 否 |
| `slug` | `String` | 是 | 产品 URL 别名 | 否 | 是 |
| `modelCode` | `String` | 否 | 型号编码 | 否 | 否 |
| `summary_zh` | `Text` | 否 | 摘要简介 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 是 | 中文详情正文 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文详情正文 | 是 | 否 |
| `application_zh` | `Text` | 否 | 应用场景说明 | 是 | 否 |
| `application_en` | `Text` | 否 | 英文应用场景说明 | 是 | 否 |
| `features_zh` | `Json` | 否 | 中文卖点列表 | 是 | 否 |
| `features_en` | `Json` | 否 | 英文卖点列表 | 是 | 否 |
| `coverImage` | `String` | 是 | 主图 | 否 | 否 |
| `gallery` | `Json` | 否 | 图集 | 否 | 否 |
| `technicalDrawings` | `Json` | 否 | 图纸/结构图/尺寸图 | 否 | 否 |
| `specTable` | `Json` | 否 | 参数表 | 否 | 否 |
| `brochureFile` | `String` | 否 | 说明书或 PDF | 否 | 否 |
| `isFeatured` | `Boolean` | 否 | 是否首页推荐 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## NewsCategory

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name_zh` | `String` | 是 | 分类中文名 | 是 | 否 |
| `name_en` | `String` | 否 | 分类英文名 | 是 | 否 |
| `slug` | `String` | 是 | 分类别名，如 `company` | 否 | 是 |
| `summary_zh` | `Text` | 否 | 分类简介 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文简介 | 是 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分类分享图 | 否 | 是 |

## News

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `categoryId` | `String` | 是 | 新闻分类 | 否 | 否 |
| `title_zh` | `String` | 是 | 中文标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `slug` | `String` | 是 | URL 别名 | 否 | 是 |
| `summary_zh` | `Text` | 否 | 新闻摘要 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 是 | 中文正文 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文正文 | 是 | 否 |
| `coverImage` | `String` | 否 | 封面图 | 否 | 否 |
| `gallery` | `Json` | 否 | 正文插图 | 否 | 否 |
| `publishedAt` | `DateTime` | 是 | 发布时间 | 否 | 否 |
| `source_zh` | `String` | 否 | 来源 | 是 | 否 |
| `source_en` | `String` | 否 | 英文来源 | 是 | 否 |
| `author_zh` | `String` | 否 | 作者/发布人 | 是 | 否 |
| `author_en` | `String` | 否 | 英文作者 | 是 | 否 |
| `isFeatured` | `Boolean` | 否 | 是否首页推荐 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 人工置顶排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## Partner

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name_zh` | `String` | 是 | 合作企业名称 | 是 | 否 |
| `name_en` | `String` | 否 | 英文名称 | 是 | 否 |
| `slug` | `String` | 否 | 唯一别名，便于后续扩展详情 | 否 | 是 |
| `logo` | `String` | 是 | 企业 Logo 图片 | 否 | 否 |
| `websiteUrl` | `String` | 否 | 官网链接 | 否 | 否 |
| `summary_zh` | `Text` | 否 | 合作说明 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文合作说明 | 是 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 显示状态 | 否 | 否 |

## Delivery

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `title_zh` | `String` | 是 | 中文案例标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文案例标题 | 是 | 否 |
| `slug` | `String` | 是 | URL 别名 | 否 | 是 |
| `summary_zh` | `Text` | 否 | 摘要 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 否 | 中文正文 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文正文 | 是 | 否 |
| `coverImage` | `String` | 是 | 封面图 | 否 | 否 |
| `gallery` | `Json` | 否 | 图片集 | 否 | 否 |
| `deliveryDate` | `DateTime` | 否 | 交付日期 | 否 | 否 |
| `location_zh` | `String` | 否 | 地点 | 是 | 否 |
| `location_en` | `String` | 否 | 英文地点 | 是 | 否 |
| `customerName_zh` | `String` | 否 | 客户名称 | 是 | 否 |
| `customerName_en` | `String` | 否 | 英文客户名称 | 是 | 否 |
| `relatedProductId` | `String` | 否 | 关联产品 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## Certificate

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `strengthCategoryId` | `String` | 否 | 所属企业实力分类 | 否 | 否 |
| `title_zh` | `String` | 是 | 证书名称 | 是 | 否 |
| `title_en` | `String` | 否 | 英文证书名称 | 是 | 否 |
| `slug` | `String` | 否 | 详情别名 | 否 | 是 |
| `type` | `String` | 否 | 证书类型 | 否 | 否 |
| `coverImage` | `String` | 是 | 证书图片 | 否 | 否 |
| `issuer_zh` | `String` | 否 | 发证机构 | 是 | 否 |
| `issuer_en` | `String` | 否 | 英文发证机构 | 是 | 否 |
| `issuedAt` | `DateTime` | 否 | 发证日期 | 否 | 否 |
| `validUntil` | `DateTime` | 否 | 有效期 | 否 | 否 |
| `certificateNo` | `String` | 否 | 证书编号 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |

## ContactMessage

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` | 是 | 留言人姓名 | 否 | 否 |
| `phone` | `String` | 是 | 联系电话 | 否 | 否 |
| `email` | `String` | 否 | 邮箱 | 否 | 否 |
| `company` | `String` | 否 | 公司名 | 否 | 否 |
| `message` | `Text` | 是 | 留言内容 | 否 | 否 |
| `sourcePage` | `String` | 否 | 来自哪个页面 | 否 | 否 |
| `productId` | `String` | 否 | 关联咨询产品 | 否 | 否 |
| `status` | `Enum` | 是 | 建议单独枚举：`new | processing | resolved | spam` | 否 | 否 |
| `handledAt` | `DateTime` | 否 | 处理时间 | 否 | 否 |
| `handlerId` | `String` | 否 | 处理人 | 否 | 否 |
| `replyNote` | `Text` | 否 | 后台处理备注 | 否 | 否 |

## CompanyInfo

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `companyName_zh` | `String` | 是 | 公司全称 | 是 | 否 |
| `companyName_en` | `String` | 否 | 英文全称 | 是 | 否 |
| `shortName_zh` | `String` | 否 | 公司简称 | 是 | 否 |
| `shortName_en` | `String` | 否 | 英文简称 | 是 | 否 |
| `hotline` | `String` | 否 | 服务热线 | 否 | 否 |
| `phone` | `String` | 否 | 固话 | 否 | 否 |
| `email` | `String` | 否 | 企业邮箱 | 否 | 否 |
| `address_zh` | `String` | 是 | 中文地址 | 是 | 否 |
| `address_en` | `String` | 否 | 英文地址 | 是 | 否 |
| `latitude` | `Decimal` | 否 | 地图纬度 | 否 | 否 |
| `longitude` | `Decimal` | 否 | 地图经度 | 否 | 否 |
| `mapEmbedUrl` | `String` | 否 | 嵌入地图地址 | 否 | 否 |
| `workingHours_zh` | `String` | 否 | 营业时间 | 是 | 否 |
| `workingHours_en` | `String` | 否 | 英文营业时间 | 是 | 否 |
| `wechatQr` | `String` | 否 | 微信二维码 | 否 | 否 |
| `tiktokQr` | `String` | 否 | 抖音二维码 | 否 | 否 |
| `recordNumber` | `String` | 否 | ICP/公安备案号 | 否 | 否 |
| `copyright_zh` | `String` | 否 | 中文版权文案 | 是 | 否 |
| `copyright_en` | `String` | 否 | 英文版权文案 | 是 | 否 |

## AboutSection

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `sectionKey` | `String` | 是 | 标识 `company` / `organization` 等 | 否 | 否 |
| `title_zh` | `String` | 是 | 标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `summary_zh` | `Text` | 否 | 摘要 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 是 | 中文正文 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文正文 | 是 | 否 |
| `coverImage` | `String` | 否 | 封面图 | 否 | 否 |
| `gallery` | `Json` | 否 | 图集 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## TimelineEvent

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `year` | `Int` | 是 | 年份 | 否 | 否 |
| `month` | `Int` | 否 | 月份 | 否 | 否 |
| `title_zh` | `String` | 是 | 节点标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文节点标题 | 是 | 否 |
| `summary_zh` | `Text` | 否 | 简述 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文简述 | 是 | 否 |
| `content_zh` | `Text` | 否 | 完整说明 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文完整说明 | 是 | 否 |
| `image` | `String` | 否 | 配图 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |

## ChairmanMessage

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name_zh` | `String` | 是 | 姓名 | 是 | 否 |
| `name_en` | `String` | 否 | 英文姓名 | 是 | 否 |
| `position_zh` | `String` | 否 | 职务 | 是 | 否 |
| `position_en` | `String` | 否 | 英文职务 | 是 | 否 |
| `portraitImage` | `String` | 否 | 人像图 | 否 | 否 |
| `message_zh` | `Text` | 是 | 中文寄语 | 是 | 否 |
| `message_en` | `Text` | 否 | 英文寄语 | 是 | 否 |
| `signatureImage` | `String` | 否 | 签名图 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## CultureValue

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `title_zh` | `String` | 是 | 价值项标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `subtitle_zh` | `String` | 否 | 短句/口号 | 是 | 否 |
| `subtitle_en` | `String` | 否 | 英文短句 | 是 | 否 |
| `description_zh` | `Text` | 否 | 中文说明 | 是 | 否 |
| `description_en` | `Text` | 否 | 英文说明 | 是 | 否 |
| `icon` | `String` | 否 | 图标资源 | 否 | 否 |
| `image` | `String` | 否 | 配图 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |

## StrengthCategory

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name_zh` | `String` | 是 | 分类中文名 | 是 | 否 |
| `name_en` | `String` | 否 | 英文名 | 是 | 否 |
| `slug` | `String` | 是 | 如 `honors` / `equipment` | 否 | 是 |
| `summary_zh` | `Text` | 否 | 分类简介 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文简介 | 是 | 否 |
| `bannerImage` | `String` | 否 | Banner 图 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## StrengthItem

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `categoryId` | `String` | 是 | 所属企业实力分类 | 否 | 否 |
| `title_zh` | `String` | 是 | 条目标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `slug` | `String` | 否 | 详情别名 | 否 | 是 |
| `summary_zh` | `Text` | 否 | 摘要 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 否 | 详细说明 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文说明 | 是 | 否 |
| `coverImage` | `String` | 是 | 封面图 | 否 | 否 |
| `gallery` | `Json` | 否 | 图集 | 否 | 否 |
| `meta_zh` | `String` | 否 | 补充信息，如颁奖单位/设备型号 | 是 | 否 |
| `meta_en` | `String` | 否 | 英文补充信息 | 是 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## ServiceSection

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `serviceType` | `String` | 是 | `after-sales` / `online-support` / `sales-network` | 否 | 否 |
| `title_zh` | `String` | 是 | 标题 | 是 | 否 |
| `title_en` | `String` | 否 | 英文标题 | 是 | 否 |
| `summary_zh` | `Text` | 否 | 摘要 | 是 | 否 |
| `summary_en` | `Text` | 否 | 英文摘要 | 是 | 否 |
| `content_zh` | `Text` | 否 | 中文正文 | 是 | 否 |
| `content_en` | `Text` | 否 | 英文正文 | 是 | 否 |
| `coverImage` | `String` | 否 | 封面图 | 否 | 否 |
| `attachments` | `Json` | 否 | 附件、说明文件、联系电话等扩展 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |

## SalesOutlet

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `name_zh` | `String` | 是 | 网点名称 | 是 | 否 |
| `name_en` | `String` | 否 | 英文名称 | 是 | 否 |
| `region_zh` | `String` | 否 | 所属大区 | 是 | 否 |
| `region_en` | `String` | 否 | 英文大区 | 是 | 否 |
| `city_zh` | `String` | 否 | 城市 | 是 | 否 |
| `city_en` | `String` | 否 | 英文城市 | 是 | 否 |
| `contactPerson_zh` | `String` | 否 | 联系人 | 是 | 否 |
| `contactPerson_en` | `String` | 否 | 英文联系人 | 是 | 否 |
| `phone` | `String` | 否 | 电话 | 否 | 否 |
| `email` | `String` | 否 | 邮箱 | 否 | 否 |
| `address_zh` | `String` | 否 | 地址 | 是 | 否 |
| `address_en` | `String` | 否 | 英文地址 | 是 | 否 |
| `latitude` | `Decimal` | 否 | 纬度 | 否 | 否 |
| `longitude` | `Decimal` | 否 | 经度 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 上下架状态 | 否 | 否 |

## SeoMeta

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `pageType` | `String` | 是 | 页面类型，如 `product` / `news` / `custom` | 否 | 是 |
| `entityId` | `String` | 否 | 关联实体 ID | 否 | 是 |
| `routePath` | `String` | 是 | 覆盖的前台路径 | 否 | 是 |
| `seoTitle_zh` | `String` | 否 | 中文 SEO 标题 | 是 | 是 |
| `seoTitle_en` | `String` | 否 | 英文 SEO 标题 | 是 | 是 |
| `seoDescription_zh` | `Text` | 否 | 中文 SEO 描述 | 是 | 是 |
| `seoDescription_en` | `Text` | 否 | 英文 SEO 描述 | 是 | 是 |
| `seoKeywords_zh` | `String` | 否 | 中文关键词 | 是 | 是 |
| `seoKeywords_en` | `String` | 否 | 英文关键词 | 是 | 是 |
| `ogImage` | `String` | 否 | 分享图 | 否 | 是 |
| `canonicalUrl` | `String` | 否 | 规范 URL | 否 | 是 |
| `noIndex` | `Boolean` | 否 | 是否禁止索引 | 否 | 是 |

## AdminUser

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `username` | `String` | 是 | 登录账号 | 否 | 否 |
| `passwordHash` | `String` | 是 | 加密密码 | 否 | 否 |
| `displayName` | `String` | 是 | 显示名称 | 否 | 否 |
| `email` | `String` | 否 | 邮箱 | 否 | 否 |
| `phone` | `String` | 否 | 手机号 | 否 | 否 |
| `role` | `String` | 是 | 角色，如 `super_admin` / `editor` | 否 | 否 |
| `avatar` | `String` | 否 | 头像 | 否 | 否 |
| `lastLoginAt` | `DateTime` | 否 | 最近登录时间 | 否 | 否 |
| `isActive` | `Boolean` | 是 | 是否启用 | 否 | 否 |

## SiteSetting

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `siteName_zh` | `String` | 是 | 网站中文名 | 是 | 否 |
| `siteName_en` | `String` | 否 | 网站英文名 | 是 | 否 |
| `logoPrimary` | `String` | 否 | 主 Logo | 否 | 否 |
| `logoFooter` | `String` | 否 | 页脚 Logo | 否 | 否 |
| `headerHotline` | `String` | 否 | 头部热线 | 否 | 否 |
| `defaultLocale` | `String` | 是 | 默认语言 | 否 | 否 |
| `supportedLocales` | `Json` | 是 | 支持语言列表 | 否 | 否 |
| `footerText_zh` | `Text` | 否 | 页脚说明 | 是 | 否 |
| `footerText_en` | `Text` | 否 | 英文页脚说明 | 是 | 否 |
| `socialLinks` | `Json` | 否 | 社交链接配置 | 否 | 否 |
| `floatingTools` | `Json` | 否 | 右侧浮动工具条配置 | 否 | 否 |

## NavigationItem

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `menuKey` | `String` | 是 | 所属菜单，如 `header` / `footer` | 否 | 否 |
| `parentId` | `String` | 否 | 父级菜单 | 否 | 否 |
| `label_zh` | `String` | 是 | 菜单中文名 | 是 | 否 |
| `label_en` | `String` | 否 | 菜单英文名 | 是 | 否 |
| `path` | `String` | 是 | 跳转路径 | 否 | 否 |
| `target` | `String` | 否 | 打开方式 | 否 | 否 |
| `icon` | `String` | 否 | 图标 | 否 | 否 |
| `sortOrder` | `Int` | 否 | 排序 | 否 | 否 |
| `status` | `Enum` | 是 | 显示状态 | 否 | 否 |

## MediaAsset

| 字段名 | 类型 | 是否必填 | 用途说明 | 是否双语 | 是否 SEO |
| --- | --- | --- | --- | --- | --- |
| `fileName` | `String` | 是 | 文件名 | 否 | 否 |
| `fileUrl` | `String` | 是 | 文件地址 | 否 | 否 |
| `mimeType` | `String` | 是 | 文件类型 | 否 | 否 |
| `width` | `Int` | 否 | 图片宽度 | 否 | 否 |
| `height` | `Int` | 否 | 图片高度 | 否 | 否 |
| `sizeBytes` | `Int` | 否 | 文件大小 | 否 | 否 |
| `folder` | `String` | 否 | 素材目录 | 否 | 否 |
| `alt_zh` | `String` | 否 | 中文替代文本 | 是 | 否 |
| `alt_en` | `String` | 否 | 英文替代文本 | 是 | 否 |

## 4. 建模结论

- 第一阶段前端样板至少要有：`Banner`、`ProductCategory`、`Product`、`NewsCategory`、`News`、`CompanyInfo`、`SiteSetting`
- 第二阶段后端与后台重点是：`Product`、`News`、`Delivery`、`ContactMessage`、`AdminUser`
- 若想把头部导航、页脚、浮动工具条也纳入后台配置，`NavigationItem` 与 `SiteSetting` 不建议省略
- 发展历程、企业文化、董事长寄语等内容量不大，但为了可维护性，仍建议建模，不建议写死


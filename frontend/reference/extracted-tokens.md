# Extracted Tokens

基准：仅依据 `reference/target-computed-styles.md`、`reference/target-header.html`、`reference/target-hero.html`、`reference/target-footer.html`、`reference/target-styles-1.css` 到 `reference/target-styles-5.css`。

## 颜色 Tokens

| Token | 值 | 用途 | 出处 | 备注 |
| --- | --- | --- | --- | --- |
| `color-brand-primary` | `#D01129` / `rgb(208, 17, 41)` | 语言切换器主红、品牌强调色 | `reference/target-computed-styles.md:88-91,105-108,139-141`; `reference/target-styles-2.css:2453-2458` | 必须保留为该红色 |
| `color-brand-secondary` | `#f90` | 次级橙色渐变/交互色 | `reference/target-styles-2.css:2454-2456`; `reference/target-styles-5.css:15-26` | 与主红并存，非主色 |
| `color-text-primary` | `#333333` / `rgb(51, 51, 51)` | Header 导航主文字 | `reference/target-computed-styles.md:31-35`; `reference/target-styles-2.css:1131-1135` | 对标桌面导航主文字 |
| `color-text-secondary` | `#666666` | Header 二级菜单文字 | `reference/target-styles-2.css:754-762` | 用于下拉菜单 |
| `color-text-inverse` | `#FFFFFF` | Hero、Footer、语言切换器白字 | `reference/target-computed-styles.md:46,58,70,91`; `reference/target-styles-2.css:1458,1549,1705,1770,1778,2925,2998,3112` | 贯穿首屏与 Footer |
| `color-text-footer-muted` | `rgba(255, 255, 255, 0.5)` | Footer 二级导航文字 | `reference/target-styles-2.css:1463-1470` | Hover 才提亮为纯白 |
| `color-text-footer-soft` | `rgba(255, 255, 255, 0.7)` | Footer 版权/建站信息 | `reference/target-styles-2.css:1576-1583` | 次级正文 |
| `color-bg-footer` | `rgb(82 82 82)` | Footer 视觉深灰背景 | `reference/target-styles-2.css:1357-1365` | 与 `e_container-31` 自身透明不同 |
| `color-bg-hero-overlay` | `#000000` + `opacity: 0.5` | Hero 图片暗罩 | `reference/target-styles-2.css:3050-3061` | 遮罩在伪元素上 |
| `color-border-cta` | `rgba(255, 255, 255, 0.33)` | Hero CTA 边框 | `reference/target-computed-styles.md:64-66,123-127`; `reference/target-styles-2.css:2991-2995` | 透明胶囊边框 |
| `color-border-footer-divider` | `rgba(255, 255, 255, 0.23)` | Footer 分割线 | `reference/target-styles-2.css:1512-1519` | 上边框 1px |
| `color-bg-language` | `rgb(208, 17, 41)` | 语言切换器选中底色 | `reference/target-computed-styles.md:88-96`; `reference/target-styles-2.css:425-430` | 与品牌主红一致 |

## 字体 Tokens

| Token | 值 | 用途 | 出处 | 备注 |
| --- | --- | --- | --- | --- |
| `font-family-zh-ui` | `"PingFang SC", PingFangSC-Semibold/Regular` | Header 导航、Hero h2、CTA 中文 | `reference/target-computed-styles.md:31-35,42-46,71-74,143-147` | 中文主字体栈已明确 |
| `font-family-system` | `-apple-system, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif` | Hero 大口号 `p.yx_Summary`、Footer 容器继承 | `reference/target-computed-styles.md:55-59,83-85` | 非 PingFang |
| `font-family-display-en` | `Impact` | Hero 装饰字 `TIANTENG` | `reference/target-computed-styles.md:97-101,143-145`; `reference/target-styles-2.css:2909-2923` | 英文装饰字 |
| `font-family-icon` | `yx_icon` | CTA 箭头等图标 | `reference/target-computed-styles.md:146`; `reference/target-styles-4.css:26-35` | 图标字体 |
| `font-family-icon-alt` | `liciumfont2022-regular` | Header 语言/壳层图标体系 | `reference/target-computed-styles.md:94-96,146`; `reference/target-styles-2.css:151-158,370-375,785-788` | 需人工确认具体加载方式 |
| `font-nav-desktop` | `17px / 700 / 90px` | Header 一级导航链接 | `reference/target-computed-styles.md:25-35,119-122`; `reference/target-styles-2.css:1279-1284` | 默认规则 18px，但 1440 以下桌面实际改成 17px |
| `font-hero-title` | `32px / 400 / 32px` | Hero `h2.hTwo` | `reference/target-computed-styles.md:37-48`; `reference/target-styles-2.css:2944-2950` | 小字装饰标题 |
| `font-hero-slogan` | `44px / 700 / 44px` | Hero `p.yx_Summary` | `reference/target-computed-styles.md:49-60,114-117`; `reference/target-styles-2.css:3107-3115` | 真正主标题 |
| `font-cta` | `14px / 400` | Hero CTA 文案 | `reference/target-computed-styles.md:62-74`; `reference/target-styles-4.css:79-80`; `reference/target-styles-2.css:2991-2999` | `var(--yx_FS16)` 在桌面缩放时会降到 14px |
| `font-footer-nav-primary` | `18px` | Footer 一级栏目标题 | `reference/target-styles-2.css:1455-1460` | 白色 |
| `font-footer-nav-secondary` | `14px` | Footer 二级菜单文字 | `reference/target-styles-2.css:1463-1470` | 微软雅黑 |
| `font-footer-hotline` | `30px / line-height: 1 / family: "84c96d2b-aec6-4a37-8def-59d83015b598"` | Footer 热线数字 | `reference/target-styles-2.css:1773-1780`; `reference/target-styles-5.css:44-47` | 字体 alias 为 `Gilroy-ExtraBold`，需人工确认是否必须引入 |

## 间距与布局 Tokens

| Token | 值 | 用途 | 出处 | 备注 |
| --- | --- | --- | --- | --- |
| `size-header-container-height` | `180px` | Header 容器/导航项高度基准 | `reference/target-computed-styles.md:9-18,25-35` | 导航项本身高度也是 180px |
| `size-logo` | `202px × 58.688px` | Header Logo 图 | `reference/target-computed-styles.md:19-24`; `reference/target-styles-2.css:194-199` | CSS 只给了 `max-width: 202px` |
| `space-nav-horizontal` | `padding-inline: 8.336px` | 导航链接左右内边距 | `reference/target-computed-styles.md:25-29`; `reference/target-styles-2.css:1279-1284` | CSS 用 `0.8vw`，computed 给出实际像素 |
| `size-language-switch` | `142px × 90px` | 语言切换器外层尺寸 | `reference/target-computed-styles.md:88-96` | 对标资料只给 computed |
| `size-language-switch-padding` | `0 20px` | 语言切换器内容间距 | `reference/target-computed-styles.md:88-96`; `reference/target-styles-2.css:425-430` | 红底白字条块 |
| `layout-hero-content-top` | `top: 55%; transform: translate(-50%, -50%)` | Hero 文案整体垂直位置 | `reference/target-styles-2.css:2899-2907` | 不是严格几何居中 |
| `layout-hero-content-width` | `width: 90%` | Hero 文案层宽度 | `reference/target-styles-2.css:2899-2907` | 与 `.yx_Width` 的 `88%` 共存 |
| `layout-content-width-desktop` | `88%` | 通用宽度容器 `.yx_Width` | `reference/target-styles-4.css:288-291` | 手机为 `94%` |
| `space-hero-summary-margin-top` | `22.156px` | Hero 大口号距 h2 间距 | `reference/target-computed-styles.md:49-60` | computed 值最可信 |
| `space-hero-cta-padding` | `12px 30px` | Hero CTA 内边距 | `reference/target-computed-styles.md:62-68`; `reference/target-styles-2.css:2991-2996` | 桌面主值 |
| `space-hero-cta-margin-top` | `44.320px` | Hero CTA 顶部间距 | `reference/target-computed-styles.md:67-68` | CSS 写法为 `margin: 4% auto 0`，computed 更适合作为基准 |
| `size-footer-inner` | `width: 94%; max-width: 1600px` | Footer 主容器 | `reference/target-styles-2.css:1486-1495` | computed 宽度 `1205.080px` 受视口影响 |
| `space-footer-padding` | `padding-top: 3%; padding-bottom: 32px` | Footer 外层上下留白 | `reference/target-styles-2.css:1357-1365` | 顶部是百分比 |
| `space-footer-divider-top` | `32px` | Footer 分割线顶距 | `reference/target-styles-2.css:1512-1519` | 明确 1px 线条前的留白 |
| `space-footer-lower-row-top` | `24px` | Footer 下半区顶距 | `reference/target-styles-2.css:1522-1531` | 版权行上方间距 |
| `space-footer-contact-top` | `20px` | Footer 热线区块顶距 | `reference/target-styles-2.css:1741-1749` | `e_container-90` |
| `size-footer-logo-max` | `185px` | Footer logo 最大宽度 | `reference/target-styles-2.css:1729-1733` | 图像 `object-fit: contain` |

## 圆角 / 阴影 / 边框 Tokens

| Token | 值 | 用途 | 出处 | 备注 |
| --- | --- | --- | --- | --- |
| `radius-cta-pill` | `45px` | Hero CTA 胶囊圆角 | `reference/target-computed-styles.md:64-68,123-127` | computed 值优先 |
| `radius-language-switch` | `0` | 语言切换器直角 | `reference/target-computed-styles.md:88-96` | 明确“无圆角” |
| `shadow-header-outer` | `0 0 15px rgb(0 0 0 / 20%)` | Header 外层阴影 | `reference/target-styles-2.css:108-121,131-141` | 作用在外层固定容器，不是 `e_container-13` |
| `shadow-cta-default` | `none` | Hero CTA 默认态 | `reference/target-computed-styles.md:123-127` | 明确“没有阴影” |
| `shadow-cta-hover` | `2px 6px 14px rgba(0,0,0,0.1)` | Hero CTA hover 态 | `reference/target-styles-2.css:3026-3030` | 默认态不该带阴影 |

## 断点 Tokens

| Token | 值 | 用途 | 出处 | 备注 |
| --- | --- | --- | --- | --- |
| `bp-xs` | `414px` | 基础容器断点 | `reference/target-styles-1.css:327-330` | 旧框架断点 |
| `bp-mobile-max` | `768px` | 手机端上限 | `reference/target-styles-2.css:44-53,798-1118,1841-2060`; `reference/target-styles-4.css:343-392`; `reference/target-styles-5.css:119-133` | 组件级主移动断点 |
| `bp-tablet-min` | `769px` | 平板/桌面起点 | `reference/target-styles-1.css:333-336`; `reference/target-styles-2.css:55-64,1120-1246` | 与手机端断开 |
| `bp-tablet-max` | `1024px` | 平板上限 | `reference/target-styles-1.css:339-342`; `reference/target-styles-2.css:66-75,1248-1277`; `reference/target-styles-4.css:316-341` | 单独控制导航字号 |
| `bp-desktop-min` | `1025px` | 桌面端起点 | `reference/target-styles-2.css:77-78,1279-1284`; `reference/target-styles-4.css:288-314` | 与 1440 联动 |
| `bp-desktop-base` | `1366px` | 大桌面基线 | `reference/target-styles-1.css:345-348`; `reference/target-styles-2.css:3152-3157`; `reference/target-styles-4.css:266-287` | Hero 高度和字体变量调整点 |
| `bp-desktop-wide-max` | `1440px` | 宽桌面压缩点 | `reference/target-styles-2.css:77-78,1279-1284`; `reference/target-styles-4.css:248-265` | 导航从 18px 降到 17px |

## 不确定项

- `font-family-icon-alt` 的实际可用资源名只有 `liciumfont2022-regular`，未看到完整 `@font-face` 声明，标记为 `需人工确认`。
- Hero、Header、Footer 的部分 computed `width`（如 `1117px`、`892.555px`、`1205.080px`）明显受抓取视口影响，不适合作为通用 token；已优先记录 CSS 中可复用的百分比/最大宽度规则。
- Header 存在“外层固定白底 + 内层 `e_container-13` 透明静态”的双层结构：`reference/target-computed-styles.md:9-18,129-132` 与 `reference/target-styles-2.css:108-121` 指向的不是同一层，实施时需要区分。

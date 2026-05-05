# Current Tokens

基准：仅读取当前项目中的 `tailwind.config.ts`、`src/app/globals.css`、`src/styles/theme.css`、`src/components/layout/Header.tsx`、`src/components/home/HeroBanner.tsx`、`src/components/layout/Footer.tsx`。

## 颜色 Tokens

| Token | 当前值 | 定义位置 | 备注 |
| --- | --- | --- | --- |
| `color-brand-primary` | `#004b97` | `src/styles/theme.css:1-5` | 当前品牌主色是蓝色 |
| `color-brand-accent` | `#e60012` | `src/styles/theme.css:2-4` | 当前红色不是 `#D01129` |
| `color-brand-deep` | `#00356b` | `src/styles/theme.css:3-5` | 深蓝色 |
| `color-brand-soft` | `#0f5fae` | `src/styles/theme.css:4-5` | 辅助蓝 |
| `color-neutral-900` | `#333333` | `src/styles/theme.css:6-8`; `tailwind.config.ts:14-18` | 已接近对标主文字色 |
| `color-neutral-700` | `#666666` | `src/styles/theme.css:7-8`; `tailwind.config.ts:14-18` | 已接近对标次级文字色 |
| `color-neutral-500` | `#999999` | `src/styles/theme.css:8`; `tailwind.config.ts:14-18` | 当前浅灰 |
| `color-surface` | `#ffffff` | `src/styles/theme.css:9-11` | 白底 |
| `color-surface-muted` | `#f5f7fa` | `src/styles/theme.css:10-11` | 浅背景 |
| `color-surface-alt` | `#eef3f8` | `src/styles/theme.css:11`; | 浅蓝灰背景 |
| `color-border` | `#e5e7eb` | `src/styles/theme.css:12`; `src/components/layout/Header.tsx:58` | Header 也直接硬编码使用 |
| `color-border-strong` | `rgba(0, 75, 151, 0.12)` | `src/styles/theme.css:13`; `src/app/globals.css:130-133` | 蓝色透明边框 |
| `color-selection` | `rgba(0, 75, 151, 0.16)` | `src/app/globals.css:49-51` | 选中文本高亮 |
| `color-hero-overlay` | `linear-gradient(180deg, rgba(8,18,34,0.24) 0%, rgba(8,18,34,0.36) 26%, rgba(5,16,34,0.62) 100%)` | `src/components/home/HeroBanner.tsx:56` | 当前是多段渐变，不是单层黑罩 |
| `color-hero-radial-overlay` | `radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 42%)` | `src/components/home/HeroBanner.tsx:57` | 对标站未给出该层 |
| `color-hero-cta-hover` | `#c80010` | `src/components/home/HeroBanner.tsx:80` | 硬编码 hover 红 |
| `color-footer-bg` | `#5d5d5d` | `src/components/layout/Footer.tsx:46` | 当前 Footer 深灰 |
| `color-header-title` | `#15345d` | `src/components/layout/Header.tsx:65-67` | 站名蓝色硬编码 |
| `color-header-nav-text` | `#202020` | `src/components/layout/Header.tsx:86-88` | 导航文字色硬编码 |
| `color-mobile-backdrop` | `rgba(0, 22, 47, 0.45)` | `src/components/layout/Header.tsx:161` | 移动抽屉遮罩 |
| `color-en-button` | `#cf0011` | `src/components/layout/Header.tsx:225-229` | 当前 EN 按钮单独硬编码 |

## 字体 Tokens

| Token | 当前值 | 定义位置 | 备注 |
| --- | --- | --- | --- |
| `font-family-body` | `'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif` | `src/app/globals.css:20-27` | 当前全站基础字体栈 |
| `font-header-site-name` | `15px / 600` | `src/components/layout/Header.tsx:65-67` | 站名 |
| `font-header-nav` | `15px / 500` | `src/components/layout/Header.tsx:86-88` | 主导航 |
| `font-header-lang` | `13px / 600` | `src/components/layout/Header.tsx:126-136` | 语言按钮 |
| `font-hero-eyebrow` | `12px -> 13px` | `src/components/home/HeroBanner.tsx:60-64` | 英文眉题 |
| `font-hero-title` | `34px -> 68px / 600` | `src/components/home/HeroBanner.tsx:66-72` | 当前主标题极大 |
| `font-hero-subtitle` | `14px -> 18px` | `src/components/home/HeroBanner.tsx:74-76` | 当前副标题较小 |
| `font-hero-cta` | `14px / 500` | `src/components/home/HeroBanner.tsx:80-83` | 当前按钮字体 |
| `font-footer-brand` | `18px / 600` | `src/components/layout/Footer.tsx:54-55` | Footer 品牌标题 |
| `font-footer-hotline` | `28px / 600` | `src/components/layout/Footer.tsx:58` | 当前热线数字 |
| `font-footer-meta` | `12px / 14px / 16px 混用` | `src/components/layout/Footer.tsx:55,59-62,82-83,96-97,104-125,132-134` | 当前 Footer 使用多档字号 |

## 间距与布局 Tokens

| Token | 当前值 | 定义位置 | 备注 |
| --- | --- | --- | --- |
| `header-top-height` | `0px` | `src/styles/theme.css:14` | CSS 变量 |
| `header-main-height` | `88px` | `src/styles/theme.css:15` | CSS 变量 |
| `header-height` | `88px` | `src/styles/theme.css:16` | CSS 变量 |
| `max-width-content` | `1280px` | `tailwind.config.ts:24-26` | `max-w-content` |
| `size-header-row` | `78px -> 88px` | `src/components/layout/Header.tsx:58-60` | 手机/桌面头部高度 |
| `size-header-logo-box` | `52px -> 58px` 正方形 | `src/components/layout/Header.tsx:61-63` | 当前不是横向 logo 图 |
| `space-header-nav-x` | `18px` | `src/components/layout/Header.tsx:86-88,96-99` | 导航固定像素内边距 |
| `size-header-lang-min-width` | `72px` | `src/components/layout/Header.tsx:126-136` | 两个语言按钮都用最小宽度 |
| `size-header-mobile-trigger` | `44px` | `src/components/layout/Header.tsx:143-149` | 移动端菜单按钮 |
| `size-hero-min-height` | `calc(100vh - 78px)` / `calc(100vh - 88px)` | `src/components/home/HeroBanner.tsx:44-48,58` | 由 Header 高度扣减 |
| `space-hero-container` | `px-4 py-16` / `lg:px-6` | `src/components/home/HeroBanner.tsx:58` | 当前 Hero 内边距 |
| `space-hero-title-top` | `mt-8` | `src/components/home/HeroBanner.tsx:66-72` | 标题上间距 |
| `space-hero-subtitle-top` | `mt-6` | `src/components/home/HeroBanner.tsx:74` | 副标题上间距 |
| `space-hero-cta-top` | `mt-10` | `src/components/home/HeroBanner.tsx:77` | CTA 上间距 |
| `size-hero-cta` | `min-height: 48px -> 52px; px-8 -> px-10` | `src/components/home/HeroBanner.tsx:80` | 当前是实心按钮 |
| `size-hero-pagination-bullet` | `34px × 3px` | `src/app/globals.css:66-76` | 轮播分页条 |
| `size-hero-arrow` | `48px × 48px` | `src/components/home/HeroBanner.tsx:97-104` | 桌面轮播箭头 |
| `space-footer-section` | `px-4 py-16; lg:px-6; gap-10; xl:gap-14` | `src/components/layout/Footer.tsx:47` | 当前 Footer 主区块 |
| `size-footer-logo-box` | `64px × 64px` | `src/components/layout/Footer.tsx:50-52` | 当前 Footer Logo 框 |
| `size-footer-social` | `40px × 40px` | `src/components/layout/Footer.tsx:63-78` | 社媒圆点 |
| `space-footer-bottom` | `px-4 py-5; lg:px-6` | `src/components/layout/Footer.tsx:131-135` | Footer 底部版权区 |

## 圆角 / 阴影 / 边框 Tokens

| Token | 当前值 | 定义位置 | 备注 |
| --- | --- | --- | --- |
| `radius-card` | `28px` | `src/styles/theme.css:17` | 全局卡片圆角 |
| `shadow-card` | `0 22px 60px rgba(15, 38, 75, 0.08)` | `src/styles/theme.css:18`; `tailwind.config.ts:20-23` | Tailwind `shadow-soft` |
| `shadow-header` | `0 12px 36px rgba(12, 34, 69, 0.12)` | `src/styles/theme.css:19`; `tailwind.config.ts:20-23` | Tailwind `shadow-header` |
| `shadow-header-scrolled-inline` | `0 16px 40px rgba(12,26,53,0.14)` | `src/components/layout/Header.tsx:53-56` | Header 滚动态硬编码阴影 |
| `radius-hero-cta` | `rounded-sm` | `src/components/home/HeroBanner.tsx:80` | 当前不是胶囊 |
| `radius-hero-arrow` | `rounded-full` | `src/components/home/HeroBanner.tsx:97-104` | 箭头按钮 |

## 断点与定义方式

- `tailwind.config.ts:5-27` 未显式扩展 `screens`，仓内没有自定义断点 token。
- 当前组件直接依赖 Tailwind 预设前缀（如 `sm:`、`lg:`、`xl:`），但这些数值没有在当前仓内显式声明，若要与对标站的 `768/769/1024/1025/1366/1440` 精确对齐，需人工确认。

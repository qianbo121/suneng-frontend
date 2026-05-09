# Diff Report

说明：`严重度` 规则按用户要求执行。`对标值` 优先采用 computed value；若 computed 不足，再补充 CSS 规则。

| 维度 | 对标值 | 当前值 | 对标出处 | 当前出处 | 严重度 |
| --- | --- | --- | --- | --- | --- |
| 品牌主红 | `#D01129` / `rgb(208, 17, 41)` | `#e60012` | `reference/target-computed-styles.md:105-108,139-141`; `reference/target-styles-2.css:2453-2458` | `src/styles/theme.css:2-4` | P0 |
| Header 主高度 | `180px` | `78px` 移动 / `88px` 桌面 | `reference/target-computed-styles.md:9-18,25-35` | `src/styles/theme.css:15-16`; `src/components/layout/Header.tsx:58-60` | P0 |
| Header Logo 尺寸/形态 | `202px × 58.688px` 横向图 | `52px -> 58px` 正方形占位框 | `reference/target-computed-styles.md:19-24`; `reference/target-styles-2.css:194-199` | `src/components/layout/Header.tsx:61-63` | P0 |
| 导航字号与字重 | `17px / 700` | `15px / 500` | `reference/target-computed-styles.md:25-35`; `reference/target-styles-2.css:1279-1284` | `src/components/layout/Header.tsx:86-88` | P0 |
| 导航垂直节奏 | `height: 180px` + `line-height: 90px` | `88px` 高度内居中对齐 | `reference/target-computed-styles.md:25-35,119-122`; `reference/target-styles-2.css:731-739` | `src/components/layout/Header.tsx:59,73-120` | P0 |
| Header 语言切换器 | 单个 `142 × 90` 红色直角块，`padding: 0 20px` | 两个 `min-w-[72px]` 小按钮 | `reference/target-computed-styles.md:88-96`; `reference/target-styles-2.css:425-430` | `src/components/layout/Header.tsx:121-140` | P0 |
| Header 首屏视觉 | 内层容器透明叠在 Hero 上 | 白底 `bg-white/98` + `backdrop-blur` 固定栏 | `reference/target-computed-styles.md:129-132`; `reference/target-styles-2.css:108-121` | `src/components/layout/Header.tsx:52-59` | P0 |
| Hero 标题层级 | `h2` 仅 `32px`；`p.yx_Summary` 才是 `44px` 主口号 | 当前主标题 `34px -> 68px`，副标题仅 `14px -> 18px` | `reference/target-computed-styles.md:37-60,114-117`; `reference/target-styles-2.css:2944-2950,3107-3115` | `src/components/home/HeroBanner.tsx:65-76` | P0 |
| Hero 主口号字号 | `44px / 700 / 44px` | `68px / 600` | `reference/target-computed-styles.md:49-60`; `reference/target-styles-2.css:3107-3115` | `src/components/home/HeroBanner.tsx:66-72` | P0 |
| Hero CTA 主样式 | 透明胶囊；`border: 2px solid rgba(255,255,255,0.33)`；`radius: 45px`；无底色 | 实心红色 `rounded-sm` 按钮 | `reference/target-computed-styles.md:62-74,123-127`; `reference/target-styles-2.css:2991-3003` | `src/components/home/HeroBanner.tsx:77-83` | P0 |
| Hero 装饰字 | 存在 `Impact` 字体的 `SUNENG` 大装饰字 | 缺失 | `reference/target-computed-styles.md:97-101,143-145`; `reference/target-styles-2.css:2909-2937` | `src/components/home/HeroBanner.tsx:58-85` | P0 |
| Footer 背景色 | `rgb(82 82 82)` | `#5d5d5d` | `reference/target-styles-2.css:1357-1365` | `src/components/layout/Footer.tsx:46` | P0 |
| Footer 热线字号/字体 | `30px`，自定义字体 `"84c96d2b-aec6-4a37-8def-59d83015b598"` | `28px / 600` 默认字体栈 | `reference/target-styles-2.css:1773-1780`; `reference/target-styles-5.css:44-47` | `src/components/layout/Footer.tsx:58`; `src/app/globals.css:20-27` | P0 |
| Footer 一级导航 | `18px` 白字 | `text-sm` / `text-white/78` | `reference/target-styles-2.css:1455-1460` | `src/components/layout/Footer.tsx:82-101` | P0 |
| Header hover 反馈 | 一级导航 hover 为整块主红背景上升 | 当前仅 3px 下划线显现 | `reference/target-styles-2.css:1147-1162` | `src/components/layout/Header.tsx:95-100` | P1 |
| Header 导航横向间距 | `0.8vw`（computed 约 `8.336px`） | 固定 `18px` | `reference/target-computed-styles.md:28`; `reference/target-styles-2.css:1279-1284` | `src/components/layout/Header.tsx:86-88` | P1 |
| Hero 文案垂直位置 | `top: 55%`，非几何正中 | `items-center` 纯居中 | `reference/target-styles-2.css:2899-2907` | `src/components/home/HeroBanner.tsx:58-59` | P1 |
| Hero 遮罩处理 | 单层 `#000`，`opacity: 0.5` | 深色线性渐变 + 径向高光 | `reference/target-styles-2.css:3050-3061` | `src/components/home/HeroBanner.tsx:56-57` | P1 |
| Hero CTA 顶距 | `44.320px` | `mt-10`（约 `40px`） | `reference/target-computed-styles.md:67-68` | `src/components/home/HeroBanner.tsx:77` | P1 |
| Footer 主容器宽度 | `94%`，`max-width: 1600px` | `max-width: 1280px` | `reference/target-styles-2.css:1486-1495` | `tailwind.config.ts:24-26`; `src/components/layout/Footer.tsx:47,132` | P1 |
| Footer 上下留白 | `padding-top: 3%`；`padding-bottom: 32px` | `py-16`（统一 64px） | `reference/target-styles-2.css:1357-1365` | `src/components/layout/Footer.tsx:47` | P1 |
| Footer 分割线 | `1px` + `rgba(255,255,255,0.23)` + `margin-top: 32px` | `border-white/10`，无 32px 顶距层次 | `reference/target-styles-2.css:1512-1519` | `src/components/layout/Footer.tsx:131` | P1 |
| Footer 二级导航文字 | `14px`，`rgba(255,255,255,0.5)` | `text-sm`，`text-white/78` | `reference/target-styles-2.css:1463-1470` | `src/components/layout/Footer.tsx:83-101` | P1 |
| Footer Logo 尺寸 | `max-width: 185px` 的横向 logo 图 | `64px × 64px` 方形 logo 框 | `reference/target-styles-2.css:1729-1738` | `src/components/layout/Footer.tsx:50-52` | P1 |
| 次级品牌色 | 存在 `#f90` 辅助橙色 | 仓内无对应 token | `reference/target-styles-2.css:2454-2456`; `reference/target-styles-5.css:15-26` | `src/styles/theme.css:1-20`; `tailwind.config.ts:5-27` | P2 |
| CTA hover 细节 | hover 时按钮主红、图标反白反转 | 当前仅按钮背景变深，无图标反转 | `reference/target-styles-2.css:3014-3035` | `src/components/home/HeroBanner.tsx:78-83` | P2 |
| 自定义断点体系 | 明确使用 `768/769/1024/1025/1366/1440` | 仓内未显式声明自定义 `screens` | `reference/target-styles-1.css:327-348`; `reference/target-styles-2.css:44-78,1248-1284`; `reference/target-styles-4.css:248-392` | `tailwind.config.ts:3-29` | P2 |
| Footer 移动折叠结构 | 移动端会把 Footer 导航折叠成可展开列表 | 当前仍为静态网格/段落布局 | `reference/target-styles-2.css:1889-1939` | `src/components/layout/Footer.tsx:47-137` | P2 |

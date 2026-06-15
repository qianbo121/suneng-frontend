# 图片资产压缩与清理任务

## 背景

原始 `frontend/public` 约 211M，800KB 以上图片约 115 个。2026-06-15 已完成第一轮同格式无路径变更压缩，当前 `frontend/public/images` 约 116M，800KB 以上图片约 53 个。该问题会影响：

- 仓库 clone / CI checkout 体积
- Docker 构建上下文和镜像体积
- 首页、产品页、新闻页的首屏加载
- 后续图片替换和视觉验收成本

本任务应独立执行，不与功能开发、SEO 文案、导航调整混在同一 PR。

## 优先范围

先处理以下目录：

1. `frontend/public/images/home`
2. `frontend/public/images/products`
3. `frontend/public/images/news`
4. `frontend/public/images/about`

暂不处理：

- logo / QR code / icon 等小图
- 用户上传目录
- 未确认展示位置的历史备份图

## 第一轮处理结果

- 处理方式：使用 `sharp` 对已存在展示图进行同格式压缩，不改变文件路径、不改变页面引用、不改图片尺寸。
- 处理数量：109 张。
- 体积变化：`frontend/public/images` 从约 211M 降至约 116M。
- 大图数量：800KB 以上图片从 115 张降至 53 张，未发现超过 1.5M 的图片。
- 验证：`sharp` 可正常读取全部压缩图片；`frontend build` 通过。

## 历史大图样本

| 文件 | 当前大小 |
|---|---:|
| `frontend/public/images/home/hero-industrial-furnace-banner-hd.png` | 3.0M |
| `frontend/public/images/home/hero-industrial-factory-daylight-banner.png` | 2.9M |
| `frontend/public/images/products/annealing-solution-line/gallery/line-02.png` | 2.9M |
| `frontend/public/images/products/copper-wire-annealing-line/gallery/line-02.png` | 2.7M |
| `frontend/public/images/products/roller-mesh-belt-line/gallery/line-02.png` | 2.5M |
| `frontend/public/images/products/product-list-hero.png` | 2.4M |
| `frontend/public/images/news/news-upgrade.png` | 2.2M |
| `frontend/public/images/news/news-detail-main.png` | 2.1M |

## 后续执行策略

1. 按页面截图确认图片实际显示尺寸。
2. 对照片类 PNG 优先转为 WebP 或高质量 JPG，并同步替换代码引用。
3. 保留原图备份在本地临时目录，不提交备份图。
4. 替换后逐页检查：首页、产品中心、产品详情页、新闻/资料页、关于页。
5. 对首页首屏和产品页主图做桌面端与 390px 移动端截图验证。

## 验收指标

- `frontend/public` 总体积已下降超过 40%；后续目标是继续降低首屏关键图和产品详情主图体积。
- 单张展示图原则上不超过 800KB；首屏关键图尽量不超过 500KB。
- 图片不变形、不模糊、不出现错误裁剪。
- `pnpm --dir frontend build` 通过。
- `git diff --check` 通过。

## 禁止事项

- 不批量压缩 logo、二维码、图标。
- 不改变图片语义和页面内容。
- 不把备份原图提交到仓库。
- 不在同一个 PR 中混入 SEO 文案或页面结构改动。

# NEXT STEPS

## 今天完成了什么

1. 完整读取并整理了 `reference/` 对标资料，建立了对标 tokens、当前项目 tokens、差异报告三份基线文档。
2. 在 `tailwind.config.ts` 中补齐了对标所需的 Header / Hero / Footer 相关 design tokens，供后续还原复用。
3. 完成了品牌名称替换的基础工作：
   - 更新了 `src/app/layout.tsx` 中的站点标题品牌名
   - 更新了 `src/mock/` 中 Header / Banner 运行时会读取到的品牌名，页面上不再出现旧品牌名
4. 完成了 Header 的 1:1 结构级还原首版：
   - 改成对标的三段式结构：logo / 一级导航+二级菜单 / 单按钮语言切换
   - 去掉了当前项目原有的 logo 旁双行文字展示
   - 把桌面导航改成对标的高栏导航和整块红底 hover
   - 把桌面语言切换改成单个红色按钮 + 下拉
   - 把移动端从右侧抽屉改成更接近对标的全屏覆盖菜单
5. 运行了 `npm run build`，当前代码可以通过构建。

## 今天改过的文件

以下是今天实际修改过的源码/配置/参考文档文件：

- `reference/extracted-tokens.md`
- `reference/current-tokens.md`
- `reference/diff-report.md`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/mock/banners.ts`
- `src/mock/siteSettings.ts`
- `src/components/layout/Header.tsx`

说明：
- `.next/` 目录也因为构建验证发生了大量变化，但这些都是生成产物，不算业务改动文件。

## 未完成事项

1. Header 还缺一个关键衔接：
   - 站点主内容区仍在使用旧的顶部留白，未跟随 `180px` Header 一起调整。
   - 这会导致页面主体与新 Header 的垂直关系还不完整。
2. Header 还有两个次级未闭环点：
   - 语言切换器前的国家/语言图标没有 1:1 还原，因为 `reference/` 未提供对应 symbol 定义。
   - `Header.tsx` 里目前使用的是 `<img>`，构建会给出 Next 的性能提示，但不影响编译通过。
3. Hero 还未开始还原。
4. Footer 还未开始还原。
5. 其余页面与新 Header 的视觉联动还未核对。

## 下次继续的第一步

下次第一步先处理页面主布局顶部留白，让主内容区与 `180px` 的新 Header 对齐。

优先检查：

- `src/app/[locale]/layout.tsx`
- `src/app/not-found.tsx`
- 是否存在其他使用旧 Header 高度的容器或 CSS 变量

目标：

- 把主内容顶部间距从旧的 `78px / 88px` 体系切到新的 Header 高度体系
- 先确保首屏不会被 Header 压住，再继续做 Hero 还原

# 还原工作通用规则（每轮必读）

## Ground Truth
本次还原的唯一参考来源是 /reference/ 目录下的文件。
禁止凭印象、经验、美感判断"像不像"。

## 项目技术栈
- Next.js（App Router）
- TypeScript
- Tailwind CSS
- next-intl（国际化）

## 关键文件定位
- Header: src/components/layout/Header.tsx
- Footer: src/components/layout/Footer.tsx
- Hero:   src/components/home/HeroBanner.tsx
- 全局样式: src/app/globals.css
- Tailwind 配置: tailwind.config.ts
- 其他样式: src/styles/

## 绝对禁区（任何轮次都不允许碰）
- src/messages/           （多语言文案）
- src/i18n/               （i18n 配置）
- src/middleware.ts       （路由中间件）
- src/app/[locale]/ 下的 page.tsx 路由文件（除非明确允许）
- src/mock/
- src/lib/
- src/hooks/
- src/types/
- backend/、admin/、deploy/、docs/（非本项目）

## 文本与文案
- 禁止在组件里硬编码任何显示文本
- 所有文本必须通过 useTranslations 读取
- 修改样式时如果涉及文本，只改样式，不改文本内容

## 数值与来源
每处样式改动必须能追溯到 /reference/ 下某个文件的具体位置。
禁止使用"大约""差不多""看起来更好""更协调""已优化"这类模糊描述。

## 范围铁律
本轮范围之外的文件一个字都不改。即使发现问题，也只记录不修改。

## 不确定时
/reference/ 资料不足时，停下来问，不要猜。

## 每轮输出必须包含
1. 本轮修改的文件清单
2. 每处改动：改前值 → 改后值 → 对标依据（具体文件 + 行号）
3. 未修复项清单
4. 新增的 token（如有）

### 说明：Hero 的字号层级跟常规设计反直觉
- h2 主标题 "——天腾重机—" 其实是小字（32px），起装饰作用
- p.yx_Summary "用心对待客户 用心对待员工 用心对待工作" 才是真正最大的口号（44px，粗体）
- 这种"小标题 + 大口号"的反常层级在企业官网 banner 里常见
- Codex 如果按常规 h2 大、p 小的思路做，视觉就反了

### Footer 设计注意
- Footer 整体视觉是深蓝色，但 e_container-31 自身背景透明
- 深色背景可能来自：
  a) 祖先元素（如 content_box / c_grid / body）的 background-color
  b) 伪元素 ::before / ::after 的背景层
  c) 某张深色背景图
- Codex 还原 Footer 时，深色背景要做在合适的层级，不要直接给最外层容器加 background-color
- 文字默认色 rgb(33, 37, 41) 是深色（几乎黑色）——但在深色 Footer 上肯定被子元素覆盖成白色/浅色
- display: flex 说明 Footer 用 flex 布局（内部子元素横排或纵排）
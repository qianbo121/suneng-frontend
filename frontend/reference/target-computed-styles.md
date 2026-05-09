# Target Computed Styles - hbttzj.com

对标站：http://www.hbttzj.com/
抓取日期：2026年4月
抓取环境：Chrome 桌面端全屏模式

---

## 1. Header 容器（div.e_container-13.s_layout.header）
- width: 1117px
- height: 180px
- padding: 0
- margin: 0
- border: 0
- background-color: rgba(0, 0, 0, 0)  /* 透明 */
- display: block
- position: static

## 2. Logo 图片（img）
- width: 202px
- height: 58.688px
- padding: 0
- margin: 0

## 3. 导航链接（a，如"网站首页"）
- width: 58.398px
- height: 180px
- padding: 0 8.336px
- margin: 0
- position: relative
- font-family: "PingFang SC", PingFangSC-Semibold
- font-size: 17px
- font-weight: 700
- color: rgb(51, 51, 51)
- line-height: 90px

## 4. Hero 标题 h2.hTwo（"——苏能重机—"）
- width: 892.555px
- height: 32px
- padding: 0
- margin: 0
- font-family: "PingFang SC", PingFangSC-Regular
- font-size: 32px
- font-weight: 400
- line-height: 32px
- color: rgb(255, 255, 255)
- text-align: center

## 5. Hero 大口号 p.yx_Summary（"用心对待客户 用心对待员工 用心对待工作"）
- width: 1108.160px
- height: 44px
- padding: 0
- margin: 22.156px 0 0 0
- border: 0
- font-family: 系统字体栈（-apple-system, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif）
- font-size: 44px
- font-weight: 700
- color: rgb(255, 255, 255)
- line-height: 44px
- text-align: center

## 6. CTA 按钮（a.yx_BtnBox "关于我们"）
- 内容区: 95.789 × 23.328
- padding: 12px 30px
- border: 2px solid rgba(255, 255, 255, 0.33)
- border-radius: 45px
- margin-top: 44.320px
- 总尺寸: 约 161.789 × 51.328
- background-color: rgba(0, 0, 0, 0)  /* 完全透明 */
- color: rgb(255, 255, 255)
- font-size: 14px
- font-weight: 400
- font-family: "PingFang SC", PingFangSC-Regular

## 7. Footer 容器（div.e_container-31）
- width: 1205.080px
- height: 401.344px
- padding: 0
- margin: 0 38.461px
- border: 0
- background-color: rgba(0, 0, 0, 0)  /* 透明，深色背景在别处 */
- color: rgb(33, 37, 41)               /* 继承值，非实际文字色 */
- font-family: 系统字体栈
- font-size: 14px
- font-weight: 400
- display: flex

## 8. 语言切换器（红色"中文"按钮 li.saf-item）
- 外层容器 div.saf-menu: 142 × 90
- background-color: rgb(208, 17, 41)   /* 品牌主红色 #D01129 */
- color: rgb(255, 255, 255)            /* 白字 */
- padding: 0 20px
- border-radius: 无（直角）
- font-family: liciumfont2022-regular  /* 图标字体 */
- font-size: 14px

## 附录. Hero 装饰字 div.yx_TitImg（"SUNENG"）
- width: 892.555px
- height: 126px
- font-family: Impact
- line-height: 126px

---

## 🎨 品牌色

主红色：**rgb(208, 17, 41)** = **#D01129**
（出现在：语言切换按钮、CTA 小箭头、品牌强调色）

---

## ⚠️ 给 Codex 的重要提醒

### 1. 字号层级反直觉
- h2 主标题"——苏能重机—"是 **32px**（小字装饰）
- p.yx_Summary 大口号"用心对待客户..."是 **44px 粗体**（真正最显眼的字）
- **不要按"h2 大、p 小"的常规思路做**，必须按实际尺寸还原

### 2. 导航链接特殊值
- font-size 是 **17px**（不是常规的 16px 或 18px）
- line-height 是 90px（但容器 height 180px，说明文字不垂直居中，占上半部分）

### 3. CTA 按钮是"玻璃透明胶囊"
- 背景完全透明 rgba(0,0,0,0)
- 边框是半透明白 rgba(255,255,255,0.33)
- 圆角 45px（胶囊形）
- **不是实心按钮、没有阴影**

### 4. Header 背景透明
- Header 叠在 Hero 图上方
- position: static（不是 sticky，滚动后会消失）

### 5. Footer 背景透明
- e_container-31 自身 background-color 是 rgba(0, 0, 0, 0)
- 页面视觉上的深色 Footer 背景实际定义在子层或伪元素
- Codex 实施时：可直接给 Footer 最外层设置深色背景，不用严格还原层级
- color: rgb(33, 37, 41) 只是容器继承值，实际 Footer 文字是白/浅色

### 6. 品牌主红色
- `rgb(208, 17, 41)` / `#D01129`
- 不是 `#FF0000`、`#CC0000` 等近似红色

### 7. 字体栈
- 中文：PingFang SC
- 英文装饰字：Impact
- 图标：liciumfont2022-regular / yx_icon
- Codex 做本地化时，中文用 PingFang SC（macOS）或 Microsoft YaHei（Windows）
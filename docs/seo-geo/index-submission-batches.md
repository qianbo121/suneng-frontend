# GEO 页面索引提交批次

更新时间：2026-07-29

## 执行原则

- 搜索引擎提交只表示收到 URL 变更通知，不代表已抓取、已收录或已进入 AI 引用池。
- 提交后继续通过 nginx 请求日志核对搜索及 AI 爬虫的实际抓取。
- 青山案例的 6 条高风险事实口径补齐前，不加速其当前版本进入索引。

## 第一批：立即提交

1. `https://www.jssngyl.cn/zh/articles/gongye-lu-baojia-canshu`
2. `https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin`
3. `https://www.jssngyl.cn/zh/products/detail/trolley-furnace`
4. `https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line`
5. `https://www.jssngyl.cn/zh/case/jining-support-roller-heat-treatment-line`
6. `https://www.jssngyl.cn/zh/case/henan-annealing-solution-line`

执行记录（2026-07-29）：

- IndexNow：上述 6 个 URL 已提交，接口返回 `HTTP 202`；
- 青山案例：已通过排除参数拦截，未进入本批；
- 百度主动推送：生产与本地均未配置 `BAIDU_PUSH_TOKEN`，本批未执行，不能记为已提交。

## 技术发现批次：中文首页与 11 个产品详情页

触发原因：

- 生产日志显示 ClaudeBot、GPTBot、OAI-SearchBot 与 Bytespider 对深层核心页覆盖不足；
- 中文首页新增 5 个现有权威页的标准 HTML 入口；
- 11 个产品详情页补齐 Product、WebPage 与 Organization 的结构化实体连接，以及现有参数的 `PropertyValue` 输出。

执行记录（2026-07-29）：

- IndexNow：中文首页与 11 个产品详情页共 12 个 URL 已提交，接口返回 `HTTP 200`；
- 青山案例：未作为显式 URL 加入本批；
- 百度主动推送：仍未配置 `BAIDU_PUSH_TOKEN`，本批未执行；
- 提交只代表 IndexNow 接口收到通知，实际抓取与覆盖变化继续以 nginx 日志为准。

## 第二批：证据补齐后单独提交

- `https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation`

放行条件：

1. `SN-CASE-P0-008-F01` 至 `F06` 的技术口径由唐工完成复核；
2. 客户书面确认记录或对应邮件、合同条款、会议纪要编号已录入台账；
3. 63.7 元/吨、120 万吨/年和 7,644 万元/年的统计期、分母、能源价格及底稿编号完整；
4. NOx 结论具备检测机构、报告编号、检测日期、工况和适用标准信息；
5. 页面内容与台账完全一致。

## 深度抓取推进批次：19 个现有核心页

执行日期：2026-07-30

- 范围：生产日志中尚未出现 AI 系统爬虫请求的 20 个核心页，排除仍在证据门内的青山案例，共 19 个 URL；
- 前置动作：AI 搜索/回答爬虫显式放行、真实 `lastmod` / `dateModified`、首页低入链页面直达入口；
- 提交渠道：IndexNow；百度主动推送仅在生产环境存在真实 `BAIDU_PUSH_TOKEN` 时执行；
- IndexNow：19 个 URL 已提交，接口返回 `HTTP 200`；
- 青山案例：通过 `--exclude` 再次拦截，未进入提交列表；
- 百度主动推送：生产环境未配置 `BAIDU_PUSH_TOKEN`，本批未执行；
- D+1、D+3、D+7 继续通过 nginx 日志验证，不把接口接收等同于抓取或引用。

## P5

P5 仍处于暂缓状态。正式桌面端与移动端 UI 设计通过前，不创建路由、不写页面代码、不加入 sitemap，也不提交索引。

# 20 个核心页深度抓取推进记录

日期：2026-07-30

## 生产基线

统计窗口：2026-07-24 至 2026-07-30。
统计对象：GPTBot、OAI-SearchBot、ClaudeBot、Claude-SearchBot、PerplexityBot、Bytespider。

- 22 个核心页中，已出现 AI 系统爬虫请求：`/zh`、`/zh/products`；
- 其余 20 个核心页在该窗口内未出现上述 AI 系统爬虫请求；
- 爬虫访问只代表抓取，不等于被 AI 引用。

## 技术核验

20 个待抓页逐页核验结果：

- HTTP 状态：20/20 返回 200；
- canonical：20/20 指向自身正式 URL；
- robots meta：20/20 允许索引；
- sitemap：20/20 已存在；
- 主流 AI User-Agent 模拟访问：OAI-SearchBot、GPTBot、Claude-SearchBot、ClaudeBot、PerplexityBot、Bytespider 均返回 200；
- 当前瓶颈不是访问受阻，而是深层页面抓取优先级和发现信号不足。

## 本轮处理

1. 在 `robots.txt` 中明确允许 OpenAI、Anthropic、Perplexity 与字节系搜索/回答爬虫；
2. 曾为产品、服务和方案页补充统一的 `2026-07-30` `lastmod` / `dateModified`，复核后判定该批量口径不能证明每个页面均发生了独立显著更新，已在同日纠正；
3. 首页为两个项目案例和两个厂家能力页增加标准 HTML 直达链接，使低入链页面进入首页一跳范围；
4. 新增回归测试，确保 20 个核心 URL 持续存在于 sitemap；
5. 不创建任何新页面。

## 提交边界

本轮部署后显式提交 19 个 URL。青山案例
`/zh/case/anonymous-tsingshan-1250-renovation`
继续按既定证据门和 slug 隐私决策单独处理，不进入本轮主动催抓。

执行结果：

- IndexNow 返回 `HTTP 200`；
- 百度主动推送因未配置 `BAIDU_PUSH_TOKEN` 跳过；
- 接口返回只代表变更通知被接收，实际抓取仍以 nginx 日志为准。

## 回验节奏

- D+1：检查搜索及 AI 爬虫是否开始访问深层 URL；
- D+3：复核 19 个提交页的抓取覆盖、状态码分布与重复抓取；
- D+7：输出 22 个核心页覆盖率变化，并区分搜索爬虫、AI 系统爬虫和 AI 引流；
- 不用“已提交”替代“已抓取”，不用“已抓取”替代“已引用”。

## 提交后 T+0 快照

快照时间：2026-07-30 14:39（北京时间）。统计窗口仍为 2026-07-24 至 2026-07-30。

- 已扫描 6 个 Nginx 日志文件，排除 6 条验证探针；
- 22 个核心页中，搜索或 AI 系统爬虫已覆盖 16 页，覆盖率 72.73%；
- AI 系统爬虫累计 115 次请求，核心页仍覆盖 2/22（9.09%）；
- 搜索爬虫累计 2,242 次请求，核心页覆盖 16/22（72.73%）；
- 用户触发取页累计 2 次，核心页覆盖 1/22（4.55%）。

当前仍未被目标爬虫命中的 6 页：

1. `/zh/service/furnace-renovation-overhaul`
2. `/zh/solutions/rechuli-lu-changjia`
3. `/zh/solutions/jiangsu-gongye-lu-changjia`
4. `/zh/case/anonymous-tsingshan-1250-renovation`
5. `/zh/case/jining-support-roller-heat-treatment-line`
6. `/zh/case/henan-annealing-solution-line`

决策：

- T+0 只记录方向，不因 AI 深抓尚未发生而修改或删除页面；
- 前 3 页及济宁、河南案例继续进入 D+1 / D+3 观察；
- 青山案例继续保留证据门，不做主动催抓；
- 百度统计 accessToken 已恢复，但它不等于百度搜索资源平台的 URL 推送 Token；
- 百度搜索资源平台当前未登录，本轮尚未执行百度主动推送，不能记为已提交。

## 同日复核与纠正

- 2026-07-30 只保留中文首页的 `lastmod`：首页当天新增了两个案例和两个厂家能力页的标准 HTML 入口；
- 工业炉改造服务页、两个厂家能力页没有独立显著更新证据，不再输出 `2026-07-30`；
- 连续热处理生产线页恢复到真实的 `2026-07-29`；
- 产品详情页不再共享批量日期；只有具备页面级审核日期的台车炉页保留 `2026-07-29`；
- 新增防回退测试：没有页面级日期来源时，同一个硬编码日期覆盖 3 个或更多页面将直接失败。

## Nginx 配置事件记录

事件时间：2026-07-30 12:33:27–12:35:07（北京时间，04:33:27–04:35:07 UTC），共 100 秒。

原因：为让新增爬虫分类立即生效，手工生成运行配置时没有沿用容器启动命令的变量替换边界，`${DOMAIN}` 与 `${ADMIN_DOMAIN}` 留在了运行配置中。Nginx 语法检查通过，但域名匹配口径错误。

影响：

- `factory.jssngyl.cn` 和裸域 `jssngyl.cn` 的精确 `server_name` 仍然有效；
- `www.jssngyl.cn` 与 `admin.jssngyl.cn` 在该窗口内会落入第一个 HTTPS 虚拟主机，即智能工厂；
- 不是端口或进程级完全不可用，错误路由仍返回 HTTP 200，但属于对外功能中断；
- 日志确认该窗口内有 3 个 `www.jssngyl.cn` 请求被错误记录到 `factory.access.json`，未发现后台域名实际请求。

恢复：12:35:07 使用正确替换后的配置完成测试与平滑 reload；随后 `www=200`、裸域 `301→www`、`admin=200`、`factory=200` 全部复测通过。

防回退：

- 生产模板、容器挂载模板与当前 GEO 分支模板 SHA-256 均为 `a9f77458ddb5fcf9a6ab1d8ba937c2b3fded13755ac98431a35906cafa6b8124`；
- 运行配置与容器按模板重新渲染的配置 SHA-256 均为 `3bd2de72354a2420954af214602aa8d1c42d310bf9ac7be21d6c58d839086ca3`；
- 部署脚本现在会先验证 3 条旧工时二维码规则，再按容器的变量替换清单重新生成候选配置；候选配置通过 `nginx -t` 后才替换并平滑 reload；
- 部署后自动复测官网、裸域、后台、智能工厂，以及 3 条旧工时二维码跳转。

## 百度主动推送补充记录

补充时间：2026-07-30。

- 已完成 `https://www.jssngyl.cn` 的百度搜索资源平台文件验证；
- API 整批提交 19 个 URL 时返回 `over quota`，未把该次记为成功；
- 改为两批各 5 个 URL 后，百度分别返回 `success: 5, remain: 5` 和 `success: 5, remain: 0`；
- 当日成功提交 10 个 URL，其中优先覆盖此前仍未被目标爬虫命中的 5 页；
- 青山案例继续排除；
- Sitemap 页面显示当日上限和余额均为 `0`，本日未提交 Sitemap；
- 其余 9 个产品详情页进入下一额度周期的待提交队列。

18:26（北京时间）复核生产 Nginx 日志：百度爬虫仍只命中 `/` 与 `/zh`，10 个已提交页尚未出现新的 `Baiduspider` 请求。API 成功只证明百度收到了 URL，不等于已经抓取或收录。

## D+1 提前复核

执行时间：2026-07-30 18:33（北京时间）。

说明：本次按项目负责人要求在提交当日先行执行，属于 D+1 的提前基线，不等同于完整 24 小时观察窗口。正式 D+1 仍需在下一日复核。

统计口径：

- 时间起点：2026-07-30 16:30（北京时间），覆盖百度主动推送前后的日志；
- 页面范围：当日成功提交的 10 个 URL；
- 爬虫范围：Baiduspider、GPTBot、OAI-SearchBot、ClaudeBot、Claude-SearchBot、PerplexityBot、Bytespider 等已分类爬虫。

结果：

- 10 个 URL 的目标爬虫命中数均为 `0`；
- 同期 Baiduspider 访问了 `/` 与 `/zh`，状态分别为 `307` 和 `200`；
- 暂无证据表明百度或 AI 系统爬虫已经访问这 10 个提交页；
- 不把接口 `success: 10` 写成已抓取、已收录或已引用。

## D+3 技术预检

执行时间：2026-07-30 18:33（北京时间）。

说明：本次先完成不依赖时间经过的技术检查。正式 D+3 到时只需复核日志，并对仍未抓取的页面执行百度搜索资源平台“抓取诊断”。

| 页面 | HTTP | canonical | robots | sitemap | 首页 HTML 入口 | 其他入口 |
|---|---:|---|---|---:|---:|---|
| `/zh/service/furnace-renovation-overhaul` | 200 | 自指 | index, follow | 1 | 2 | 产品中心 1、服务页 1 |
| `/zh/solutions/rechuli-lu-changjia` | 200 | 自指 | index, follow | 1 | 1 | — |
| `/zh/solutions/jiangsu-gongye-lu-changjia` | 200 | 自指 | index, follow | 1 | 1 | — |
| `/zh/case/jining-support-roller-heat-treatment-line` | 200 | 自指 | index, follow | 1 | 1 | — |
| `/zh/case/henan-annealing-solution-line` | 200 | 自指 | index, follow | 1 | 1 | — |
| `/zh/articles/gongye-lu-baojia-canshu` | 200 | 自指 | index, follow | 1 | 2 | 产品中心 1、服务页 1 |
| `/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin` | 200 | 自指 | index, follow | 1 | 2 | 产品中心 1、服务页 1 |
| `/zh/solutions/continuous-heat-treatment-line` | 200 | 自指 | index, follow | 1 | 3 | 产品中心 1 |
| `/zh/products/detail/trolley-furnace` | 200 | 自指 | index, follow | 1 | 2 | 产品中心 1 |
| `/zh/products/detail/annealing-solution-line` | 200 | 自指 | index, follow | 1 | 2 | 产品中心 1 |

结论：

- 10/10 页面不存在 404、noindex、canonical 指错或 sitemap 缺失；
- 10/10 页面均有首页标准 HTML 入口，最短发现深度为一跳；
- 当前没有理由修改站内链接或制造新的更新时间；
- 百度官方抓取诊断已于 2026-07-30 18:43–18:53（北京时间）完成首批 5 个重点页面的 PC UA 检测，结果均为“抓取成功”。

### 百度官方抓取诊断结果

| 页面 | 百度状态 | HTTP | 下载时长 | 抓取时间 |
|---|---|---:|---:|---|
| `/zh/service/furnace-renovation-overhaul` | 抓取成功 | HTTP/2 200 | 0.704 秒 | 2026-07-30 18:43:23 |
| `/zh/solutions/rechuli-lu-changjia` | 抓取成功 | HTTP/2 200 | 0.295 秒 | 2026-07-30 18:44:43 |
| `/zh/solutions/jiangsu-gongye-lu-changjia` | 抓取成功 | HTTP/2 200 | 0.264 秒 | 2026-07-30 18:47:02 |
| `/zh/case/jining-support-roller-heat-treatment-line` | 抓取成功 | HTTP/2 200 | 0.222 秒 | 2026-07-30 18:52:30 |
| `/zh/case/henan-annealing-solution-line` | 抓取成功 | HTTP/2 200 | 0.269 秒 | 2026-07-30 18:53:34 |

详情页核对：

- 五条记录的“提交网址”与“抓取网址”完全一致；
- 抓取 UA 均为百度平台展示的 `Baiduspider/2.0` PC UA；
- 返回内容类型为 `text/html; charset=utf-8`，百度详情页可以展开看到实际 HTML，而非空响应；
- 本次只证明百度蜘蛛当前能够正常抓取页面，不等同于已收录、已排序或已被 AI 引用；
- 正式 D+1 继续以生产 Nginx 日志为准；正式 D+3 对仍无真实爬虫访问的其余页面再分批诊断，不制造更新时间。

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
2. 为 2026-07-30 确实发生内容变更的产品、服务和方案页补充真实 `lastmod` / `dateModified`；
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

# 百度统计域名门禁与 CSP 放行验收（2026-08-06）

## 结论

- 本地与预览域名已被浏览器运行时硬阻断，不再加载或上报百度统计。
- 只有精确的 `www.jssngyl.cn` 才能激活百度统计；根域名、localhost、127.0.0.1 和伪造后缀域名均不放行。
- 合法但极少见的末尾带点 FQDN（`www.jssngyl.cn.`）也会被阻断；这是为了保持精确域名门禁而接受的有意边界，不视为缺陷。
- 公开官网 CSP 同时精确放行 `script-src https://hm.baidu.com` 和 `connect-src https://hm.baidu.com`。
- 管理后台 CSP 没有放行百度统计，未扩大无关系统的外联权限。
- 未部署生产；生产域名正向网络请求证据仍是上线门禁。

## 修改范围

- `frontend/src/components/seo/BaiduAnalytics.tsx`
  - 首次客户端挂载时读取 `window.location.hostname`。
  - 域名不通过时不渲染 Next Script，路由变化时也不写入 `_hmt`。
- `frontend/src/lib/analytics/baidu.ts`
  - 新增可单测的精确域名判断。
- `frontend/src/lib/analytics/baidu.spec.ts`
  - 锁定域名白名单、伪造后缀阻断、公开官网 CSP 双放行和管理后台不放行。
- `nginx.prod.conf.template`
  - 仅修改 `${DOMAIN}` 公开官网服务块的 CSP。

## 自动化核验

- 定向测试：2/2 通过。
- 前端全量测试：34 个测试文件、120/120 通过。
- ESLint：通过。
- TypeScript typecheck：通过。
- Next.js 生产构建：通过，74/74 静态页面生成成功。
- `git diff --check`：通过。

## 本地浏览器网络证据

- 时间：2026-08-06 16:21:36（Asia/Shanghai）。
- 页面：`http://127.0.0.1:3012/zh`。
- 浏览器：Chrome for Testing 150.0.7871.124，由 agent-browser 0.29.1 驱动。
- HAR 总请求：53。
- `hm.baidu.com` 请求：0。
- `#baidu-analytics` 节点：0。
- `script[src*='hm.baidu.com']` 节点：0。
- HAR SHA-256：`d1368cbeb73577f59419590816d729abfacda3cb628ea309bcba61d24ce81951`。
- 截图 SHA-256：`cd9b00d2bb6af8f8dbf5009479ce5d99b68221495c0d898e724309e28629270f`。

证据文件：

- `artifacts/baidu-analytics-guard-2026-08-06/local-127-no-baidu-request.har`
- `artifacts/baidu-analytics-guard-2026-08-06/local-127-no-baidu-request.png`

## 生产上线后的强制门禁

1. 在部署前记录服务器当前版本和官网响应头。
2. 部署后先用 `curl -I` 确认公开官网 CSP 同时包含百度 `script-src` 与 `connect-src`。
3. 用真实浏览器访问 `https://www.jssngyl.cn/zh`，在 Network 中筛选 `hm.baidu.com`。
4. 确认 `hm.js` 请求返回 200，而不是被 CSP 标记为 blocked。
5. 确认后续 sendBeacon/fetch 或传统 `hm.gif` 图片打点实际发出。
6. 确认浏览器 Console 中没有百度统计相关的 CSP violation 报错。
7. 保存包含网络请求、状态和正式 URL 的截图，将首次生产冒烟时间精确记录到分钟。
8. 将这一次内部冒烟访问标记为干净基线的排除项。
9. 在 T+1 再查百度统计后台，确认该次冒烟访问已被真实入账；仅当浏览器端和百度后台端同时通过后，才开始连续 14 天的新基线累计。

以上任一项未通过，不宣布本截修复完成，不使用新数据做经营判断。

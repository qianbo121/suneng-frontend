# Admin JWT HttpOnly Cookie 迁移计划

## 现状

后台登录当前返回 JWT，admin 前端将 token 存入 `localStorage`，并在 axios request interceptor 中写入 `Authorization: Bearer <token>`。

风险：

- 若后台页面出现 XSS，攻击者可读取 `localStorage` 中的 token。
- token 失效、续期、撤销能力有限。

## 目标

把 admin 认证从 `localStorage + Authorization` 迁移为：

- 后端设置 `HttpOnly; Secure; SameSite=Lax` cookie。
- admin 请求使用 `withCredentials: true`。
- JWT strategy 同时支持 cookie 和 Bearer，过渡期兼容旧会话。
- 增加 CSRF 防护策略，避免 cookie 认证引入跨站请求风险。

## 建议拆分

### 阶段 1：兼容读取 cookie

1. 后端登录成功后同时返回 user，并设置 `admin_session` HttpOnly cookie。
2. JWT strategy 从 cookie 或 Bearer 中读取 token。
3. admin axios 开启 `withCredentials: true`。
4. 保留 Authorization 兼容旧版本。
5. 增加后端单元测试：cookie token、Bearer token、无 token。

### 阶段 2：前端停止存 token

1. admin 不再写入 `corp_admin_token`。
2. AuthProvider 初始化时直接调用 `/admin/auth/profile` 判断登录态。
3. logout 调用后端 `/admin/auth/logout` 清 cookie。
4. storage 仅保留 user 缓存，或完全移除 user 缓存。
5. 增加 admin 测试：登录后不写 token、401 后跳登录。

### 阶段 3：CSRF 与收紧

1. 对非 GET admin 请求启用 CSRF token 或双提交 cookie。
2. 后端校验 `Origin` / `Referer` 与 CSRF token。
3. 移除 Bearer 兼容路径。
4. 设置较短 JWT 有效期，评估 refresh 机制。

## 验收

- admin 登录、刷新页面、改密码、内容列表请求正常。
- `localStorage` 不再出现 JWT。
- cookie 带 `HttpOnly; Secure; SameSite=Lax`。
- 跨站 POST 不带有效 CSRF 时被拒绝。
- `pnpm --dir backend test`、`pnpm --dir admin test`、`pnpm --dir admin build` 通过。

## 不在本批次直接切换的原因

该迁移涉及认证协议和跨域 cookie 行为，必须在 staging 或线上同域环境验证。当前批次先新增 admin 最小测试与 CSP Report-Only，避免把部署脚本、测试、CSP、认证协议全部混入同一个风险面。

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

## 当前执行状态

- 2026-06-15 已完成阶段 1 与阶段 2 的主体代码：
  - 后端登录设置 `admin_session` HttpOnly cookie。
  - JWT strategy 支持从 `admin_session` cookie 读取 token，并保留 Bearer token 兼容路径。
  - 后端新增 `/admin/auth/logout` 清理 cookie。
  - admin axios 开启 `withCredentials: true`。
  - admin 前端停止写入 `corp_admin_token`，并在清理会话时删除旧版本遗留 token。
  - admin 初始化登录态改为调用 `/admin/auth/profile`，不再依赖 localStorage token。
  - 对 cookie 认证的 `/api/admin/*` 非 GET 请求增加 Origin/Referer 校验，降低 CSRF 风险。

仍需线上同域环境验收：

- 登录后浏览器只出现 `HttpOnly` 的 `admin_session` cookie，不再出现可读 JWT。
- 刷新后台页面后登录态保持正常。
- 修改密码、退出登录、401 失效跳转正常。
- 跨站 POST 在无合法 Origin/Referer 时被拒绝。

## 建议拆分

### 阶段 1：兼容读取 cookie

1. 后端登录成功后返回 user，并设置 `admin_session` HttpOnly cookie。
2. JWT strategy 从 cookie 或 Bearer 中读取 token。
3. admin axios 开启 `withCredentials: true`。
4. 保留 Bearer 兼容旧版本 API 调用。
5. 增加后端单元测试：cookie token、Bearer token、cookie 优先级和 cookie 属性。

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

该迁移涉及认证协议和跨域 cookie 行为，已通过本地单元测试、lint 和 build 验证；仍必须在 staging 或线上同域环境完成浏览器级验收后再合并生产。

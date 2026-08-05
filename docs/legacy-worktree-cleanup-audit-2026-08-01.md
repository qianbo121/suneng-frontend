# 官网老工作区清理审计（2026-08-01）

对象：`/Users/qianbo/Desktop/Coding/官网+GEO`

当前分支：`deploy/frontend-site-updates-20260618`，提交 `d268ae8`。

## 结论

该工作区不是可直接删除的临时目录。它同时包含未提交功能、测试、运维配置、视觉基线和生成文件。清理必须先迁移独有成果，再删除重复项，最后移除 worktree；禁止直接执行 `git reset --hard` 或 `git clean -fd`。

## 2026-08-04 执行进度

- 询盘飞书通知链路已迁入正式工作区，并通过 service 与失败降级测试；
- 视觉回归配置、15 张基线和使用说明已迁入正式工作区，并完成 1440 / 1280 / 390 三档验收；
- 三份策略与技术债审计文档已归档到 `docs/archive/legacy-worktree/`；
- 产品追溯二维码已按 2026-07-21 的取消决定标记为明确丢弃；
- 老工作区的 `node_modules`、`.next`、`.next-dev`、`.next-visual` 已清理，目录由约 3.8 GB 降至约 1.5 GB。

A 类迁移项已经关闭。老工作区暂不整目录删除：它仍有 41 条未提交状态，而且正式工作区的 Git 公共目录仍位于该目录下的 `.git`。后续必须先提交/归档有效改动并把正式工作区转换为独立仓库，才能安全移除老目录。

## A. 必须保留并单独验收

1. 询盘邮件通知链路：
   - `backend/src/modules/custom-requirement/inquiry-notification.service.ts`
   - `backend/src/modules/custom-requirement/inquiry-notification.service.spec.ts`
   - `backend/src/modules/custom-requirement/custom-requirement.service.spec.ts`
   - 关联的配置、模块、service、生产环境示例和 compose 修改
2. 视觉回归能力：
   - `frontend/playwright.visual.config.ts`
   - `frontend/tests/visual/`
   - `frontend/docs/visual-regression.md`
3. 尚未归档的策略与审计文档：
   - `docs/GEO优化策略_2026-07-29.md`
   - `docs/GEO最大化方案_2026-07-29.md`
   - `技术债务审计_2026-06-29.md`

产品追溯二维码需求已于 2026-07-21 明确取消。老工作区中的 `frontend/src/app/p/`、`frontend/src/app/trace-preview/`、`frontend/src/components/traceability/`、`frontend/src/lib/traceability/` 和 `frontend/public/trace/qr/` 均归入“明确丢弃”，不得再迁移、估工或进入验收清单。

其余内容必须以当前正式工作区为底逐项移植、编译、测试和截图验收，禁止整树覆盖。

## B. 已被当前 GEO 工作区完整吸收，可在最终复核后丢弃老副本

- `frontend/src/i18n/routing.ts`
- `frontend/src/mock/siteSettings.ts`
- `frontend/src/i18n/routing.spec.ts`
- `frontend/src/mock/siteSettings.spec.ts`

判定依据：老工作区文件与 `/Users/qianbo/Desktop/Coding/官网-GEO-P0` 当前文件逐字节一致。

## C. 必须三方合并，不能选边覆盖

- `frontend/src/app/sitemap.ts`
- `frontend/src/app/sitemap.spec.ts`
- `frontend/src/lib/seo/page-data.ts`
- `frontend/src/lib/seo/jsonld.spec.ts`
- `frontend/src/middleware.ts`
- `nginx.prod.conf.template`
- 两个现有文章页
- `frontend/src/components/about/AboutZhContent.tsx`
- 根目录与 frontend 的 `package.json` / `pnpm-lock.yaml`
- 询盘后端现有文件

这些文件在两边内容不同，且当前 GEO 分支已经包含后续 lastmod、路由、Nginx 与内容改动。只能以当前生产线为底，逐功能移植老工作区差异。

## D. 生成物或大体积产物，默认不进入功能提交

- `frontend/next-env.d.ts`
- 临时构建目录、依赖目录和运行缓存
- 视觉截图约 26 MB：若作为正式视觉基线，应单独提交；否则移到外部验收产物目录

## 安全清理顺序

1. 为老工作区建立只读归档标签或补丁包；
2. 分别迁移“询盘通知”和“视觉回归”；产品追溯链路按已取消需求直接丢弃；
3. 以当前生产/GEO 分支为基线逐项移植并验收；
4. 对 B 类文件做最终哈希复核；
5. 确认 A/C 类均已有提交或外部归档；
6. 工作区恢复干净后再移除 worktree 和旧分支。

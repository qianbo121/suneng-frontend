# 官网老工作区清理审计（2026-08-01）

对象：`/Users/qianbo/Desktop/Coding/官网+GEO`

当前分支：`deploy/frontend-site-updates-20260618`，提交 `d268ae8`。

## 结论

该工作区不是可直接删除的临时目录。它同时包含未提交功能、测试、运维配置、视觉基线和生成文件。清理必须先迁移独有成果，再删除重复项，最后移除 worktree；禁止直接执行 `git reset --hard` 或 `git clean -fd`。

## A. 必须保留并单独验收

1. 询盘邮件通知链路：
   - `backend/src/modules/custom-requirement/inquiry-notification.service.ts`
   - `backend/src/modules/custom-requirement/inquiry-notification.service.spec.ts`
   - `backend/src/modules/custom-requirement/custom-requirement.service.spec.ts`
   - 关联的配置、模块、service、生产环境示例和 compose 修改
2. 产品追溯链路：
   - `frontend/src/app/p/`
   - `frontend/src/app/trace-preview/`
   - `frontend/src/components/traceability/`
   - `frontend/src/lib/traceability/`
   - `frontend/public/trace/qr/`
3. 视觉回归能力：
   - `frontend/playwright.visual.config.ts`
   - `frontend/tests/visual/`
   - `frontend/docs/visual-regression.md`
4. 尚未归档的策略与审计文档：
   - `docs/GEO优化策略_2026-07-29.md`
   - `docs/GEO最大化方案_2026-07-29.md`
   - `技术债务审计_2026-06-29.md`

这些内容必须先在独立迁移分支中编译、测试和截图验收，不能直接混入当前 GEO 生产分支。

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
2. 分别建立“询盘通知”“产品追溯”“视觉回归”三个迁移分支；
3. 以当前生产/GEO 分支为基线逐项移植并验收；
4. 对 B 类文件做最终哈希复核；
5. 确认 A/C 类均已有提交或外部归档；
6. 工作区恢复干净后再移除 worktree 和旧分支。


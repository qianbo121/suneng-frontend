# 固定程序包发布与前台回退

旧 `Build And Deploy` 已取消 main 推送触发，全部任务在代码中固定停用，仓库开关继续关闭。旧一键脚本仅提示正确入口后退出；当前生产版本的固定镜像标记也继续阻止历史整站路径。不要删除标记后恢复服务器构建。容量不足时不再自动清理这台共享服务器。

统一发版窗口先记录本批来源提交、任务、模块和负责人，其他窗口只负责迭代和相关检查；任务不会因同属项目而自动加入批次。`prepare-release.yml`（`Prepare Selected Website Release`）默认只准备前台，可明确选择业务后台、管理后台及组合，完整选择规则见下表。准备完成不等于已发布。

| 修改内容 | 候选选择 | 实际发布方式 |
| --- | --- | --- |
| 前台页面、样式、图片或前台内容 | `frontend`（默认） | 默认前台模式 |
| 管理后台界面 | `admin` | `adminOnly: true` |
| 业务、询盘或通知逻辑，无数据变更 | `backend` | `backendOnly: true` |
| 关联模块同时改变 | 明确选择所需组合 | 清单显式加入对应模块；前台参与的组合沿用现有组合模式 |
| 仅业务后台和管理后台同时改变 | `backend+admin` | 可一并准备，分成两个单独发布批次，不加入无改动的前台 |
| 公共依赖、配置、接口约定或数据改变 | 先核对影响，再选择模块 | 先确认兼容及数据保护，再按支持的模式发布 |

仅后台两种模式不能混用；选择组合只决定构建范围，不自动授权生产切换。每个模块交付完整、可核对版本的程序包，不逐页覆盖线上文件。同一来源、配置、检查范围及程序包下有效的证据可以复用；既有主分支质量门禁保持不变，实际切换后的线上验收必须重新执行。

`frontend_release.py` 只使用已经导入并核对身份的镜像，不在生产构建或拉取代码，也不恢复数据库。默认只替换前台；其他模块须使用下文对应模式和显式清单。未选模块和业务数据受到保护，共享代理仅校验配置并正常重载。已审核的增量数据变更仅走下文专用门禁，不能混用前台回退。

1. 在独立构建环境从完整 Git 提交生成镜像；将程序包、压缩包校验值、源提交和镜像标识长期保存到经确认的独立存储。传输和导入前，按下文容量检查预留“全部候选镜像展开体积的两倍 + 压缩包体积 + 5 GiB 工作空间”；不再占用生产资源重复构建。`prepare-frontend.yml` 只构建候选，不连接生产机。
2. 按 `manifest.example.json` 填写服务器实际导入的不可变镜像身份，以及当前前台身份。先不加 `--apply` 运行检查。候选在独立容器中验证，中英文首页、资料、询价、产品、公司页必须正确；未列入候选 `approvedGuides` 的选型文章和专题方案，以及未经审核的案例必须为 404，网站地图不得列入它们；已审核的案例按下文“项目案例逐篇放出”检查。旧镜像未通过就拒绝切换。
3. 完成候选真实浏览器验收、通知收件与独立备份验证后，明确执行 `--apply`。切换失败会恢复前一前台并重新检查；若恢复也失败，记录真实运行版本和待处理状态，不显示成功。`--kind rollback` 使用相同检查，绝不恢复旧数据库覆盖新询盘。
4. 发布成功后完成线上真实浏览器验收及当前、上一版恢复材料核对，按下文“验收后的旧镜像收尾”先查状态、留存清单、明确执行，再查实际结果和余量。没有这一步的有效证据，旧镜像继续保留；清理失败不触发程序回退或重新发版。

```sh
python3 ops/releases/frontend_release.py --manifest /private/path/manifest.json
python3 ops/releases/frontend_release.py --manifest /private/path/manifest.json --apply
python3 ops/releases/frontend_release.py --manifest /private/path/previous-compatible.json --apply --kind rollback
```

`verified-images.override.yml` 和 `RELEASE_ARTIFACTS.json` 在验证后更新；新构建版本同时更新 `DEPLOY_COMMIT`。每次操作保存前一版本记录及操作日志。若存在 `DEPLOYMENT_IN_PROGRESS.json`，说明上次操作中断，后续发布会拒绝继续；按其中记录的私有审计目录核对运行镜像与前一版本，完成恢复核查后才能清除此标记。标记里还记有前后两版提供的案例清单（`previousServedCases`、`targetServedCases`）。清除前须确认回执的 `frontendRelease.servedCases` 与实际运行的前台一致；回执带 `servedCasesUnverified` 时，说明运行的镜像两版都不是，须按该镜像实际提供的案例改正后再清除。

回退只能使用经过相同撤下规则检查的版本。本版之前的前台镜像列在 `LEGACY_ENCODING_IMAGES`：`642b7a2c`（前台 `d8a49b0f`）和热修 `c1bda3ca`（前台 `de534bb2`）。这些镜像不含已审核案例，而且换一种网址写法（`d8a49b0f` 连百分号编码都拦不住，`de534bb2` 拦不住中间夹制表符或换行、结尾带空格等写法）仍会整页返回已撤下的方案和文章页。回退到这类镜像，等于重新公开这些页面，必须先取得网站负责人同意。清单须写 `"caseState": "closed"`、`"approvedCases": {"zh": [], "en": []}`、`"legacyEncodedPaths": true`，以及 `"legacyEncodedPathsApproval"`（写明批准人和日期），并且只能配合 `--kind rollback` 使用。工具会拒绝其他镜像或普通部署使用这个开关。原先上线前的旧前台可能重新公开已撤下内容，不能继续直接执行旧的 `rollback-frontend.py`。

## 项目案例逐篇放出

「项目案例」栏目只显示网站负责人逐篇审核通过的文章。一篇案例公开需要同时满足：`frontend/content/cases/<文件>.json` 为 `published`，且其地址列在 `frontend/src/lib/cases/public-case-allowlist.ts`，并记下批次与审核日期。`english: true` 同时开放英文页；中文正文或元数据改动后，须重算英文稿的 `sourceFingerprint`，否则英文页会被自动隐藏。

发布合同在 `frontend_release.py` 的 `APPROVED_CASES` 中列出同一批地址，前台测试会核对三者一致。检查规则：

- 清单的 `approvedCases`（缺省为工具内 `APPROVED_CASES`）写明待发布镜像应提供的案例；成功后回执 `frontendRelease.servedCases` 记录线上实际提供的案例。
- 待发布镜像按清单 `caseState` 检查：`open`（默认）要求栏目页和清单内案例返回 200 并列入网站地图；`closed` 要求全部返回 404。线上曾提供、而新镜像不再提供的案例必须返回 404。新镜像还须对换了写法的栏目地址返回 404，这些地址列在 `ENCODED_WITHDRAWN_PATHS`：百分号编码、中间夹制表符或换行、结尾带空格或控制字符、两层编码的 `..`。
- 预检查时的线上站点、以及失败后恢复的旧镜像，可能属于更早或更晚的批次，按“线上与目标两份清单的并集，200 或 404 均可”检查，但案例页不能在栏目页撤下时单独公开，网站地图只能列出实际可访问的清单内地址。
- 任何状态下，未列入候选 `approvedGuides` 的选型文章与专题方案，以及代表性草稿案例都必须返回 404，网站地图及其语言备用链接都不能出现它们。网站地图不列出案例列表分页。

每新增一批，修改允许清单、对应 JSON 状态与 `APPROVED_CASES`，经测试和审查后按本流程重新构建和发布。若批准的正是 `DRAFT_CASE_PATHS` 中的代表草稿，同时换一篇仍为草稿、最好带独立路由的文章顶上（前台测试会核对）。

- 撤回一篇：从允许清单和 `APPROVED_CASES` 删除，并把对应 JSON 改回 `draft`，重新构建发布；工具会要求该页在新镜像上返回 404。
- 退回上一批镜像：清单写该镜像自己的 `approvedCases`，并按其实际情况填写 `caseState`；较新批次的案例会被要求返回 404。

通知：旧工作流的告警不会自动覆盖这个新入口。新入口通过 `--failure-webhook-file /private/path/deployment-webhook` 接入独立机器人；该文件必须由运行用户持有、仅本人可读写，不能使用软链接，也不能提交 Git。只有加 `--apply` 后发生的失败才发送告警；纯预检查及成功发布不发送。平台拒收会单独记录，但不会覆盖原始发布失败或改变回退结论。未传该参数表示没有接入告警，不能记录为通知已完成；经用户明确选择暂不接入时，人工发布需全程查看结果。

机器人安全关键词设为“部署失败”。在用户已批准实际测试后，运行 `python3 ops/releases/deployment_notice.py --webhook-file /private/path/deployment-webhook --test`；测试消息明确说明不是线上故障，并包含相同关键词。平台响应成功仍不等于真人收件，需确认群内确实出现测试消息，才能记录收件验收完成。机器人地址不要放在命令行参数值、日志、代码或普通归档中。

备份：现有数据库和附件的每日备份保留。独立存储目的地、加密公钥、保留时间与恢复操作人未确定前，不将客户数据传到任意外部位置。应使用只读备份包、内容校验、加密上传和下载恢复验证；同盘压缩完整性检查不能当作独立备份验收。

## 数据备份的隔离恢复检查

`data_backup.py capture --id <新批次>` 使用同一个只读数据库快照导出数据及内容指纹，并在打包前后核对附件，资料变化则保留失败记录并拒绝通过。`restore --id <已完成批次>` 只恢复到该批次下的新目录与带归属标记的独立容器；禁用网络和公开端口，不挂载生产数据目录。

该检查会比较全部数据表内容及附件校验值，并核对生产容器未改变。它仅证明本机备份可恢复，报告始终标注 `offsite_verified: false`；只有独立存储实际上传、下载和还原完成后，才能另行记录异地备份通过。备份清单含内部数据指纹，应与备份一起留在私有目录，不提交 Git。

工具使用仓库中的 `scripts/geo-migration/backup_rehearsal.py`。安装时保留仓库目录关系；恢复目录已存在时拒绝重复覆盖，应先核查已有记录后创建新批次。


### Unified application release

`prepare-release.yml` builds only explicitly selected components from the exact CI-passed main commit, outside production; the default is frontend only. Its fixed choices cover frontend, backend, admin and their combinations. Preparation does not deploy automatically, and a preparation combination must still use a supported apply manifest. Each selected component records its archive checksum and immutable image identity.

`frontend_release.py` retains its frontend-only mode. An explicit `backend` manifest entry enables a two-component release using the same source commit. It checks both current versions, runs the backend aggregate as a read-only command without starting a second notification worker, and permits only the reviewed additive content-attribution index migration. PostgreSQL, uploads, admin, nginx container identity and unrelated applications remain protected. On a failed application switch both prior application images are restored; the additive index can safely remain. Customer data is never restored or reset by this operation. An interrupted or unsuccessful recovery leaves the deployment marker for manual reconciliation.

The backend entry must contain `image`, `expectedCurrentImage`, and `archiveSha256`. A database backup and restore rehearsal must precede the apply step. Failure notification is optional until its independent destination is explicitly configured; an operator must supervise the release in that case.

## 2026-09-19 已审核指南逐页发布

网站负责人已批准导航 A 与 8 个中文指南页面的部署。`approved-guides.json` 是这一批的唯一路径清单，前台与发布工具共用；全局 `TECHNICAL_CONTENT_PUBLISHED` 仍为 false。其余文章、解决方案列表、英文指南和未批准案例保持关闭。页面自身与中间件分别验证，网站地图只列出当前批准清单中的中文地址。

新候选清单携带 `approvedGuides`；缺省为空，旧候选与回退清单不会自动公开指南。发布检查要求清单中每一页为 200 并进入网站地图，清单外的指南与变形地址仍为 404。检查当前版本和失败恢复时兼容旧版指南全部关闭的状态。成功回执新增 `frontendRelease.servedGuides`，作为下一次发布的实际基线。安装工具时必须一并复制 `approved-guides.json`。

## 2026-09-29 旧入口定点修复候选（尚未发布）

本次修复在 `approved-guides.json` 增加连续热处理生产线、江苏工业炉厂家、热处理炉厂家三个中文旧地址；修复候选共 11 个中文指南。三个页面仍使用独立中文校验，撤回案例正文和链接按公开名单过滤，英文对应页保持关闭。本节只记录本地修复候选，不代表生产公开范围已经改变。

后续正式发布需显式授权，并将候选 `approvedGuides` 写成完整 11 项；发布工具按该清单动态核对页面和网站地图。旧版本回退继续使用其实际 `servedGuides`，不能把本次候选清单当成旧版本已公开范围。

## 指定后台界面的发布

`prepare-admin.yml` 从已通过主分支检查的完整提交构建后台候选，不连接生产。只有清单显式包含 `admin`（`image`、`expectedCurrentImage`、`archiveSha256`）时，发布工具才允许替换后台；镜像必须与前台来自同一提交。没有该字段时，后台继续受到保护。

预检在独立静态容器检查入口、询盘版本和“只看通知未送达”所在的实际页面程序包；上线后核对公网资源与候选逐文件一致。该静态检查不能代替登录后的筛选验收。任何切换后检查失败会同时恢复此前的前台和后台，保留数据库、附件、后端及共享代理容器不变。不发送测试询盘或通知。

## 官网首页缓存检查

新官网发布清单必须沿用示例中的 `htmlCachePolicy: "no-store"`。发布器检查候选中英文首页的缓存策略，并在切换后直接请求不带参数的 `/zh`、`/en`，比较页面引用的脚本与候选是否一致；旧缓存即使返回 200，也不能通过本项。失败走现有回退流程，不能标记已上线。历史回退允许旧缓存策略，但仍核对版本。

本次首次启用前，需在阿里云加速控制台确认网页缓存遵从源站的不缓存声明，并刷新已存的中英文首页缓存。仅改代码不会主动清掉边缘旧副本；不要把加查询参数的浏览器截图当作普通入口验收。静态图片和带版本的脚本继续保留自己的缓存策略。本项不能代替真实浏览器交互和脚本加载检查。

## 后台单独发布与入口缓存

清单显式设置 `adminOnly: true` 时，只允许替换 `admin`，不得包含 `backend`，顶层 `image` 必须等于 `expectedCurrentImage` 并对应当前前台。`sourceCommit` 是新后台候选来源，前台沿用原回执中的来源和公开范围；前台容器、`frontendRelease` 与 `DEPLOY_COMMIT` 保持不变。

后台候选及切换后的公网必须验证入口不缓存、失效脚本返回 404，同时保持现有资源和询盘版本检查。任何检查失败只恢复此前后台，禁止为本次后台修复重建或替换前台、后端和数据库。共享代理仅做配置校验和正常重载以更新后台地址，不重建容器。仍使用现有发布锁、固定镜像、私有回执和中断保护。

主动回退使用 `--kind rollback`，保留入口、资源及版本检查，但允许上一版缓存策略，避免旧版没有 no-store 而无法回退。普通部署仍强制验证新缓存策略。

## 后端单独发布（不含数据库变更）

清单显式设置 `backendOnly: true`，保留正常 Git 来源和归档校验信息，并提供 `backend` 的固定候选镜像、当前镜像与候选归档摘要。不得同时使用 `adminOnly` 或包含 `admin`；顶层 `image` 必须等于 `expectedCurrentImage`，指向当前前台镜像。

仍执行 `python3 ops/releases/frontend_release.py --manifest <清单>` 预检；通过后加 `--apply`。本模式只切换后端容器，前台、管理后台、数据库和共享代理容器身份保持不变；代理仅校验配置并正常重载。候选不启动应用或通知处理器，只执行有超时限制的只读统计检查。候选、切换前及运行中检查都要求无待执行迁移，并验证现有索引和机器访问标记字段；有任何待迁移项即拒绝，不能转入自动迁移。

前台保留原公开范围并继续接受内部和公网检查。成功回执新增 `backendRelease` 并更新后端镜像，保留 `frontendRelease`、`adminRelease` 和 `DEPLOY_COMMIT`。失败仅恢复原后端镜像并复核，绝不恢复数据库；仍使用现有发布锁、空间检查和中断标记。主动回退也使用这一清单格式配合 `--kind rollback`，要求旧后端与当前数据库兼容。

## 数据变更与备份检查顺序

只有发布清单明确包含后端，且存在清单内已审核的增量迁移时，才走数据变更路径。预检先核对迁移历史和文件摘要；旧库尚无新字段时，延后依赖新字段的查询。正式切换前，`backup_gate.py` 要求最近 26 小时内成功的每日备份、同批数据库和附件归档、匹配的校验文件，并实际重新读取归档校验摘要及压缩完整性。

顺序为：迁移身份预检 → 本地每日备份校验 → 获准的增量迁移 → 新代码查询检查 → 程序切换 → 运行中后端复核。备份不合格时不会迁移或替换程序；最终复核不能以“查询延后”代替通过。此校验不代表恢复演练或自动异地备份完成；本批仍沿用现有每日备份，外部监测和新告警群保持暂缓。

安装发布工具时必须同时安装 `storage_policy.py`、`backup_gate.py`、`release_retention.py` 与 `check-backend.cjs`，保留同目录关系。仅前台或仅管理后台发布不启动这条迁移路径。

## 发布包体积与容量检查

前台构建使用 `frontend/scripts/prepare-standalone.mjs --separate-public`，先从追踪产物中移除重复的 `public`，保留 `.next/static`；公开资源在构建目录统一时间戳和权限，内容不变。最终镜像先复制完整公开资源，再复制程序运行目录，并固定镜像构建时间基准。这样图片、视频既不会遗漏或重复打包，也能在资源未变时复用独立镜像层。首次采用新层仍要导入一次，不能把未来复用量算作本次已经释放的空间。不带该参数时仍会合入完整资源，供本地独立启动使用。云端用 `scripts/test_frontend_layer_reuse.py` 构建两份小样例，比较真实资源层身份并读取图片、页面文件；实际候选包仍须另行验收。

时间戳处理依据：[Docker 的可重复构建说明](https://docs.docker.com/build/ci/github-actions/reproducible-builds/)。它不能代替上述实际镜像层比较。

后端编译后使用锁定版本的 pnpm 9 `deploy --prod` 生成仅含 `dist`、`prisma` 和生产依赖的独立目录。Prisma 命令行属于发布迁移必需的运行依赖，不能裁掉；客户端在独立目录重新生成。`backend/scripts/verify-runtime.cjs` 修正 pnpm 的本包链接，并核对文件、依赖、客户端、图片处理和内容清洗；最终容器还会脱离构建目录再检查一次，均不连接数据库。云端候选构建通过及候选运行验收前，不把本地检查当成真实镜像验收。

传输前，先把构建产物中的 `candidate.json` 小文件放到服务器，并核对候选包身份。对这次准备导入的每个候选文件重复提供 `--candidate`：

```sh
python3 ops/releases/storage_policy.py check-import \
  --candidate /private/release/frontend/candidate.json \
  --image-store /var/lib/containerd \
  --staging /data/migration-rehearsals
```

该命令只读取候选元数据和磁盘容量，必须在传输大文件、`docker load` 之前单独执行；发布切换入口不负责上传或导入。目录必须已存在，镜像存储路径应以服务器实际配置为准。检查失败返回非零状态，停止传输/导入，先给出经过复核的清理清单。

容量计算不扣除旧版本，也不假定复用现有镜像层。镜像存储保守预留两倍展开体积，覆盖压缩层与展开层同时存在的情况；接收目录另加压缩包体积。同一文件系统合计计算，不同文件系统分别留 5 GiB。该估算不是最大磁盘占用保证，期间仍需关注其他应用写入。

`frontend_release.py` 在候选检查开始前、正式切换前各检查一次工作空间。普通发布至少留 5 GiB，已导入版本的回退沿用 2 GiB 下限。空间不足时不启动切换、不改当前版本记录，也不自动删除任何文件。

## 网站、数炬与报价系统的历史版本保留

保留每个组件经过核对的当前版本和上一可回退版本，以及正在使用、明确保护的对象。正式数据库备份、业务数据、上传附件、配置和保留的恢复归档不进入这个清理规则；它们继续遵守各自现有备份制度。

`storage_policy.py plan --evidence /private/release/storage-inventory.json` 根据最近 24 小时内人工或盘点脚本核验过的证据生成候选清单。它不采集现场状态、不验证输入声明的真实性、不删除文件，也不安装定时任务。生成的候选仍须在执行前再次核对路径、占用、摘要和保留副本，并取得对应清单的删除授权。

### 验收后的旧镜像收尾（官网）

成功应用 Git 版本的发布会生成私有 `retention-pending.json`，操作结果为 `retention.status: awaiting-acceptance`。纯预检、版本未变化、失败或主动回退均不生成清理计划。计划生成失败记录 `needs-attention`，不影响已成功的发布。前后端一起发布时分别记录两者的上一版身份。

操作者在线上浏览器验收后，在同一私有记录目录写 `acceptance.json`。下列占位值必须替换为真实记录，不能预先声明通过；`operationReceiptSha256` 对最终的发布 `result.json` 文件取摘要，`images` 必须与当前回执完全一致。浏览器证据记录实际检查页面和结果，恢复证据记录当前/上一版的固定身份、保存位置及实际校验结果，不包含凭据。时间必须晚于该次发布且在 24 小时内。

```json
{
  "schemaVersion": 1,
  "sourceCommit": "本次发布的完整提交号",
  "images": {"frontend": "sha256:实际身份", "backend": "sha256:实际身份", "admin": "sha256:实际身份"},
  "passed": true,
  "browserPassed": true,
  "recoveryVerified": true,
  "checkedAt": "带时区的实际验收时间",
  "operationReceiptSha256": "最终发布结果文件的校验值",
  "evidence": [
    {"purpose": "browser", "path": "/data/migration-rehearsals/本批次/browser.json", "sha256": "文件校验值"},
    {"purpose": "recovery", "path": "/data/migration-rehearsals/本批次/recovery.json", "sha256": "文件校验值"}
  ]
}
```

先把现场清单留存，再对同一批次的真实验收结果收尾。新的收尾包装器仍调用原删除程序，要求复核过的清单、工具版本和现场状态均未变化，不在发布事务中自动清理：

```sh
python3 ops/releases/release_closeout.py \
  --plan /data/migration-rehearsals/本批次/retention-pending.json \
  --acceptance /data/migration-rehearsals/本批次/acceptance.json \
  --output-dir /data/migration-rehearsals/本批次/closeout-preflight
python3 ops/releases/release_closeout.py \
  --plan /data/migration-rehearsals/本批次/retention-pending.json \
  --acceptance /data/migration-rehearsals/本批次/acceptance.json \
  --reviewed-preflight /data/migration-rehearsals/本批次/closeout-preflight/preflight.json \
  --output-dir /data/migration-rehearsals/本批次/closeout-apply --apply
```

这是发布验收后的显式收尾步骤，不是定时清理，也不会在发布切换中删除镜像。清理与发布共用锁，每次只考虑本批次被替换组件的上上一版，必须有已验收历史、明确归属标签和来源提交。当前及上一版、全部容器引用（包括停止的容器）、配置引用、额外标签或明确保护的镜像均保留。未发布候选与来历不明的镜像不进入删除清单。

额外需要长留的镜像，在生产目录 `RETENTION_PROTECTED_IMAGES.json` 写固定镜像身份的 JSON 数组，或构建时加入 `org.jssngyl.retention.protect=true` 标签。计划外的特殊回退版本应先列入保护。每次删除前重查版本、验收和容器状态，任何变化停止；仅按准确身份执行带 `--no-prune` 的删除，保留未打标签的父镜像；不带强制参数，不使用整机清理命令。结果记录在本批次 `retention-*/result.json`，支持中断后重新核对、续做。

本自动核对及执行入口仅覆盖官网；数炬、报价系统仍沿用前述盘点方案，不自动处理。数据库、附件、配置、正式备份、恢复归档、发布历史记录和未用候选均不在此删除范围。缺失历史、恢复材料或验收证据时先保留，不能补写未经验证的成功记录。

收尾目录必须是新目录，不能覆盖之前的证据。`closeout-result.json` 分别记录检查通过、实际删除、零删除和失败；原删除回执也留存。检查通过不代表已经腾出空间，零删除不记作回收容量。缺验收、现场变化或工具版本改变时，先停止并重新核查。


### 统一发版入口的必做收尾与只读状态

统一发版负责人每轮必须完成以下动作：发布后验收并核对恢复材料；执行前面的收尾预检、复核实际清单，按授权明确执行；最后用新的只读入口读取实际结果及当前余量。没有合格旧镜像时，也要执行已有清单对应的明确收尾，留下“零删除”结果。缺验收、缺恢复材料或现场变化时保留所有对象，记录待处理或失败，不补写成功、不重发网站。

```sh
python3 ops/releases/release_storage_status.py \
  --live /opt/website --records-root /data/migration-rehearsals
```

入口从当前生产回执关联的发布结果目录定位清理计划，而不是按日期猜“最新批次”。它只读取已有文件及磁盘余量，不连接远程服务器、不调用 Docker、不写文件。控制记录限1MiB；实际验收材料采用流式读取核对完整摘要，避免大证据包一次装入内存。状态分别为：

- `pending`：计划已排队或正式收尾已开始，但还没有有效最终记录；预检通过也属于待执行。
- `no-targets`：本批正式收尾通过且零删除，仅说明本次有限清单没有合格目标；仍保留未核实或受保护对象，不表示全部历史积压清空。
- `cleaned`：本批正式收尾通过，记录了实际删除的镜像、原删除结果及收尾时余量。
- `failed`：正式收尾尝试失败，包括部分删除后失败、最终现场核验失败。实际删除仍保留记录，网站不因此回退。
- `missing`：当前有效回执缺关联计划或发布结果入口；`unknown`：证据缺失、被改动、路径不安全或发布仍在进行；`new-current`：指定计划或最近收尾记录属于另一份生产回执，不能套用旧结论。

正式 `release_closeout.py --apply` 在计划所在审计目录写独立的 `retention-latest.json`：开始时绑定本次尝试，完成后绑定计划、当前生产回执、原发布结果、验收及实际收尾结果的完整摘要；含零删除和失败。它不回写旧的接受记录、发布结果或生产回执。收尾中断、最终状态写入失败时保持待处理，不沿用旧成功。状态入口重新核对保留的浏览器和恢复材料，但已完成的历史收尾不会因为验收时间超过24小时失效；实际执行删除仍要求24小时内的有效验收。

状态入口同时重新读取当前磁盘余量，收尾时的余量仅作为历史观察值。其他应用写入可能抵消释放量，不把空间变化全部算成清理收益。

新批次可同时核对导入前容量，候选摘要取自已核对的构建记录；多个候选重复提供 `--candidate`：

```sh
python3 ops/releases/release_storage_status.py \
  --live /opt/website --records-root /data/migration-rehearsals \
  --candidate /private/release/candidate.json "$CANDIDATE_SHA256" \
  --image-store /var/lib/containerd --staging /data/migration-rehearsals/本批次
```

这里复用现有导入前规则，按实际文件系统合并“两份完整展开镜像＋尚未传输的归档＋每盘5GiB工作余量”，不设15GB总量门槛，不抵扣预计清理收益，也不假定镜像层复用。已完整传输的包仍使用前述完整核对后的 `check-import-after-transfer`，避免重算已占归档。候选容量组合模式仅在容量不足或候选容量证据不成立时返回非零状态（75），停止下一步传输或导入；收尾的待处理、失败或无法核验状态保留提醒，不能据此自动删东西。纯状态查询遇到无法核验或错批状态返回非零，不承担导入容量放行。

镜像两版保留只是程序恢复边界，不能代替数据库、上传附件和业务配置的有效备份。长期留存的特殊版本、数据备份和恢复归档继续单独保护。本入口不清理历史目录、传输包或其他系统，也不安装定时任务。

本轮仅提供工具和统一负责人的执行约定；实际导入器、网站发布器及其他窗口尚未自动调用新模块。必须安装配套版本、在实际统一发版入口执行上述命令并留存有效状态后，才能称治理机制已接入生产。代码测试通过或文档写完，不代表服务器已经自动回收，也不代表多个窗口会自动合并部署。

证据格式示例（占位身份必须换成现场核实值）：

```json
{
  "schemaVersion": 1,
  "collectedAt": "带时区的实际盘点时间",
  "components": {
    "shuju-engine": {
      "system": "shuju",
      "verified": true,
      "current": "sha256:当前镜像的64位小写十六进制标识",
      "previous": "sha256:上一可回退镜像的64位小写十六进制标识"
    }
  },
  "objects": [{
    "system": "shuju",
    "component": "shuju-engine",
    "kind": "image",
    "imageId": "sha256:待核对旧镜像的64位小写十六进制标识",
    "inUse": false,
    "protected": false,
    "stable": true,
    "referencesClear": true,
    "recoveryVerified": true
  }]
}
```

系统值为 `website`、`shuju`、`furnace`，组件必须属于同一系统。每个组件的两版镜像须不同，且两者均有恢复证据。所有对象都要确认未被容器、进程、待执行任务或回退方案引用，并核实复查期间内容未变。

目录/文件对象使用 `path`，还必须有 `isSymlink: false` 和 `ancestorsVerified: true`，确认本体和父目录均无软链接。允许进入候选的类型与额外证据如下：

- `source-copy`：只认数炬 `releases/repo-before-<提交>-<时间>`、报价系统 `backups/repo_<日期>_<时间>` 的历史源码副本；要求 `fullyCovered: true`，表示源码和配置均有完整、已核对的保留副本。
- `restore-drill`：只认网站备份批次下的 `data-restore-drill`；要求 `restorePassed: true`，失败或未完成的演练保留。
- `partial-transfer`：只认网站迁移接收目录下一层批次内的 `.partial` 文件；要求 `truncated: true`，已证明传输截断且无活动传输或其他引用。这类无效文件不要求存在完整副本。

其余类型、缺证对象一律保留。输出固定带 `deletionAuthorized: false`、`executed: false`。当前只是统一规划工具；数炬和报价系统自己的发布脚本、服务器定时任务并未因本仓库改动而自动接入。

## 登录地址变体与平滑重载

标准登录地址、末段大小写变体、尾斜杠及解码后相同的地址共用限速计数；其他后台操作的计数键为空，不占登录额度。规则使用新的 `admin_login_v2` 区域：Nginx 不允许在平滑重载时改变既有共享区域的计数键，因此不能直接复用旧 `admin_login` 名称。

本机可用 `python3 scripts/test_admin_login_reload.py --nginx /path/to/nginx` 验证旧规则到新规则的重载和 29 次相邻路径请求。完整模板验证仍使用 `scripts/test_admin_login_edge.py --docker /path/to/docker --image <已有镜像>`；这两种检查范围不同，发布前还须检查实际服务器完整配置。只更新前台镜像不会安装代理模板或备份脚本。

## 2026-09-29 验收修复发布

本批额外允许经过摘要固定的 `20260929160000_align_minimal_inquiry_contact_limits`：只放宽询盘姓名与联系方式容量，事务内设置 5 秒锁等待和 30 秒执行上限。部署前仍要求有效备份，部署后核对实际容量。回退只换应用版本，保留兼容旧版的容量扩展，不缩短或恢复客户数据。

## 已批准采购入口连续性发布门槛

普通发布实际更换前台镜像时，现有发布入口必须先检查候选容器的 11 个已批准中文采购页，再在切换后检查正式公网同一组页面。每页须为 HTML 200、有且只有一个匹配主题的正文主标题、足够正文、自己的正式规范地址、没有禁止收录、同一非隐藏联系条包含批准电话和微信入口，并列入网址地图。候选失败在切换前停止；新公网失败进入原有回退流程，不写成功回执。两份完整私有检查记录分别保存为 `candidate-acquisition.json` 和 `public-acquisition.json`，成功结果同时带对应检查摘要。

仅后台、仅后端、前台镜像未变及主动回退不加这一新合同；旧镜像恢复仍沿用其原撤回/案例/选型页合同，避免把新版 11 页要求套到历史回退版本。撤回案例和未批准英文页继续保持原保护。

安装发布工具时新增 `acquisition_continuity.py`、`acquisition-continuity.mjs`，与 `approved-guides.json` 和 `frontend_release.py` 保持同目录。Node 模块是前台独立检查器的原字节副本，测试要求两者保持一致；候选运行时通过标准输入交给现有镜像中的 Node，不需要前台镜像包含源脚本，不改镜像或安装依赖。候选只请求自身 `127.0.0.1:3000`，地图里的正式域子地址也映射回候选路径；切换后的公网检查显式选择正式域名。全程只读 GET、不提交询盘或联系动作；这些门槛不替代真实浏览器和实际接收验收，也不证明排名或咨询恢复。


### 单独批准的采购页面发布保护

原 `approved-guides.json` 的 11 页保持不变。`approved-procurement-pages.json` 单独记录 2026-10-05 用户已批准的两个中文采购页面、批准证据摘要、完整正文指纹和 9 个旧入口锚点。`procurement_approval.py` 将地址、批准记录摘要及源页面正文核对；不能在清单中临时加入第三页、英文页、变形地址或伪批准对象。

两个正式准备入口（前台专用及统一发布的前台分支）都会携带 `independentlyApprovedProcurementPages` 和 `procurementApprovalSha256`；统一发布的后端候选不受影响。候选清单只表示批准范围，不能证明候选已支持页面。发布工具另外在候选和切换后的公网用只读请求检查两页的 200、完整正文指纹、唯一标题及规范地址、索引许可、联系条、9 个唯一锚点、地图与入口链接；任一失败拒绝切换或恢复原版本。此检查不点击电话、微信或提交询盘，也不证明客户恢复。

成功收据持久保存独立采购范围；旧 4edd 批次收据已有的精确两页列表可以作为历史基线，但候选必须带批准记录摘要并通过实际检查。旧候选清单缺省为空，不会自动重新开放两页；回退按旧版本实际范围检查，关闭页和英文页仍需 404。安装标准发布工具时，还须同目录复制 `procurement_approval.py`、`approved-procurement-pages.json`、`approved_procurement_continuity.py`、`approved-procurement-continuity.cjs`。

## 可复用的发布准备、计时与续跑

新批次使用这里维护的程序和每批清单，不从历史 `output` 目录复制、替换日期或修改程序里的包大小。历史冻结材料仍保留原字节，正在执行的旧批次不自动迁移到新入口。安装时同目录加入 `preparation_guard.py`、`phase_runtime.py`、`release_closeout.py` 和 `release_storage_status.py`，使用配套版本的 `release_retention.py` 与 `storage_policy.py`。

准备基线记录全部运行服务、配置与版本摘要。只允许阶段开始前、同容器和同镜像的健康重启刷新启动时间；服务替换、版本或来源变化、配置或回执变化，以及新增未知容器仍停止。有效基线单独留存，原基线不改。阶段开始以后，包括实际切换和回退期间，仍严格核对启动时间，不能以准备前的刷新规则放行。

```sh
python3 ops/releases/frontend_release.py \
  --manifest /private/release/manifest.json \
  --capture-preparation-baseline /private/release/baseline.json
python3 ops/releases/frontend_release.py \
  --manifest /private/release/manifest.json \
  --preparation-baseline /private/release/baseline.json \
  --phase-directory /private/release/phases
python3 ops/releases/frontend_release.py \
  --status --phase-directory /private/release/phases
```

阶段记录分别保存开始、结束、实际执行秒数、通过或安全失败类别。每次尝试都有独立目录，失败和中断记录不会被覆盖。状态查询不连接生产、不改文件。预检失败或中断后，先查真实状态，再用同一清单、基线和阶段目录明确追加 `--resume`；该选项只允许重新核验预检。

正式发布沿用同一入口明确追加 `--apply`，仍须满足前述官方来源、候选验收、真实浏览器与恢复条件；不能只因为计时或准备基线通过就切换。已经尝试的切换不自动再执行，存在中断标记时仍进入现有核对和恢复流程。需要新一轮切换时，必须先确认上一轮结果，再重新准备新的批次记录。

这个入口覆盖发布器的候选预检与正式切换，不包含网络上传计时，也不取消共享主机的发布锁。候选打包和传输不长时间占用该锁；最终核验、切换和收尾继续逐项取得同一把锁。

## 减少重复页面检查

三端的代码检查、类型检查、单测和构建仍对实际提交执行。`scripts/visual-check-scope.py` 只对明确审阅过的统计、采集纯逻辑文件及其测试省略完整截图；组件、样式、图片、依赖、配置、截图用例和未知文件仍做完整截图。拿不到可靠比较提交、实际检出版本不符、基准图缺失时，也做完整截图。审阅阶段比较实际检出的合并树，正式分支比较本次推送的完整区间，不复用来源不匹配的成功标记。

此规则不能保证所有统计修复都省略截图：涉及采集组件 `.tsx` 时，仍按页面影响处理。既有截图标准、基准和页面交互不变。

## 可选的程序包分段复用

两个候选准备流程默认仍生成原单压缩归档，兼容现有正式证明器。只有明确设置 `segmented_archive: true` 的新批次才使用分段格式，候选清单附真实片段索引和格式标记。官方压缩包仍只有候选清单和完整镜像归档两个成员；完整归档的大小、摘要和镜像来源契约继续保留。

`archive_transfer.py` 只处理本地文件：从完整校验过的旧官方包建立缓存，打包本次缺失的片段，在接收端还原与本次官方包逐字节相同的文件，并重新核对官方完整摘要、镜像配置来源与每层实际内容。旧归档、没有缓存或不能分段的包走全包方式；缓存损坏不作为可复用片段，接收端缺失或损坏则要求补传。此工具不联网、不导入镜像、不切换服务、不清理文件。

```sh
python3 ops/releases/archive_transfer.py seed \
  --official /private/release/previous-official.zip \
  --official-sha256 <从官方记录取得的完整摘要> --cache /private/release/segments
python3 ops/releases/archive_transfer.py bundle \
  --official /private/release/current-official.zip \
  --official-sha256 <本次官方完整摘要> --cache /private/release/segments \
  --output /private/release/transfer.zip
python3 ops/releases/archive_transfer.py receive \
  --bundle /private/release/transfer.zip \
  --official-sha256 <本次官方完整摘要> --cache /private/release/segments \
  --output /private/release/restored-official.zip
```

发送端和接收端各自从同一个完整校验过的旧官方包建立缓存。官方摘要应来自已核对的构建记录，不取传输包自己的声明。首次没有缓存时仍全量传输。接收文件原子落盘且不覆盖同名文件，只有完整验证后才能交给发布链路。

缓存、传输包、还原时的临时文件和最终官方包会同时占用空间。分段复用减少的是重复传输，不能把它当作磁盘空间已经释放；使用前须按这些额外文件核对容量，现有导入容量检查不替代这一步。

分段归档需要用 `gzip.open` 完整解压后交给 `tarfile` 的 `r|` 模式；旧证明器的 `r|gz` 或自动识别的 `r|*` 无法完整读取拼接压缩成员。因此新格式必须使用新的完整验证入口，不能直接送旧证明器。新传输组件验证完成不替代服务器实际镜像身份、候选、浏览器和回退验收。实际传输节省和耗时尚须在正式启用后测量，不把模拟结果当作线上提速。

## 统一候选准备与验收材料核对

`release_candidate.py` 将归档核对、已传输包的容量核对、浏览器材料核对和证据打包收敛为一个准备入口。它仅读取已有文件并新建私人回执；不执行网络上传、镜像导入、容器切换、消息发送或清理。实际发布仍通过 `frontend_release.py` 的既有锁、官方来源、基线、恢复与 `--apply` 条件。安装时同目录加入 `archive_identity.py`、`browser_capture_guard.py`、`release_browser.py`、`release_candidate.py`，并使用本次正式检出版本的 `storage_policy.py`。

所有摘要由已经核对的构建或冻结记录传入，不能相信待核对文件自己声明的摘要。回执和证据包必须指定不存在的新路径，失败材料保留，不能覆盖后假装第一次通过。

```sh
python3 ops/releases/release_candidate.py verify-archive \
  --candidate /private/release/candidate.json --candidate-sha256 "$CANDIDATE_SHA256" \
  --archive /private/release/frontend.tar.gz --source-commit "$SOURCE_COMMIT" \
  --receipt /private/release/archive-proof.json
python3 ops/releases/release_candidate.py check-import-after-transfer \
  --candidate /private/release/candidate.json --candidate-sha256 "$CANDIDATE_SHA256" \
  --archive /private/release/staging/frontend.tar.gz \
  --staging /private/release/staging --image-store /data/docker \
  --receipt /private/release/staged-space-proof.json
```

归档核对完整读取一次压缩文件计算摘要，再顺序展开一次，核对实际配置、运行镜像身份和每层内容；不反复回退解压、不提取大包。已有 `archive_transfer.py` 的分段传输接口不变。这一步不替代正式构建来源证明、服务器导入后的实际镜像核对或浏览器验收。

普通传输前 `check-import` 规则保持不变。只有一个官方候选已经完整落在本机、真实大小和完整摘要一致、同一文件系统且位于指定暂存目录中时，才可以选用 `check-import-after-transfer`；已经占用的归档不会再次计作未来传输占用。仍保留每个文件系统的安全余量和两份完整镜像的导入余量，不以旧版本、层复用或删除文件抵扣。该命令本身仍完整核对本地归档，不能拿另一台机器的核对结果替代。

```sh
python3 ops/releases/release_candidate.py verify-browser \
  --root /private/release/frozen --plan-sha256 "$PLAN_SHA256" \
  --report browser/production-checks.json --report-sha256 "$REPORT_SHA256" \
  --phase production \
  --interaction-report browser/production-interaction-report.json \
  --interaction-sha256 "$INTERACTION_SHA256" \
  --receipt /private/release/browser-proof.json
```

冻结计划包含原页面契约及其文件摘要；页面报告必须绑定实际截图、观察、原始日志、采集器和前后实际运行身份。正式线上必须有真实非空的测试访问身份，以及完整交互矩阵；联系人任务要实际打开弹窗，但不拨号、不发消息、不提交表单。默认交互矩阵为电脑、手机各四项，新计划如有批准的不同矩阵须显式冻结 `interactionContract`。候选阶段只核对基础页面，不能声称已经做过线上交互。

仅候选阶段允许额外传入 `--preview-sha256`：事先冻结的声明必须绑定原计划与原20项页面契约，变化只能是四个无查询参数的中英文首页，将测试身份断言改成实际回环预览已抑制统计。必须保留原诊断材料、观察到真实抑制、两项身份均为空；正式线上禁止使用该豁免。此声明不会修改原计划，也不会将旧失败材料改为成功。

`pack-browser` 使用同一组浏览器参数，另加 `--bundle /private/release/browser-evidence.tar.gz`。保留 `browser` 目录中的历史失败与成功材料；空文件仅接受已被报告绑定的真实 `console.log` 或 `errors.log`。每个文件最多32MiB、最多3000个文件，原文件总量与最终压缩包分别最多128MiB，输出仅本人可读写。包内保留失败不表示失败检查已通过。 已有同批候选或失败材料可通过重复的 `--retained-report <相对报告路径> <外部核对摘要>` 绑定；逐份核对同批来源、计划与全部材料摘要，仅用于保留，不参与本次通过数量。

`prepare-routing-receipt --help` 提供一个仅本地的路由回执提案：先核对线上基础与交互报告、外部绑定的最终状态、历史入口与相邻路径摘要，只构造本批边缘路由对象，其他对象保持相等，旧完整回执摘要作为历史来源。提案不是生产回执安装工具，也不替代正式部署回执；安装前仍需要发布锁和新的实时状态核对。此轮不新增线上自动安装、保留策略或删除行为。

# 固定程序包发布与前台回退

旧 `Build And Deploy` 已从代码中取消 main 推送触发，仓库开关继续关闭。它仍是保留的旧流程；当前生产版本带固定镜像标记，会在同步前拒绝该路径。不要删除标记后恢复服务器构建。容量不足时不再自动清理这台共享服务器。

新入口 `frontend_release.py` 只使用已经导入并核对身份的镜像，绝不构建、拉取代码、迁移或恢复数据库。它只替换前台并重新载入现有代理配置，不重启后端、后台、数据库或共享代理。后端或数据改动需要另做有数据保护证据的发布方案，不能混用前台回退。

1. 在独立构建环境从完整 Git 提交生成镜像；将程序包、压缩包校验值、源提交和镜像标识长期保存到经确认的独立存储。传输和导入前，按下文容量检查预留“全部候选镜像展开体积的两倍 + 压缩包体积 + 5 GiB 工作空间”；不再占用生产资源重复构建。`prepare-frontend.yml` 只构建候选，不连接生产机。
2. 按 `manifest.example.json` 填写服务器实际导入的不可变镜像身份，以及当前前台身份。先不加 `--apply` 运行检查。候选在独立容器中验证，中英文首页、资料、询价、产品、公司页必须正确；选型文章、专题方案和未经审核的案例必须为 404，网站地图不得列入它们；已审核的案例按下文“项目案例逐篇放出”检查。旧镜像未通过就拒绝切换。
3. 完成候选真实浏览器验收、通知收件与独立备份验证后，明确执行 `--apply`。切换失败会恢复前一前台并重新检查；若恢复也失败，记录真实运行版本和待处理状态，不显示成功。`--kind rollback` 使用相同检查，绝不恢复旧数据库覆盖新询盘。

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
- 任何状态下，选型文章、专题方案、代表性草稿案例都必须返回 404，网站地图及其语言备用链接都不能出现它们。网站地图不列出案例列表分页。

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

`prepare-release.yml` builds both frontend and backend from the exact CI-passed main commit, outside production. It does not deploy automatically. Each component records its archive checksum and immutable image identity.

`frontend_release.py` retains its frontend-only mode. An explicit `backend` manifest entry enables a two-component release using the same source commit. It checks both current versions, runs the backend aggregate as a read-only command without starting a second notification worker, and permits only the reviewed additive content-attribution index migration. PostgreSQL, uploads, admin, nginx container identity and unrelated applications remain protected. On a failed application switch both prior application images are restored; the additive index can safely remain. Customer data is never restored or reset by this operation. An interrupted or unsuccessful recovery leaves the deployment marker for manual reconciliation.

The backend entry must contain `image`, `expectedCurrentImage`, and `archiveSha256`. A database backup and restore rehearsal must precede the apply step. Failure notification is optional until its independent destination is explicitly configured; an operator must supervise the release in that case.

## 2026-09-19 已审核指南逐页发布

网站负责人已批准导航 A 与 8 个中文指南页面的部署。`approved-guides.json` 是这一批的唯一路径清单，前台与发布工具共用；全局 `TECHNICAL_CONTENT_PUBLISHED` 仍为 false。其余文章、解决方案列表、英文指南和未批准案例保持关闭。页面自身与中间件分别验证，网站地图只列出这 8 页的中文地址。

新候选清单携带 `approvedGuides`；缺省为空，旧候选与回退清单不会自动公开指南。发布检查要求清单中每一页为 200 并进入网站地图，清单外的指南与变形地址仍为 404。检查当前版本和失败恢复时兼容旧版指南全部关闭的状态。成功回执新增 `frontendRelease.servedGuides`，作为下一次发布的实际基线。安装工具时必须一并复制 `approved-guides.json`。

## 指定后台界面的发布

`prepare-admin.yml` 从已通过主分支检查的完整提交构建后台候选，不连接生产。只有清单显式包含 `admin`（`image`、`expectedCurrentImage`、`archiveSha256`）时，发布工具才允许替换后台；镜像必须与前台来自同一提交。没有该字段时，后台继续受到保护。

预检在独立静态容器检查入口、询盘版本和“只看通知未送达”所在的实际页面程序包；上线后核对公网资源与候选逐文件一致。该静态检查不能代替登录后的筛选验收。任何切换后检查失败会同时恢复此前的前台和后台，保留数据库、附件、后端及共享代理容器不变。不发送测试询盘或通知。

## 后台单独发布与入口缓存

清单显式设置 `adminOnly: true` 时，只允许替换 `admin`，不得包含 `backend`，顶层 `image` 必须等于 `expectedCurrentImage` 并对应当前前台。`sourceCommit` 是新后台候选来源，前台沿用原回执中的来源和公开范围；前台容器、`frontendRelease` 与 `DEPLOY_COMMIT` 保持不变。

后台候选及切换后的公网必须验证入口不缓存、失效脚本返回 404，同时保持现有资源和询盘版本检查。任何检查失败只恢复此前后台，禁止为本次后台修复重建或替换前台、后端和数据库。共享代理仅做配置校验和正常重载以更新后台地址，不重建容器。仍使用现有发布锁、固定镜像、私有回执和中断保护。

主动回退使用 `--kind rollback`，保留入口、资源及版本检查，但允许上一版缓存策略，避免旧版没有 no-store 而无法回退。普通部署仍强制验证新缓存策略。

## 数据变更与备份检查顺序

只有发布清单明确包含后端，且存在清单内已审核的增量迁移时，才走数据变更路径。预检先核对迁移历史和文件摘要；旧库尚无新字段时，延后依赖新字段的查询。正式切换前，`backup_gate.py` 要求最近 26 小时内成功的每日备份、同批数据库和附件归档、匹配的校验文件，并实际重新读取归档校验摘要及压缩完整性。

顺序为：迁移身份预检 → 本地每日备份校验 → 获准的增量迁移 → 新代码查询检查 → 程序切换 → 运行中后端复核。备份不合格时不会迁移或替换程序；最终复核不能以“查询延后”代替通过。此校验不代表恢复演练或自动异地备份完成；本批仍沿用现有每日备份，外部监测和新告警群保持暂缓。

安装发布工具时必须同时安装 `storage_policy.py`、`backup_gate.py` 与 `check-backend.cjs`，保留同目录关系。仅前台或仅管理后台发布不启动这条迁移路径。

## 发布包体积与容量检查

前台构建后由 `frontend/scripts/prepare-standalone.mjs` 将完整的 `public` 和 `.next/static` 合入运行目录，再一次性复制进最终镜像。Next 文件追踪可能已经带入部分公开资源，不能再分别复制公开资源层和运行目录层，也不能假设追踪结果涵盖全部图片、视频。

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

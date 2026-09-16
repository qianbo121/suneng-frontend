# 固定程序包发布与前台回退

旧 `Build And Deploy` 已从代码中取消 main 推送触发，仓库开关继续关闭。它仍是保留的旧流程；当前生产版本带固定镜像标记，会在同步前拒绝该路径。不要删除标记后恢复服务器构建。容量不足时不再自动清理这台共享服务器。

新入口 `frontend_release.py` 只使用已经导入并核对身份的镜像，绝不构建、拉取代码、迁移或恢复数据库。它只替换前台并重新载入现有代理配置，不重启后端、后台、数据库或共享代理。后端或数据改动需要另做有数据保护证据的发布方案，不能混用前台回退。

1. 在独立构建环境从完整 Git 提交生成镜像；将程序包、压缩包校验值、源提交和镜像标识长期保存到经确认的独立存储。导入前预留“镜像展开体积 + 压缩包体积 + 2 GiB 工作空间”；不再占用生产资源重复构建。`prepare-frontend.yml` 只构建候选，不连接生产机。
2. 按 `manifest.example.json` 填写服务器实际导入的不可变镜像身份，以及当前前台身份。先不加 `--apply` 运行检查。候选在独立容器中验证，中英文首页、资料、询价、产品、公司页必须正确；撤下的案例、方案路径必须为 404，网站地图不得重新列入它们。旧镜像未通过就拒绝切换。
3. 完成候选真实浏览器验收、通知收件与独立备份验证后，明确执行 `--apply`。切换失败会恢复前一前台并重新检查；若恢复也失败，记录真实运行版本和待处理状态，不显示成功。`--kind rollback` 使用相同检查，绝不恢复旧数据库覆盖新询盘。

```sh
python3 ops/releases/frontend_release.py --manifest /private/path/manifest.json
python3 ops/releases/frontend_release.py --manifest /private/path/manifest.json --apply
python3 ops/releases/frontend_release.py --manifest /private/path/previous-compatible.json --apply --kind rollback
```

`verified-images.override.yml` 和 `RELEASE_ARTIFACTS.json` 在验证后更新；新构建版本同时更新 `DEPLOY_COMMIT`。每次操作保存前一版本记录及操作日志。若存在 `DEPLOYMENT_IN_PROGRESS.json`，说明上次操作中断，后续发布会拒绝继续；按其中记录的私有审计目录核对运行镜像与前一版本，完成恢复核查后才能清除此标记。

回退只能使用经过相同撤下规则检查的版本。目前最安全的下一版回退基线是已验收的 R4。原先上线前的旧前台可能重新公开已撤下内容，不能继续直接执行旧的 `rollback-frontend.py`。

通知：缺少接收渠道或平台拒收现在会明确报错。平台响应成功仍不等于真人收件，需用户选定接收渠道并批准一次带“部署测试”标记的实际收件验收。

备份：现有数据库和附件的每日备份保留。独立存储目的地、加密公钥、保留时间与恢复操作人未确定前，不将客户数据传到任意外部位置。应使用只读备份包、内容校验、加密上传和下载恢复验证；同盘压缩完整性检查不能当作独立备份验收。

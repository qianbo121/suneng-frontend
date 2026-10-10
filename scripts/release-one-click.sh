#!/usr/bin/env bash
set -euo pipefail

# Retired entry: do not create branches, run unrelated tests, push, or deploy.
cat >&2 <<'NOTICE'
旧一键发布入口已停用。
请由统一发版窗口按 DEPLOY.md 和 ops/releases/README.md 汇总待发范围。
准备候选默认只构建前台；业务后台、管理后台及组合必须明确选择。
提交、推送与生产发布分别需要授权；此脚本不执行这些动作。
NOTICE
exit 64

#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

APP_NAME="江苏苏能官网-成文"
BRANCH_NAME="main"
WORKFLOW_NAME="Build And Deploy"
GITHUB_ACTIONS_URL="https://github.com/qianbo121/suneng-frontend/actions/workflows/deploy.yml"

echo "🚀 $APP_NAME 一键发布"

git_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$git_branch" != "$BRANCH_NAME" ]]; then
  echo "❌ 只能在 $BRANCH_NAME 分支发布。当前分支：$git_branch"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ 工作区不是干净状态，先提交/清理未提交改动。"
  git status --short
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ 未检测到 origin 远端，请先配置 GitHub 仓库。"
  exit 1
fi

echo "✅ 已确认：当前为 $BRANCH_NAME 且工作区干净。"

echo "📤 正在推送到 origin/$BRANCH_NAME..."
if ! git push origin "$BRANCH_NAME"; then
  echo "❌ 推送失败。请先修复网络/DNS 后重试，或改用手动触发 GitHub Actions。"
  exit 1
fi

echo "✅ 推送完成。"

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    echo "🚚 正在通过 GitHub Actions 一键发布（workflow_dispatch）..."
    if gh workflow run "$WORKFLOW_NAME" --branch "$BRANCH_NAME"; then
      echo "✅ 发布触发成功。"
      echo "🔎 跟踪链接：$GITHUB_ACTIONS_URL"
      echo "⏳ 发布中可直接在该页面查看执行日志。"
      exit 0
    else
      echo "⚠️ workflow_run 触发失败，改为提示你手工点击运行。"
    fi
  else
    echo "⚠️ 检测到 gh 未登录，改为提示你手工点击运行。"
  fi
else
  echo "⚠️ 未检测到 gh CLI，改为提示你手工点击运行。"
fi

echo "🧭 手工一键发布入口（无需记命令）："
echo "   $GITHUB_ACTIONS_URL"
echo "步骤：Open Actions → Build And Deploy → Run workflow → Run"

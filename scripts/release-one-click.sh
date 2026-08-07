#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

APP_NAME="江苏苏能官网-成文"
GITHUB_ACTIONS_URL="https://github.com/qianbo121/suneng-frontend/actions/workflows/deploy.yml"
BASE_BRANCH="main"

echo "🚀 $APP_NAME 一键发布"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ 工作区不是干净状态，先提交/清理未提交改动。"
  git status --short
  exit 1
fi

git_branch="$(git rev-parse --abbrev-ref HEAD)"
release_branch="$git_branch"

if [[ "$git_branch" == "$BASE_BRANCH" ]]; then
  echo "⚠️ 当前在 $BASE_BRANCH 分支：按安全策略不允许直接推送到 main。"
  echo "✅ 将自动创建发布分支并在其上推送（不改业务内容，仅用于 PR 流程）。"

  now_stamp="$(date +%Y%m%d-%H%M)"
  release_branch="release/$now_stamp"
  index=1
  while git show-ref --verify --quiet "refs/heads/$release_branch"; do
    release_branch="release/$now_stamp-$index"
    index=$((index + 1))
  done

  git checkout -b "$release_branch"
  echo "🌱 已创建并切到发布分支：$release_branch"
fi

if [[ "$release_branch" == "$BASE_BRANCH" ]]; then
  echo "❌ 无法确认发布分支来源。请确认仓库状态后重试。"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ 未安装 pnpm，无法执行后台门禁测试。请先安装并重试。"
  exit 1
fi

echo "🧪 运行 backend 守卫回归测试（最低验收门）..."
if ! pnpm --dir backend test; then
  echo "❌ backend 测试未通过，发布流程中止。请先修复用例。"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ 未检测到 origin 远端，请先配置 GitHub 仓库。"
  exit 1
fi

remote_url="$(git remote get-url origin)"
if [[ ! "$remote_url" =~ github.com[:/]+([^/]+)/([^/.]+)(\.git)?$ ]]; then
  echo "❌ 无法解析 origin URL 的仓库信息：$remote_url"
  exit 1
fi
repo_owner="${BASH_REMATCH[1]}"
repo_name="${BASH_REMATCH[2]}"

echo "✅ 已确认：发布分支=$release_branch，工作区干净。"
echo "🧾 预置对比基线：$BASE_BRANCH"

echo "📤 正在推送到 origin/$release_branch..."
if ! git push -u origin "$release_branch"; then
  echo "❌ 推送失败。请先修复网络/DNS 后重试。"
  exit 1
fi

echo "✅ 推送完成。"
pr_url="https://github.com/${repo_owner}/${repo_name}/compare/${BASE_BRANCH}...${release_branch}?expand=1"
echo "📌 立即打开以下链接发起 PR（CI 只有通过 PR 才会触发）："
echo "   $pr_url"

echo ""
echo "📘 生产验收清单（CI 通过 + 合并后再执行）"
echo "1) PR 是否已合并：origin/main 更新到最新提交"
echo "2) 后台登录路由与主页接口回归"
echo "3) /api/health = 200"
echo "4) /api/svc/news/read 有效 token = 200"
echo "5) 数炬 token 打 /admin/** 为 401"
echo "6) /api/svc/* 公开路径 404"
echo "7) /api/svc/news/read 非 GET 为 404/405"
echo "8) nginx 仅内网可达专用入口（外网 404）"

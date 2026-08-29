#!/bin/sh
set -eu

BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo detached)"
COMMIT="$(git rev-parse HEAD)"
if git show-ref --verify --quiet refs/remotes/origin/main; then
  MAIN_REF=origin/main
else
  MAIN_REF=main
fi
if git merge-base --is-ancestor "$COMMIT" "$MAIN_REF" 2>/dev/null; then
  MERGED=是
else
  MERGED=否
fi

echo "分支: $BRANCH"
echo "提交: $COMMIT"
echo "是否进main: $MERGED"
echo "main提交号: $(git rev-parse "$MAIN_REF")"


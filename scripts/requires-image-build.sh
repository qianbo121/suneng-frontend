#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-HEAD^}"
head_ref="${2:-HEAD}"

# Missing comparison history must fail safe and build images.
if ! git rev-parse --verify "${base_ref}^{commit}" >/dev/null 2>&1 \
  || ! git rev-parse --verify "${head_ref}^{commit}" >/dev/null 2>&1; then
  echo "Production image build required: comparison history is unavailable."
  exit 0
fi

while IFS= read -r changed_path; do
  [ -n "$changed_path" ] || continue

  case "$changed_path" in
    .github/* | \
    .dockerignore | \
    deploy.sh | \
    backup.sh | \
    nginx.prod.conf.template | \
    ops/* | \
    docs/* | \
    scripts/requires-image-build.sh | \
    frontend/tests/* | \
    frontend/test-results/* | \
    *.md | \
    *.spec.ts | \
    *.test.ts)
      ;;
    *)
      echo "Production image build required by: $changed_path"
      exit 0
      ;;
  esac
done < <(git diff --name-only --diff-filter=ACDMRTUXB "$base_ref" "$head_ref")

echo "No production image inputs changed; existing images are reusable."
exit 1

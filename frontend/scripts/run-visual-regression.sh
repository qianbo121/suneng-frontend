#!/usr/bin/env bash
set -euo pipefail

visual_next_env_backup="$(mktemp -t suneng-visual-next-env.XXXXXX)"
visual_tsconfig_backup="$(mktemp -t suneng-visual-tsconfig.XXXXXX)"

restore_next_generated_files() {
  cp "$visual_next_env_backup" next-env.d.ts
  cp "$visual_tsconfig_backup" tsconfig.json
  rm -f "$visual_next_env_backup" "$visual_tsconfig_backup"
  rm -rf .next-visual
}

trap restore_next_generated_files EXIT

cp next-env.d.ts "$visual_next_env_backup"
cp tsconfig.json "$visual_tsconfig_backup"

if [ "${1:-}" = '--' ]; then
  shift
fi

pnpm exec playwright test --config=playwright.visual.config.ts "$@"

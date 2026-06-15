#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "scripts/deploy-prod.sh is deprecated; delegating to deploy.sh."
exec "$ROOT_DIR/deploy.sh" "$@"

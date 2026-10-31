#!/usr/bin/env bash
# Runs the adapter's isolated-PDS round-trip suite. Installs the local PDS tooling if needed.
# This verifies the adapter against a real local PDS — it does NOT verify public federation.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ ! -d tools/local-pds/node_modules ]; then (cd tools/local-pds && npm install --no-audit --no-fund); fi
npx vitest run server/test/atproto

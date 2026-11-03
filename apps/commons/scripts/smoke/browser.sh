#!/usr/bin/env bash
set -euo pipefail
# Aurora replaced the old hash UI. Multi-entry CLI/MCP write coverage remains in multi-entry.sh.
# This browser check exercises the current shell plus real API find/inspect and corpus compare.
cd "$(dirname "$0")/../.."
S=$(mktemp -d)
OUT=${OUT:-$S/out}
mkdir -p "$OUT"
export BRAINSTORM_DATA_FILE="$S/memory.json" BRAINSTORM_DEFAULT_ORCHESTRATION=deterministic PORT=8796
node --import tsx server/http/server.ts > "$S/server.log" 2>&1 & SP=$!
BRAINSTORM_API=http://127.0.0.1:8796 npx vite --host 127.0.0.1 --port 5196 --strictPort > "$S/vite.log" 2>&1 & VP=$!
trap 'kill "$VP" "$SP" 2>/dev/null || true; wait 2>/dev/null || true' EXIT
for i in $(seq 80); do
  if curl -sf http://127.0.0.1:8796/health >/dev/null && curl -sf http://127.0.0.1:5196/ >/dev/null; then break; fi
  sleep 0.25
done
AURORA_URL=http://127.0.0.1:5196 AURORA_API_URL=http://127.0.0.1:8796 AURORA_REPORT_DIR="$OUT" node scripts/aurora/verify.mjs
echo "PASS Aurora browser smoke · evidence in $OUT"

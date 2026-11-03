#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
TMP_LAB=$(mktemp -d)
npx vite preview --host 127.0.0.1 --port 5197 --strictPort > "$TMP_LAB/preview.log" 2>&1 & LAB_PID=$!
trap 'kill "$LAB_PID" 2>/dev/null || true; wait "$LAB_PID" 2>/dev/null || true' EXIT
for i in $(seq 80); do
  if ! kill -0 "$LAB_PID" 2>/dev/null; then cat "$TMP_LAB/preview.log"; exit 1; fi
  if curl -sf http://127.0.0.1:5197/lab >/dev/null; then break; fi
  sleep 0.25
done
LAB_URL=http://127.0.0.1:5197 LAB_REPORT_DIR=${LAB_REPORT_DIR:-$TMP_LAB/report} node scripts/lab/browser.mjs

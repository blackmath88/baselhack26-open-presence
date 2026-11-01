set -u
# Phase 1 journey smoke (local only; temp data; API :8795, UI :5195, DevTools :9335, all on 127.0.0.1).
# Situation → search → record → passage → original source link → reload → back, plus not-found,
# unknown-passage, failed-load/retry, keyboard and 360 px checks. Asserts rendered quotes equal the
# corpus. Needs a Chromium/Chrome binary (CHROMIUM=…); skips visibly without one.
cd "$(dirname "$0")/../.."
BROWSER=${CHROMIUM:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)}
if [ -z "$BROWSER" ]; then echo "SKIP: no Chromium found (set CHROMIUM=/path/to/chrome)"; exit 0; fi
S=$(mktemp -d); OUT=${OUT:-$S/out}; mkdir -p "$OUT"
export BRAINSTORM_DATA_FILE=$S/journey.json PORT=8795
node --import tsx server/http/server.ts > $S/server.log 2>&1 & SP=$!
BRAINSTORM_API=http://127.0.0.1:8795 npx vite --host 127.0.0.1 --port 5195 --strictPort > $S/vite.log 2>&1 & VP=$!
"$BROWSER" --headless=new --no-sandbox --disable-gpu --remote-debugging-port=9335 --remote-debugging-address=127.0.0.1 --user-data-dir=$S/chrome about:blank > $S/chrome.log 2>&1 & CP=$!
trap 'kill $CP $VP $SP 2>/dev/null; wait 2>/dev/null' EXIT
for i in $(seq 80); do curl -sf http://127.0.0.1:8795/health >/dev/null && curl -sf http://127.0.0.1:5195/ >/dev/null && curl -sf http://127.0.0.1:9335/json/version >/dev/null && break; sleep 0.25; done
SESSION=$(curl -s -X POST http://127.0.0.1:8795/api/auth/session -H 'content-type: application/json' -d '{"participantId":"kai"}')
TOKEN=$(echo "$SESSION" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
ACTOR=$(echo "$SESSION" | python3 -c "import sys,json;print(json.dumps(json.load(sys.stdin)['actor']))")
WS=$(curl -s http://127.0.0.1:9335/json/version | python3 -c "import sys,json;print(json.load(sys.stdin)['webSocketDebuggerUrl'])")
timeout 120 node scripts/smoke/journey.mjs "$WS" http://127.0.0.1:5195 "$TOKEN" "$ACTOR" "$OUT" || { echo "journey failed; logs in $S"; exit 1; }
echo "PASS journey smoke · evidence in $OUT"

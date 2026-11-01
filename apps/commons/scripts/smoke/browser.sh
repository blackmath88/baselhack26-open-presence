set -u
# Cross-entrance browser smoke (local only; temp data; API :8796, UI :5196, DevTools :9336, all on 127.0.0.1).
# CLI (Kai) cites issue/148 → browser (Lea): repository view → contribution → reply → respond to a passage
# → CLI rediscovers Lea's contributions with name, entrance, passage and source refs.
# Needs a Chromium/Chrome binary (CHROMIUM=…); skips visibly without one. Output: evidence dir in $OUT.
cd "$(dirname "$0")/../.."
BROWSER=${CHROMIUM:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)}
if [ -z "$BROWSER" ]; then echo "SKIP: no Chromium found (set CHROMIUM=/path/to/chrome)"; exit 0; fi
S=$(mktemp -d); OUT=${OUT:-$S/out}; mkdir -p "$OUT"
export BRAINSTORM_DATA_FILE=$S/smoke.json PORT=8796 COMMONS_API=http://127.0.0.1:8796
node --import tsx server/http/server.ts > $S/server.log 2>&1 & SP=$!
BRAINSTORM_API=http://127.0.0.1:8796 npx vite --host 127.0.0.1 --port 5196 --strictPort > $S/vite.log 2>&1 & VP=$!
"$BROWSER" --headless=new --no-sandbox --disable-gpu --remote-debugging-port=9336 --remote-debugging-address=127.0.0.1 --user-data-dir=$S/chrome about:blank > $S/chrome.log 2>&1 & CP=$!
trap 'kill $CP $VP $SP 2>/dev/null; wait 2>/dev/null' EXIT
for i in $(seq 80); do curl -sf http://127.0.0.1:8796/health >/dev/null && curl -sf http://127.0.0.1:5196/ >/dev/null && curl -sf http://127.0.0.1:9336/json/version >/dev/null && break; sleep 0.25; done
cli(){ node --import tsx scripts/commons/cli.ts "$@"; }
PROBLEM=usb-c-no-data PASSAGE=e2
echo "== CLI (Kai): attempt citing issue/148"
CID=$(BRAINSTORM_PARTICIPANT=Kai cli submit --problem $PROBLEM --text "smoke-cli-marjoram: issue 148 workaround only works through a USB-A hub" --kind attempt --ref issue/148 --command-id smoke-browser-1 | python3 -c "import sys,json;print(json.load(sys.stdin)['contributionId'])")
echo "contribution $CID"
SESSION=$(curl -s -X POST http://127.0.0.1:8796/api/auth/session -H 'content-type: application/json' -d '{"participantId":"lea"}')
TOKEN=$(echo "$SESSION" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
ACTOR=$(echo "$SESSION" | python3 -c "import sys,json;print(json.dumps(json.load(sys.stdin)['actor']))")
WS=$(curl -s http://127.0.0.1:9336/json/version | python3 -c "import sys,json;print(json.load(sys.stdin)['webSocketDebuggerUrl'])")
echo "== browser (Lea)"
timeout 120 node scripts/smoke/browser.mjs "$WS" http://127.0.0.1:5196 "$TOKEN" "$ACTOR" "$OUT" "$CID" $PROBLEM $PASSAGE || { echo "browser leg failed; logs in $S"; exit 1; }
echo "== CLI (Kai) rediscovers the browser contributions"
BRAINSTORM_PARTICIPANT=Kai cli thread "$CID" | python3 -c "
import sys,json
d=json.load(sys.stdin); r=[x['contribution'] for x in d['root']['replies']]
print('thread replies:',[(c['actor'].get('displayName'),c['entrance'],c['text'][:32]) for c in r])
assert any(c['actor'].get('displayName')=='Lea' and c['entrance']=='browser' for c in r), 'browser reply missing from CLI thread'"
BRAINSTORM_PARTICIPANT=Kai cli inspect $PROBLEM | python3 -c "
import sys,json
d=json.load(sys.stdin); cites=d['evidenceCitations']
mine={k:[(c['actor'].get('displayName'),c['entrance'],c.get('evidenceIds')) for c in v if c['excerpt'].startswith('smoke-passage')] for k,v in cites.items()}
print('passage citations:',mine)
assert [k for k,v in mine.items() if v]==['$PASSAGE'], 'passage response not attached to exactly $PASSAGE'"
BRAINSTORM_PARTICIPANT=Kai cli search bergamot | python3 -c "
import sys,json
d=json.load(sys.stdin); c=d['contributions'][0]['summary']
print('search:',c['actor'].get('displayName'),c['entrance'],[r['objectId'] for r in c['sourceRefs']])
assert c['actor'].get('displayName')=='Lea' and c['entrance']=='browser' and c['sourceRefs'], 'search summary lacks author/entrance/refs'"
echo "PASS browser smoke · evidence in $OUT"

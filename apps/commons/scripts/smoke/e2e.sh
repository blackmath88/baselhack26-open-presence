set -u
# Local end-to-end smoke: import, submit, idempotent retry, second session, real restart, concurrent reviews.
# Uses a throwaway data file and port 8799. Prototype auth only; never expose publicly.
cd "$(dirname "$0")/../.."
S=$(mktemp -d)
export BRAINSTORM_DATA_FILE=$S/e2e.json PORT=8799
B=http://localhost:8799
start(){ node --import tsx server/http/server.ts > $S/server.log 2>&1 & echo $! > $S/pid; for i in $(seq 40); do curl -sf $B/health >/dev/null && break; sleep 0.25; done; }
stop(){ kill $(cat $S/pid); while kill -0 $(cat $S/pid) 2>/dev/null; do sleep 0.1; done; curl -sf $B/health >/dev/null && echo 'ERROR: server still up' || echo "server pid $(cat $S/pid) stopped"; }
start; grep Commons $S/server.log
P=$(curl -s $B/api/participants | python3 -c "import sys,json;print(' '.join(p['id'] for p in json.load(sys.stdin)['participants'][:2]))"); set -- $P; echo participants $1 $2
T1=$(curl -s -XPOST $B/api/auth/session -H 'content-type: application/json' -d "{\"participantId\":\"$1\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
T2=$(curl -s -XPOST $B/api/auth/session -H 'content-type: application/json' -d "{\"participantId\":\"$2\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
REF=$(curl -s $B/api/commons/rooms/usb-c-no-data -H "authorization: Bearer $T1" | python3 -c "import sys,json;print(json.load(sys.stdin)['source']['evidence'][0]['source']['objectId'])")
BODY="{\"commandId\":\"e2e-cmd-1\",\"problemId\":\"usb-c-no-data\",\"text\":\"Same on my M2 Mac: the frame charges but never mounts.\",\"circumstances\":\"macOS 15, USB-C cable\",\"sourceRefs\":[\"$REF\"],\"preparedBy\":\"browser-draft\"}"
echo submit: $(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/api/commons/contributions -H "authorization: Bearer $T1" -H 'content-type: application/json' -d "$BODY")
echo retry-same: $(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/api/commons/contributions -H "authorization: Bearer $T1" -H 'content-type: application/json' -d "$BODY")
echo retry-different: $(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/api/commons/contributions -H "authorization: Bearer $T1" -H 'content-type: application/json' -d "${BODY/never mounts/mounts}")
count(){ curl -s "$B/api/problems/commons:usb-c-no-data" -H "authorization: Bearer $1" | python3 -c "import sys,json;d=json.load(sys.stdin);s=d.get('state',d);cs=[c for c in s['contributions'] if 'M2 Mac' in c['content']];print(len(cs), cs[0]['provenance']['authoredBy'] if cs else '-', cs[0]['provenance'].get('preparedBy') if cs else '-')"; }
echo session2 sees: $(count $T2)
echo problems listed: $(curl -s $B/api/problems -H "authorization: Bearer $T2" | python3 -c "import sys,json;print(sum(p['id'].startswith('commons:') for p in json.load(sys.stdin)['problems']))")
stop; start; grep Commons $S/server.log
T3=$(curl -s -XPOST $B/api/auth/session -H 'content-type: application/json' -d "{\"participantId\":\"$2\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
echo after-restart: $(count $T3)
T1=$(curl -s -XPOST $B/api/auth/session -H 'content-type: application/json' -d "{\"participantId\":\"$1\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
echo retry-after-restart: $(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/api/commons/contributions -H "authorization: Bearer $T1" -H 'content-type: application/json' -d "$BODY") then $(count $T3)
PID=$(curl -s $B/api/commons/rooms/emmc-not-exposed -H "authorization: Bearer $T3" | python3 -c "import sys,json;d=json.load(sys.stdin);print(next((p['id'] for p in d['proposals'] if p['status']=='pending'),''))")
echo proposal $PID
if [ -n "$PID" ]; then for d in accept reject; do curl -s -o $S/r_$d.txt -w "$d:%{http_code} " -XPOST $B/api/commons/reviews -H "authorization: Bearer $T3" -H 'content-type: application/json' -d "{\"commandId\":\"rev-$d\",\"proposalId\":\"$PID\",\"decision\":\"$d\"}" & PIDS="${PIDS:-} $!"; done; wait $PIDS; echo; head -c 300 $S/r_accept.txt; echo; head -c 300 $S/r_reject.txt; echo; fi
stop

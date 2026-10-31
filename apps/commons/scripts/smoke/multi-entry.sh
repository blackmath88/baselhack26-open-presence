set -u
# Multi-entry smoke: the CLI entrance against a real local server (temp data, port 8798).
# Covers: search, repository browse, inspect, draft (no write), submit, idempotent retry, reply, thread,
# context, moderation, publication state without an ATProto account, status. Prototype auth only.
cd "$(dirname "$0")/../.."
S=$(mktemp -d)
export BRAINSTORM_DATA_FILE=$S/smoke.json PORT=8798 COMMONS_API=http://127.0.0.1:8798
node --import tsx server/http/server.ts > $S/server.log 2>&1 & PID=$!
trap 'kill $PID 2>/dev/null; wait $PID 2>/dev/null' EXIT
for i in $(seq 60); do curl -sf http://127.0.0.1:8798/health >/dev/null && break; sleep 0.25; done
grep -E "Commons" $S/server.log
cli(){ node --import tsx scripts/commons/cli.ts "$@"; }
export BRAINSTORM_PARTICIPANT=Kai
echo "== search (Kai)"; cli search "My Mac cannot see my frame" --limit 3 | python3 -c "import sys,json;d=json.load(sys.stdin);print('problems:',[ (p['problemId'],p['nearMatch']) for p in d['problems']],'contributions:',len(d['contributions']))"
echo "== browse root"; cli browse | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['view'],[e['name'] for e in d['entries']][:6],'issues',d['threads']['issues'],'linked',d['threads']['linked'])"
echo "== browse thread issue/99"; cli browse --object issue/99 | python3 -c "import sys,json;d=json.load(sys.stdin);t=d['thread'];print(t['object'],t['author'],'cited by',[p['problemId'] for p in t['problems']])"
echo "== inspect problem"; cli inspect usb-c-no-data | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['kind'],d['roomId'],'evidence',len(d['evidence']),'contributions',len(d['contributions']))"
REF=$(cli inspect usb-c-no-data | python3 -c "import sys,json;print(json.load(sys.stdin)['evidence'][0]['source']['objectId'])")
echo "== draft (writes nothing)"; cli draft --problem usb-c-no-data --text "CLI smoke: violet-marmot-4471 the frame mounts only on a USB-A hub" --kind observation --circumstances "macOS 15, M2" --ref "$REF" --command-id smoke-cli-1 | python3 -c "import sys,json;d=json.load(sys.stdin);print('ok',d['ok'],'destination',d['destination']['roomId'],'warnings',d['warnings'])"
echo "== submit"; OUT=$(cli submit --problem usb-c-no-data --text "CLI smoke: violet-marmot-4471 the frame mounts only on a USB-A hub" --kind observation --circumstances "macOS 15, M2" --ref "$REF" --command-id smoke-cli-1); echo "$OUT" | python3 -c "import sys,json;d=json.load(sys.stdin);print('id',d['contributionId'],'replayed',d['replayed'],'author',d['contribution']['provenance']['authoredBy'])"
CID=$(echo "$OUT" | python3 -c "import sys,json;print(json.load(sys.stdin)['contributionId'])")
echo "== submit again (same key)"; cli submit --problem usb-c-no-data --text "CLI smoke: violet-marmot-4471 the frame mounts only on a USB-A hub" --kind observation --circumstances "macOS 15, M2" --ref "$REF" --command-id smoke-cli-1 | python3 -c "import sys,json;d=json.load(sys.stdin);print('id',d['contributionId'],'replayed',d['replayed'])"
echo "== submit again (same key, changed text) → exit code:"; cli submit --problem usb-c-no-data --text "changed" --ref "$REF" --command-id smoke-cli-1 >/dev/null 2>$S/err.txt; echo "exit $?"; head -c 120 $S/err.txt; echo
echo "== reply as Lea"; BRAINSTORM_PARTICIPANT=Lea cli submit --problem usb-c-no-data --text "Which hub model? Mine needs a powered one." --kind question --parent "$CID" --command-id smoke-cli-2 | python3 -c "import sys,json;d=json.load(sys.stdin);print('reply',d['contributionId'],'author',d['contribution']['provenance']['authoredBy'])"
echo "== thread"; cli thread "$CID" | python3 -c "import sys,json;d=json.load(sys.stdin);print('root',d['root']['contribution']['actor']['id'],'replies',[r['contribution']['actor']['id'] for r in d['root']['replies']],'participants',d['participants'])"
echo "== search the phrase (Lea)"; BRAINSTORM_PARTICIPANT=Lea cli search violet-marmot-4471 | python3 -c "import sys,json;d=json.load(sys.stdin);print([(c['contributionId'],c['summary']['actor']['id']) for c in d['contributions']])"
echo "== rediscover from the repository (Lea): which threads/docs cite the CLI contribution"; for T in issue pull discussion; do BRAINSTORM_PARTICIPANT=Lea cli browse --threads $T --linked --limit 200 | python3 -c "
import sys,json
for t in json.load(sys.stdin)['threads']:
    for c in t['contributions']:
        if c['contributionId']=='$CID': print(t['object'],'←',c['kind'],'by',c['actor']['id'],'via',c['entrance'],'cites',c['cited'])"; done
case "$REF" in issue/*|pull/*|discussion/*|comment/*) ;; *) BRAINSTORM_PARTICIPANT=Lea cli browse "${REF#doc/}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('doc',d.get('doc',{}).get('path'),[(c['actor']['id'],c['entrance']) for c in d.get('doc',{}).get('contributions',[])])";; esac
echo "== search the cited object (Lea)"; BRAINSTORM_PARTICIPANT=Lea cli search "$REF" | python3 -c "import sys,json;d=json.load(sys.stdin);print([(c['contributionId'],c['summary']['actor']['id'],c['summary']['entrance'],[r['objectId'] for r in c['summary']['sourceRefs']]) for c in d['contributions'] if c['contributionId']=='$CID'])"
echo "== context"; cli context "$CID" --budget 3000 | python3 -c "import sys,json;d=json.load(sys.stdin);print('contributions',len(d['contributions']),'omissions',len(d['omissions']),'limitations',len(d['limitations']),'sources',len(d['sources']))"
echo "== publish without an account → exit code:"; cli publish "$CID" > $S/pub.txt; echo "exit $?"; python3 -c "import json;d=json.load(open('$S/pub.txt'));print(d['ready'],d['reason'],d['activation']['mode'])"
echo "== hide (Lea reviews) then inspect"; BRAINSTORM_PARTICIPANT=Lea cli moderate hide "$CID" --reason smoke >/dev/null; cli inspect "$CID" | python3 -c "import sys,json;d=json.load(sys.stdin);print('moderated',d.get('moderated'),d.get('reason'),'text present',('text' in d))"; BRAINSTORM_PARTICIPANT=Lea cli moderate unhide "$CID" >/dev/null
echo "== status"; cli status | python3 -c "import sys,json;d=json.load(sys.stdin);print('schema',d['schemaVersion'],'atproto',d['atproto']['sessions']['mode'],'publications',d['publications'],'problems',d['problems'])"
echo "== restart keeps everything"; kill $PID; wait $PID 2>/dev/null; node --import tsx server/http/server.ts >> $S/server.log 2>&1 & PID=$!
for i in $(seq 60); do curl -sf http://127.0.0.1:8798/health >/dev/null && break; sleep 0.25; done
cli thread "$CID" | python3 -c "import sys,json;d=json.load(sys.stdin);print('after restart: replies',len(d['root']['replies']))"
echo "== unreachable server → exit code:"; COMMONS_API=http://127.0.0.1:8797 cli status >/dev/null 2>&1; echo "exit $?"

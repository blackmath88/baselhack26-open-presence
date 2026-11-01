#!/usr/bin/env bash
# Start a fresh, empty Commons room for one observed session (Phase 5).
# Usage: bash scripts/research/session.sh P3      (participant code, never a name)
# The room lives in a temporary directory outside the repository and is printed at the end;
# delete it after the session unless the participant agreed to keep their contribution.
set -euo pipefail
CODE=${1:?participant code, e.g. P3}
[[ $CODE =~ ^P[0-9]+$ ]] || { echo "Use a code like P3, not a name." >&2; exit 2; }
API_PORT=${API_PORT:-8821} UI_PORT=${UI_PORT:-5221}
cd "$(dirname "$0")/../.."
DIR=$(mktemp -d -t "commons-session-$CODE-XXXX")
export BRAINSTORM_DATA_FILE=$DIR/room.json PORT=$API_PORT
node --import tsx server/http/server.ts > "$DIR/server.log" 2>&1 & SP=$!
BRAINSTORM_API=http://127.0.0.1:$API_PORT npx vite --host 127.0.0.1 --port "$UI_PORT" --strictPort > "$DIR/vite.log" 2>&1 & VP=$!
stop() { trap - EXIT INT TERM; kill $SP $VP 2>/dev/null; echo; echo "Stopped. Room file: $DIR/room.json (delete it unless consent covers keeping it)."; exit 0; }
trap stop EXIT INT TERM
for _ in $(seq 1 60); do curl -fs "http://127.0.0.1:$UI_PORT/" >/dev/null 2>&1 && curl -s -o /dev/null "http://127.0.0.1:$API_PORT/api/commons/status" && break; sleep 0.5; done
cat <<MSG
Session $CODE ready (empty room: no earlier contributions).
  Commons:   http://127.0.0.1:$UI_PORT/        (open in a fresh private window; choose Voice "Mara")
  Baseline:  https://github.com/wesbos/photo-frame-dashboard/issues
  Sheet:     docs/research/commons-phase-5/observation-sheet.html
Press Ctrl-C to stop.
MSG
wait

# Observstory — hackathon edition
## Open your project view
1. Open [Actions → Hackathon Observatory](https://github.com/blackmath88/baselhack26-open-presence/actions/workflows/observstory.yml).
2. Open the latest successful run and download **hackathon-observatory**.
3. Extract it and open index.html. radar.html is the alternate view.
4. Agents can read data/snapshot.json and data/scene.json from that artifact.

This is the real upstream Observstory renderer, configured for the weekend. A separate repository replay is available at replay.html; the native Observstory renderer is retained.

## What it observes
Pushes, PR events and issue events trigger a new snapshot; Run workflow offers manual refresh. No permanent scheduled job is installed for a two-day event.
Lanes: Intent & plan; Sources & index; Experience; Verify & demo; Delivery.
The stale threshold is four hours for this hackathon. It is a heuristic about work, not a judgement about people; overnight inactivity can trigger it.

Only Open Presence activity is collected. Knowledge Lab is linked in the plan and a URL commitment: Observstory reports it as tracked elsewhere once declared, not as observed progress. Check its own branches/runtime before asserting status. This workflow uses only this repository's read-only GITHUB_TOKEN and adds no cross-repo credentials.

## Plan versus declarations
[HACKATHON-PLAN.md](HACKATHON-PLAN.md) is the readable plan.
.observstory/coordination.json uses upstream observstory.coordination/v1.
Suggested checkpoint times and unassigned work packages are **proposed**. Native Observstory intentionally does not show proposed items on its mission rail. The already explicit user decisions about two repos, graph exploration and deferred naming are declared with their chat provenance.

After reviewing times and owners, confirm through an Observstory checkout:
```bash
python3 /path/to/observstory/scripts/observstory.py checkin pending
python3 /path/to/observstory/scripts/observstory.py checkin confirm S1 --by "Your name"
```
Run from this repository root so the command reads .observstory/coordination.json. Edit owner assignments and times first; do not confirm on somebody else's behalf. Commit the resulting change; the next workflow run reconciles it with activity. No extra approval is needed to continue ordinary implementation while planning targets remain proposed.

For later check-ins, create a short note with markers such as CHECKPOINT, FREEZE, DECISION and @Owner; use checkin propose and then confirm only the agreed items. See the [upstream guide](https://github.com/blackmath88/observstory/blob/a38a1a203d5b2c9ee599ecdf421ccc595cb57c0d/docs/collaboration-delivery/README.md).

## Pinned source and behaviour
Action pinned to blackmath88/observstory@a38a1a203d5b2c9ee599ecdf421ccc595cb57c0d.
No upstream code copied. Configuration and workflow authored here.
Collection permissions: contents/read, pull-requests/read, issues/read. Artifact retained seven days. Public Pages deployment uses a separate job with pages/write and id-token/write. No messaging, transcription, people scoring or agent orchestration.
A snapshot becoming old does not mean the code is currently blocked. Read its collection timestamp. A merged change does not prove a milestone's acceptance tests passed.

## Pages deployment
The workflow publishes dashboard output from main, excluding pull-request events. Pages was enabled by the owner on 31 October 2026 while the source repository remained private. The published output includes collected repository activity, planning declarations, file paths and commit titles; source-repository visibility does not restrict access to the published dashboard.

Pages source must be **GitHub Actions**. Dashboard URL: https://blackmath88.github.io/baselhack26-open-presence/ . Pushes, issue/PR events and manual runs rebuild this static dashboard; reload to see the latest build. This is not a streaming backend.

## Repository growth replay
Open replay.html from the artifact or deployed site. Play/pause, pace and scrub controls reconstruct the files at each commit, highlight changes, and link each frame to its commit. repo-events.jsonl is the downloadable log. Data comes from up to 200 first-parent Git commits, not AI-generated activity. The first frame is a baseline; deletions are shown. Git history supplies durable evidence, so this log is rebuilt each time rather than persisted by a bot commit. Rewritten history can change it.

Inspired by [Crawler Theatre](https://github.com/blackmath88/accessibility-red-team/tree/main/theatre): recorded events → deterministic state → replay. This is a new file-map UI; no crawler renderer or source code was copied. Playback is opt-in, with no automatic motion.

## Graph events: next integration
Repository history and knowledge growth have distinct meanings. The graph is not connected to this replay yet. Knowledge Lab should emit durable JSONL events at ingestion boundaries: source ingested, node added, relationship proposed, relationship confirmed, correction and removal. Every event needs a stable id, timestamp, run id, subject id, evidence references and producer (code/model/human); producer identity is a declaration, not proof of humanity. Store only export-approved fields; raw prompts and private chat logs do not belong in a public dashboard.

Then expose two replay views over their respective logs: repository files in the Observatory, and evidence-linked nodes/edges in the graph. Replay must apply corrections and removals as well as additions. Label model-proposed edges distinctly from source-declared relationships; counts are activity, not truth or quality. Keep private lab runtime logs outside the public export.

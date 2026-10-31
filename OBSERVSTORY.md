# Observstory — hackathon edition
## Open your project view
1. Open [Actions → Hackathon Observatory](https://github.com/blackmath88/baselhack26-open-presence/actions/workflows/observstory.yml).
2. Open the latest successful run and download **hackathon-observatory**.
3. Extract it and open index.html. radar.html is the alternate view.
4. Agents can read data/snapshot.json and data/scene.json from that artifact.

This is the real upstream Observstory renderer, configured for the weekend. No custom dashboard fork or public Pages site is introduced.

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
Permissions: contents/read, pull-requests/read, issues/read. Artifact retained seven days. No deployment, messaging, transcription, people scoring or agent orchestration.
A snapshot becoming old does not mean the code is currently blocked. Read its collection timestamp. A merged change does not prove a milestone's acceptance tests passed.

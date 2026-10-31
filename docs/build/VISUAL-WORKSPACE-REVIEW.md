# Visual workspace consumer integration

The reusable UI and public projection live in `blackmath88/observstory/frontend`.
This branch declares four public workstreams and their selected knowledge memberships in
`.observstory/workspace.json`, with the optional PDF module explicitly supporting Human Signal.
No lifecycle, dates, owner, human-judgment request, stopping point or next action is invented.
Existing knowledge document statuses remain distinct from workstream lifecycle.

The Action pins producer `84c3c0a4e1d870f0aa56e47db9ee59fcfd1ee844`. It now publishes
`data/workspace.json` from Git objects at the observed revision, alongside existing snapshot,
scene, knowledge and event inputs. Classic/replay outputs and event publication remain intact.
No new frontend is added here; Claude's Commons and memory branches are untouched.

Producer screenshots, behavior checks and remaining limitations:
https://github.com/blackmath88/observstory/blob/84c3c0a4e1d870f0aa56e47db9ee59fcfd1ee844/frontend/docs/visual-workspace/REVIEW.md

Producer validation: 28 frontend tests, 151 Python tests, typecheck, lint, release build and
nine Playwright checks at 390/768/1440px. The consumer declaration was validated by that
producer and projected from commit `8acdf7b`. Captured hosted knowledge/snapshot resolve to
`0281da8`; knowledge complete=true with zero diagnostics, snapshot collection partial for
PR #8's 100+ files. The captured preview therefore shows a real source mismatch rather than
implying atomic freshness. The Action should regenerate consumer inputs after review.

This is a reviewable pin update, not a deployment or acceptance record. No PR is merged here.
Resume/status authoring and additional conceptual relationships remain future work. Synthetic
paused/resume cases live only in the producer fixture set.

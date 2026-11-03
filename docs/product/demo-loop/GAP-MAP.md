# Gap map — concept versus what exists on 3 November 2026

3 November 2026 · Claude (assistant) · From running `feat/commons-aurora` and `feat/pdf-lab-werkbank` locally, reading PR 45–59 and the corpus. Status words: **real** (works on real data), **mock** (fixture content from the Aurora mock), **unmerged** (exists in an open PR on another base), **missing**.

| # | Concept item | Status | Where | Closed by |
| --- | --- | --- | --- | --- |
| 1 | Aurora shell, modes, launcher, topbar | real | PR 57 | — |
| 2 | Find / inspect / compare on the corpus | real (offline fallback without server) | `/find`, `src/commons/*` | — |
| 3 | PDF Lab workbench with real specimens, four views, reveal, inspector, A/B, recipe | real | PR 59 `/lab` | — |
| 4 | Focus mode for the PDF document | real (`F`, `fokus=1`) | PR 59 | — (already done) |
| 5 | Bridge overlay „Was muss mitreisen …“ | real, wrong target (`/canvas` fallback) | PR 59 `Overlays.tsx` | Brief 1 |
| 6 | Presenter reset that also reopens the dock | missing | — | Brief 1 |
| 7 | Photo-frame investigation `bilderrahmen-mac` in the canvas | missing (`/canvas/<id>` shows „Noch keine Belege“) | `Canvas.tsx` reads only mock | Brief 2 |
| 8 | Card „Die Erfahrung“ with real passage, author, outcome | missing; data present in `usb-c-no-data` e3 + manifest | corpus | Brief 2 |
| 9 | Card „Passt das zu meiner Situation?“ | missing; data present (`device`, `environment`, `symptoms`, `openQuestions`, `matchBasis`) | corpus, `matchBasis.ts` | Brief 2 |
| 10 | Card „Was später ergänzt wurde“ | missing; data present (`corrections.json` incl. `c-71-january`, room thread via API) | corpus, API | Brief 2 (corrections), Brief 4 (room entries) |
| 11 | Card „Worauf dieser Beitrag aufbaut“ | unmerged logic (`lineage.ts`, PR 46 on the retired hash UI) | PR 46 | Brief 2 (port the pure module, not the old UI) |
| 12 | Card „Eigene Beobachtung ergänzen“ | unmerged (old `Composer.tsx`, PR 45 preview rules); Aurora has no composer | PR 45, `components/commons/Composer.tsx` | Brief 3 |
| 13 | Context block on every contribution and in the preview | missing; all fields exist in contracts | `contracts.ts` | Brief 2 (component), Brief 3 (preview) |
| 14 | Prüfungen: preview, attribution, destination, share | mock (local state, „Plan freigeben“); real `prepareContribution` + `submit` exist server-side | `Actions.tsx`, `queries.ts` | Brief 3 |
| 15 | Participant switch in Aurora | missing in Aurora; real gate exists (`ParticipantSwitcher`, Kai/Lea) | old UI | Brief 4 |
| 16 | Second participant's reply / correction | real server-side (`parentId`, `contradictsId`); no Aurora UI | API, CLI | Brief 4 |
| 17 | Rediscovery via CLI / MCP | real (`npm run commons -- search`, MCP tools) | `scripts/commons/cli.ts`, `server/mcp` | Brief 4 (required, on screen) |
| 18 | Observatory finale item | missing; data present in `.observstory/*.json`; topbar link leaves the app | `TopBar.tsx` | Brief 5 |
| 19 | Visible cards and selection in the URL with presenter reset | real on `/lab`; missing on canvas | `state.ts` | Brief 2 (canvas params), Brief 1 (reset) |
| 20 | Statistics only where records support them | mock tiles (23 / 15 / 4 / 2) on `schwamm-zitat` | `mock/commons.ts` | Brief 2 (none on `bilderrahmen-mac`; mock untouched) |
| 21 | Assistant aside for the investigation | mock conversation about the Schwamm quote | `Conversation.tsx` | Brief 2 (deterministic Lesehilfe, flagged) |
| 22 | Topbar „Observatory“ inside the app | missing | `AppShell.tsx` | Brief 5 |
| 23 | Downloadable .phf file | out of scope | — | — |
| 24 | ATProto portability beat | real but isolated (`tools/local-pds`), not in Aurora | server | not in the demo loop; recorded evidence only |

## Dependencies between briefs

Brief 1 → Brief 2 → Brief 3 → Brief 4 → Brief 5, each on the previous branch. Brief 5 only needs Brief 2 (a Prüfung route) and could run in parallel after Brief 2 if time is short.

## Risks seen while inspecting

- `Canvas.tsx` hard-codes the mock evidence list; Brief 2 must introduce a registry keyed by investigation without touching the Schwamm fixture.
- PR 45/46 code targets components the Aurora port removed (`CommonsHub`, hash router). Port the pure modules (`outgoing.ts`, `lineage.ts`) and the preview rules; do not revive the old screens.
- The API proxy returns 502 without `npm run dev:server`; every brief must keep the committed-corpus fallback working and label it „Dienst nicht verbunden“.
- Prototype tokens are in-memory: a server restart logs Kai and Lea out. The runbook must start the server before the rehearsal, not during.
- PR 57 and PR 59 are both open; the briefs stack on PR 59. If PR 57 changes under review, PR 59 and the briefs rebase.

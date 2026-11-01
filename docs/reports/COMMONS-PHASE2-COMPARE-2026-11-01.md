# Commons Phase 2 — understand a consequential difference

1 November 2026 · Claude Code (assistant) · Coordinator self-check, not an independent review or human acceptance.
Builds on [Phase 1](COMMONS-PHASE1-FIND-INSPECT-2026-11-01.md). Plan: [build plan, Phase 2](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md).

## Capability
From the "My Mac cannot see my frame" results, someone can put two real accounts side by side. They can see what both
records state identically, what only one reports and what is not recorded. They can follow any passage back to its record,
and swap or remove either account without losing the other or the situation.

Example on real records: `reset-after-uboot` and `ums-drops-during-backup` both apply to the PF1007L (Allwinner A33) on Route U, and
both report a disk disappearing. Their reported outcomes differ: a START STOP patch versus three eMMC clock and power fixes. The
comparison shows this without claiming a shared or different cause.

## What was added
| Piece | Behaviour | Built from |
|---|---|---|
| Route | `#/compare?ids=a,b&q=…`: at most two unique ids, and the situation is kept. Back, reload and copied links work. | `Route.compare`, `appLinks.compare` |
| Entrances | "Compare with another account" on every search result and on every record. Both open the comparison with that account and a chooser for the second. | links only |
| Account headers | Title linking to the record, review status, near-match label, "Not among the results" when relevant. A **Swap for…** chooser draws on this situation's results (or every record when there's no search), and **Remove** keeps the other account. An unknown id is reported. | `CompareView` |
| Aligned table | Applies to, reported conditions, symptoms, reported outcomes (evidence ids link to passages), limit, corrections, evidence passages (each linking to the selected passage on its record), and Why it matched. Identical entries are labelled "in both". Devices and conditions say whether your words mention them ("your words: …", "via macos, added by search", "not stated by you"). Empty fields read **Not recorded**. At 360 px each field stacks, with every cell repeating "A · Field" / "B · Field". | `compareAccounts()`, `compareSituation()` |
| Summary | *In both records*: identical entries, shared words as written (devices, conditions and symptoms only; labelled "the same words, not the same claim"), and sources both records cite. *Where they differ or are unknown*: per-field counts of what only one records, fields not recorded, and a plain Unknown (which account, if either, applies to your frame). Introduced as not deciding which account fits. | `compareAccounts()` |

The comparison reads imported records in the browser from the committed corpus, through the same reader search uses.
No server request is involved, so nothing can arrive late here; the search's own server request already guarded against late responses.
No backend, corpus, CLI, MCP or HTTP change. `compareSituation` now shows words as typed or as added by search instead of stems.

## Checks (Node 22.23.4, Chromium 1243)
| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | 25 files, 219 pass. This includes main's newly merged mascot tests, plus 6 comparison tests and 1 compare-route test |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `e2e.sh`, `multi-entry.sh`, `browser.sh` | pass |
| `journey.sh` (in CI) | 35/35 ok: `evidence/commons-phase2-20261101/journey-smoke.txt` |

New journey checks, against a real local server in Chromium:
- **Setting up the comparison:** opening it from a result keeps the situation, and choosing B puts both ids in the URL.
- **Content:** PF1007L is marked "in both". The summary names Route U, the per-field differences and the Unknown, and contains no cause wording.
- **Links:** all 12 of B's links go to B's passages with the situation.
- **Navigation:** a passage opens selected on its record, back returns to the same comparison, and Remove A keeps B and the situation. An unknown account is reported.
- **360 px:** the comparison stacks and has no horizontal scroll.

## Limitations and decisions to review
- **Word overlap, not meaning.** "Shared words" is lexical. "both use the words frame, disk, disappears, backup" is factual but invites over-reading; it is labelled, but a person should judge whether to keep it.
- **Per-field counts can mislead.** "A records 1 entry B does not" counts strings, so a reworded identical fact counts as a difference.
- **No shortcut from the results list.** Choosing two accounts takes one click to open the comparison plus one choice. There is no multi-select on the results page.
- **Table semantics at narrow widths.** The stacked layout below 720 px changes table display to block, which some screen readers announce without table semantics. The repeated "A · Field" labels are there so the text still makes sense; not tested with a screen reader.
- **Still open from earlier phases:** the provisional accent, raw Markdown in quotes, Chromium-only checks, and the uninspected development-practice starter.

## Next bounded slice (proposal)
Phase 3: contribute and rediscover. The composer, preview, submission with a stable command id, replies and corrections already exist and work.
The slice would make the preview show the exact outgoing text, attribution, assistance, destination and what stays private,
next to the passage and situation it responds to. It would also check that a failed or rejected submission keeps the text, and that the contribution can be found again through
search and the repository, using a second participant.

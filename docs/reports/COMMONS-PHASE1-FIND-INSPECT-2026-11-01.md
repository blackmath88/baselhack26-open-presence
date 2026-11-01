# Commons Phase 1 — find and inspect, end to end

1 November 2026 · Claude Code (assistant) · Coordinator self-check, not an independent review or human acceptance.
Builds on [Phase 0](COMMONS-PHASE0-CHECKPOINT-2026-11-01.md). Plan: [build plan, Phase 1](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md).

## Capability
Someone types "My Mac cannot see my frame" and recognises an account. They can see what may fit and what differs or is
unknown, select an exact passage, follow it to the original on GitHub, and return to the same results. The situation
and the passage live in the URL, so reload, back and copied links keep them.

## What was added
| Piece | Behaviour | Built from |
|---|---|---|
| Passage selection | `#/problems/<id>?q=…&passage=e3`. A passage index (id, role, author) above the evidence. The selected passage gets an outline plus a "Selected passage" label, receives focus and scrolls into view (instant under reduced motion). "Link to passage" on each passage. An unknown passage id is reported, not guessed. | `appLinks.passage`, `Route.problem.passage` |
| **Before you rely on it** | Two columns. *Why it may fit*: recorded devices and conditions that share words with your situation; words added by the search's explicit query expansion are labelled "(expanded by search)". Then the record's own **Why it matched**. *What differs or remains unknown*: recorded devices and conditions you did not state, the record's Limit, its correction passages with their verbatim words, and a plain Unknown (your frame model, cable and port). Introduced as a word comparison that cannot tell whether a fix will work. | `compareSituation()` uses the search tokenizer and `queryVocabulary` (now exported, unchanged) |
| Reported outcomes | Shown for the first time. They are labelled as the record writer's summary, and the evidence ids inside them link to their passages. | `ImportedProblem.outcomes`, `evidenceRefs()` (links only ids the record has) |
| Corrections | The evidence ids in correction notes now link to their passages. | existing `corrections` |
| Original source | "original ↗" is emphasised and tells screen readers it opens GitHub in a new tab. Still links only to `https://github.com/…` with `noopener`. | existing `SourceLine` |
| States | The situation bar and the way back stay on screen while loading, on a failed load (with **Try again**), on a 404 ("No record called …") and on a failed refresh (the last loaded version stays, with a notice). A response that arrives after a newer request, or after leaving the page, is dropped. | `ProblemPanel` |

No backend, corpus, CLI, MCP or HTTP change. `queryVocabulary` was only exported. The server-side contracts are untouched.

## Checks (Node 22.23.4, Chromium 1243)
| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | 21 files, 203 pass (+4: passage links, situation comparison, evidence references) |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `e2e.sh`, `multi-entry.sh`, `browser.sh` | pass |
| **New** `scripts/smoke/journey.sh` (also added to CI) | 22/22 ok: `evidence/commons-phase1-20261101/journey-smoke.txt` |

The journey smoke runs in real Chromium over DevTools against a real local server with temporary data:
- **Search:** Enter searches; the URL carries the situation; the first account is `usb-c-no-data` with `?q=`. Tab reaches **Why it matched** and Enter expands it.
- **Record page:** shows the situation, the unstated conditions and the unknowns. Outcomes link to `&passage=e3`.
- **Quotes:** every rendered quote equals the corpus quote from the API, verbatim (7 passages), and every interpretation carries the agent label.
- **Passage:** selecting it through the index puts it in the URL, focuses it and scrolls it into view. Its original link is GitHub, opens in a new tab and has `noopener`.
- **Reload and back:** reload keeps the passage and the situation. Back clears the passage; back again returns to the same 8 results with the input filled.
- **Unknown passage and unknown record:** both are reported plainly, and the record page keeps the way back.
- **Failed load:** a simulated network failure shows an error with the situation still visible, and **Try again** recovers.
- **360 px:** the selected passage is in view and there is no horizontal scroll.

Measured contrast for the new parts: "Selected passage" label and current index item 6.53:1; links 7.45:1; secondary text on the selected surface 6.24:1.

## Limitations and decisions to review
- **Defensive only:** the late-response guard is written defensively but is not exercised by a test, because records are remounted per id. Search's server leg already guarded against late responses.
- **Generic "Unknown" line:** "your frame model, cable and port" is fixed copy, not derived from the record. It states what the Commons cannot know from a typed situation; please review the wording.
- **Matching artefacts:** the comparison uses stemmed words, so "Mac" in your words does not match "macOS" except through search's own expansion, which is labelled. Generic words can produce weak matches (here "frame" matches the device "other USB-C-only frames").
- **Unchanged from Phase 0:** quotes still show raw Markdown verbatim. The accent is still provisional (`#146BD1` vs the PDF workbench's `#087E8B`). The ATProto suites still return early without `tools/local-pds` in this environment (CI installs it). Screen readers, touch devices and browsers other than Chromium are not tested.
- **The context bar is on every record view:** it now also appears on contribution and thread views of a record (there it shows "Search", with no situation).

## Next bounded slice (proposal)
Phase 2: compare two actual accounts, for example `usb-c-no-data` with `reset-after-uboot`, which both come up for this query
but report different symptoms. Align devices, conditions, outcomes and limits, show Unknown where a field is missing, and keep source
links reachable from the comparison.

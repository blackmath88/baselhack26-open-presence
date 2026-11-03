# .phf demo loop — specification set

3 November 2026 · Claude (assistant) · Status: proposal for Achim's review. Nothing here is implemented, merged or approved by this document.

## What this is

The agreed concept for the BaselHack 2026 demo, written down so Codex can build it in bounded slices. The demo answers one question: **what survives when knowledge travels?** It is shown in three parts, in this order: **PDF Lab → .phf Commons → Observatory**. Most of the time goes to .phf.

Base branch for all briefs: `feat/pdf-lab-werkbank` (PR 59), which already contains Aurora (PR 57). Each brief builds on the previous one. No brief changes `apps/commons/src/styles/tokens.css`.

## Read in this order

| File | What it fixes |
| --- | --- |
| [PDF-ENCOUNTER.md](PDF-ENCOUNTER.md) | The presenter path through `/lab`, which states are demo and which are exploration, what is still missing |
| [BRIDGE.md](BRIDGE.md) | The transition PDF → .phf, the context that travels, and the explicit place of the Observatory finale |
| [PHF-EXPERIENCE.md](PHF-EXPERIENCE.md) | The photo-frame investigation `bilderrahmen-mac`: the five canvas cards, the aside, the contribution path, the second participant, rediscovery |
| [CONTEXT-BLOCK.md](CONTEXT-BLOCK.md) | The shared block Wer · Bedingungen · Wann · Quelle · Unterstützung · Ergänzt, mapped to real contract fields |
| [SELECTION-MODEL.md](SELECTION-MODEL.md) | URL parameters, defaults, presenter reset, what never enters a URL |
| [GAP-MAP.md](GAP-MAP.md) | Concept item → what exists (real, mock, unmerged, missing) → which brief closes it |
| CODEX-BRIEF-1 … 5 | One brief per priority, in build order |

## The one real case

Everything uses the captured `wesbos/photo-frame-dashboard` snapshot at `0bff55ef3fb2` and the record it already contains. No source quotation or outcome is invented.

| Thing | Real identifier |
| --- | --- |
| Situation shown on screen | „Mein Mac erkennt meinen Bilderrahmen nicht.“ |
| Investigation ID (new) | `bilderrahmen-mac` |
| Problem record | `usb-c-no-data` — "The frame shows no USB data, or no power, on the computer" |
| Passages | `e1` doc synthesis · `e2` doc correction · `e3` fix-report (issue/12, comment 6113789229) · `e4` report (issue/148) · `e5` report (issue/38) |
| The experience | issue/12 by **jethrojones**, opened 2026-10-11 18:21 UTC: "no USB data seen, likely C-to-C cable"; same day 21:10 UTC: "Update: it was the cable."; closed 2026-10-12 |
| What was added later | 2026-10-13 02:51 UTC, same author, same thread: "Route U didn't work on this January unit" (error -71). Recorded as correction `c-71-january` on problem `gadget-error-71`, `absorbed: false` |
| Open question in the record | "Do these boards really lack CC pull-down resistors? Nobody has measured it." |
| Prototype participants | Kai (`person:kai`), Lea (`person:lea`) from `server/auth/participants.ts` |
| Destination of a contribution | local shared room `commons:usb-c-no-data` on the Node server (`npm run dev:server`); not GitHub, not ATProto |

## The demo path in one list

1. `/lab` — read Gedicht A, reveal the other reading, inspect line 3, focus mode. (PDF-ENCOUNTER)
2. Bridge overlay „Was muss mitreisen, wenn eine KI für uns liest?“ → `/canvas/bilderrahmen-mac?von=lab`. (BRIDGE)
3. Canvas: Die Erfahrung → Passt das zu meiner Situation? → Was später ergänzt wurde → Worauf dieser Beitrag aufbaut. (PHF-EXPERIENCE)
4. Eigene Beobachtung ergänzen → Prüfungen: Vorschau, Zuschreibung, Ziel, Teilen. Submit to the shared room as Kai. (PHF-EXPERIENCE, CONTEXT-BLOCK)
5. Switch to Lea; reply with a question or correction; the original stays inspectable. (PHF-EXPERIENCE)
6. Rediscovery of Kai's contribution through the CLI, on screen in a second terminal — **required step, decided by Achim on 3 November 2026**. MCP is named in the runbook, not demonstrated.
7. Last Prüfung: Observatory — what this build itself left behind. (BRIDGE, PHF-EXPERIENCE)

## Decisions already made

- **Rediscovery (step 6) is required**: Achim decided on 3 November 2026. Brief 4 rehearses it on screen and adds a CLI smoke check.

## Decisions this set does not make

- **Aurora tokens**: unchanged by every brief. A brief that needs a colour not in `tokens.css` or `supplemental/tokens.css` stops and asks.
- **Merging**: PR 57 and PR 59 are open. The briefs stack on PR 59; Achim decides merge order.
- **Downloadable .phf file**: out of scope. Context travels as Commons records.

## Language and quality

Conversation and docs in English. Every UI string in German. Prototype quality: no new state library, no chart library, no new backend endpoints unless a brief names one. Real data or „nicht erfasst“; never a placeholder number.

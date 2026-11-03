# Codex brief 2 — real photo-frame accounts in Aurora

Repo `blackmath88/baselhack26-open-presence` · base `feat/demo-1-pdf-transition` · new branch `feat/demo-2-photo-frame-canvas` · own worktree. Read `README.md`, `PHF-EXPERIENCE.md` §1–§4 and §7, `CONTEXT-BLOCK.md`, `SELECTION-MODEL.md`, `GAP-MAP.md` in `docs/product/demo-loop/`.

## Goal

`/canvas/bilderrahmen-mac` shows the first four cards from real data (Die Erfahrung, Passt das zu meiner Situation?, Was später ergänzt wurde, Worauf dieser Beitrag aufbaut), the context block on every object that has one, and a deterministic aside. Card 5 is a placeholder button that Brief 3 fills.

## Step 0: inspect, report, then build

1. Read `src/commons/reader.ts`, `contracts.ts`, `client/matchBasis.ts`, `corpus/records/problems.json` (record `usb-c-no-data`), `corpus/records/corrections.json` (`c-cable-qualified`, `c-71-january`), `corpus/snapshots/001/manifest.json` (thread issue/12, comments 6113789229 and 6137133782).
2. Read `src/mock/commons.ts` (`EvidenceData`, card kinds), `components/aurora/EvidenceCard.tsx`, `EvidenceBodies.tsx`, `Canvas.tsx`, `Conversation.tsx`.
3. Read PR 46's `apps/commons/src/commons/client/lineage.ts` on `origin/feat/commons-phase-4-lineage`. Decide what is pure and portable; report it.
4. Report: which fields each of the four cards can fill from committed data, which are „nicht erfasst“, and whether `SourceRef.author` resolves to `jethrojones` for e3 through the reader.

## Build

1. **Card registry by investigation.** Replace the `isReference ? evidence : []` branch in `Canvas.tsx` with a lookup: mock cards for `schwamm-zitat` (unchanged), built cards for `bilderrahmen-mac` from a new `src/features/phf/cards.ts` that takes the `ImportedProblem`, the corrections, the manifest thread metadata and (optional) room contributions.
2. **Four new card kinds** in `EvidenceBodies.tsx`: `experience`, `fit`, `additions`, `lineage`, each with the fields in PHF-EXPERIENCE §2. Plain markup, existing `Badge`/`Chip`, no charts.
3. **`<ContextBlock>`** in `src/components/aurora/ContextBlock.tsx` per CONTEXT-BLOCK §2–§4, with the three input shapes (source passage, room contribution, outgoing). Unit-test the mapping for e3 and for a fixture contribution.
4. **Corrections in time order.** Card 3 merges `corrections.json` entries for the problem and `c-71-january` (same author, same thread, other problem) sorted by their source time from the manifest, then room contributions from the API when available. Without a server: „Dienst nicht verbunden · keine Beiträge aus dem Raum“.
5. **Lineage.** Port the pure parts of `lineage.ts`; render card 4 as three text stages with „erfasst / teilweise erfasst / nicht erfasst“.
6. **URL params** `karten`, `beleg`, `beitrag`, `q`, `fokus` per SELECTION-MODEL, validated; `1`–`5` and `F` keys; reload restores.
7. **Aside.** Deterministic Lesehilfe per PHF-EXPERIENCE §4, label „Lesehilfe aus dem Datensatz · kein Sprachmodell“, references highlight cards. Behind a constant `ASIDE_MODE: 'lesehilfe' | 'leer'` defaulting to `lesehilfe`.
8. **Find link.** On `/find`, a selected result whose problem maps to an investigation shows „Im Canvas öffnen“.
9. **Stats.** No stat tiles on this investigation. Start page `pendingReviews` reads a real count or hides.
10. **Card 5 placeholder.** A card „Eigene Beobachtung ergänzen“ with the text „Kommt in Schritt 3“ and a disabled button, so the grid order is final.

## Constraints

German UI; English quotes verbatim; no token changes; no new dependencies; the Schwamm fixture and its tests unchanged; mobile 390 px without horizontal scroll; aside hidden at 390 px as today.

## Acceptance

1. `/canvas/bilderrahmen-mac?von=lab` shows four real cards and the placeholder; card 1 says "Update: it was the cable." by jethrojones, 11.10.2026 21:10 UTC, issue/12; card 3 lists `c-cable-qualified` as „übernommen“ and the 13.10.2026 qualification as „nicht übernommen · anderes Problem“.
2. With `npm run dev:server` and one CLI-submitted contribution citing e3, card 3 and card 4 show it with its context block and entrance „über CLI“.
3. `?karten=ergaenzt,aufbau` hides the others; `?beleg=e1` switches card 1; reload keeps both.
4. Typecheck, build, tests (new unit tests for cards and context block), Aurora smoke; captures `docs/reports/demo-loop/02-*.png` at 1440×900 and 390×844; zero axe A/AA violations on the canvas.
5. PR description: Step 0 findings first, then changes, commands, unverified items.

## Out of scope

Composer, submit, Prüfungen, participant switch, Observatory.

# Codex brief 1 — PDF encounter and transition

Repo `blackmath88/baselhack26-open-presence` · base `feat/pdf-lab-werkbank` (PR 59) · new branch `feat/demo-1-pdf-transition` · own worktree. Read `docs/product/demo-loop/README.md`, `PDF-ENCOUNTER.md`, `BRIDGE.md`, `SELECTION-MODEL.md` first.

## Goal

The presenter path P1–P5 on `/lab` is reproducible from a reset, and the bridge lands on the photo-frame investigation with its context line. Nothing else in the workbench changes.

## Step 0: inspect, report, then build

1. Run `/lab` from a fresh browser profile and confirm the start state equals P1 (Gedicht A, Seite, line 1, Durchsicht 0, dock open). Report any difference.
2. Read `src/features/lab/Overlays.tsx`, `state.ts`, `useWorkbench.ts` (reset and dock logic), `src/routes/canvas.index.tsx`, `src/routes/canvas.$investigationId.tsx`, `src/components/aurora/Canvas.tsx`.
3. Report in the PR: where the dock flag is stored, what `0` resets, and what `Canvas.tsx` renders for an unknown investigation ID.

## Build

1. **Investigation registry.** Add `src/data/investigations.ts`: `export const investigations = [{ id: 'bilderrahmen-mac', problemId: 'usb-c-no-data', title: 'Mein Mac erkennt meinen Bilderrahmen nicht.', question: 'Mein Mac erkennt meinen Bilderrahmen nicht.' }]`. `Canvas.tsx` resolves the title from it before falling back to mock threads. The canvas for this ID renders the title, the arrival line (below) and the existing „Noch keine Belege für diese Untersuchung.“ text; Brief 2 fills the cards.
2. **Bridge target.** The overlay's primary button links to `/canvas/bilderrahmen-mac` with search `{ von: 'lab' }`. Keep `/canvas` (index) as is.
3. **Arrival line.** In `Canvas.tsx`, when `von === 'lab'`: under the title, „Aus dem PDF Lab: gleiche Seite, andere Lesart. Hier zählt, was bei Erfahrung mitreisen muss.“ plus link „Zurück zur Werkbank“ (`history.back()` if `document.referrer` or router history shows `/lab`, else `Link to="/lab"`). Any in-app navigation drops `von`.
4. **Presenter reset.** `0` pressed twice within two seconds on `/lab`, and a launcher entry „Demo zurücksetzen“ under Werkzeuge, both: navigate to `/lab` defaults, clear the dock's session flag, remove `localStorage["commons.drafts.v1"]` entries for `usb-c-no-data`. Announce „Demo zurückgesetzt“ via the existing toast/live region.
5. **Validate `von`.** Add `von?: 'lab'` to the canvas route's `validateSearch`; anything else is dropped.

## Constraints

German UI; no token changes; no new dependencies; keep the lab's existing URL contract byte-identical for all existing params; keep `/canvas` fallback working; reduced motion unaffected.

## Acceptance

1. Reset → P1 → `R` → `↓↓` → `F` → `F` → bridge → canvas shows the title and arrival line; browser back returns to `/lab?probe=b&durchsicht=100&zeile=3`.
2. Playwright: start state equals P1 after reset in a fresh context; bridge navigation lands on `/canvas/bilderrahmen-mac?von=lab`; `von=x` is dropped.
3. Typecheck, build, `npm test`, `npm run test:lab` pass. One desktop and one mobile capture of the arrival state in `docs/reports/demo-loop/01-*.png`.
4. PR description: Step 0 findings, what changed, commands run with results, what is unverified.

## Out of scope

Canvas cards, composer, Prüfungen, Observatory, any change to the standalone Workbench.

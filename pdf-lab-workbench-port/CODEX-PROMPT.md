# Codex task: PDF Lab «Werkbank» in Aurora

Repo: `blackmath88/baselhack26-open-presence` · base branch: `feat/commons-aurora`
New branch: `feat/pdf-lab-werkbank` (own worktree)

## Goal
PDF Lab becomes **one workbench inside the Aurora shell**: the document sits in the middle and the
lab apparatus surrounds it. The owner approved `reference/pdf-lab-mock.html`; it is the visual and
interaction spec. Rebuild it faithfully and replace its **placeholder poem, glyph codes and raw data
with the real PDF Lab specimens and recorded measurements**.

Demo path to optimise: **read → reveal → inspect one line → bridge to .phf**.
Writing your own reading (recipe) and the Struktur view are exploration features and must not
get in the way of that path.

## Package contents
- `reference/pdf-lab-mock.html`: the approved mock (open in a browser; keyboard shortcuts work)
- `reference/commons-mock.html`: the Commons mock, as the bridge target and for shared components
- `reference/screens/01–09*.png`: @2x captures of every key state
- `styles/workbench.css`: reference CSS. Split it into component CSS; use only the existing Aurora `tokens.css`
  plus the new tokens listed at the top of that file.
- `COMPONENTS.md`: inventory, data each component needs, and what to reuse from the existing Workbench

## Step 0: inspect, then report before writing code
1. `apps/commons` (TanStack Start, Aurora): shared shell components, `tokens.css`, routing.
2. `sideprojects/pdf-lab/workbench/` (README, stage, inspector, comparison, narrow PDF writer, adapters)
   and `sideprojects/pdf-lab/research/2026-11-01-workbench-direction.md`.
3. Report the following:
   - Where the real paired-poem PDFs live, and how page rendering works (pdf.js canvas or recorded images).
   - What recorded measurements exist per specimen and reader: extracted text, line boxes, glyph IDs, ToUnicode maps, run metadata.
   - Which data is missing for Zeichen and Struktur.
4. Put the findings at the top of the PR description. Where data is missing, show an honest
   "nicht erfasst" state. Never invent glyph data in the real app.

## Build
- **Route:** `/lab` in `apps/commons` (the topbar tab "PDF Lab"). Reuse the Aurora `TopBar`, buttons, chips and badges.
- **Reuse:** import the existing Workbench's data, adapters and PDF writer. Rewrite only the UI layer.
  Leave the standalone Workbench working until this route reaches parity.
- **State in the URL**, so the demo can be reset and states can be linked:
  `?probe=b&ansicht=zeichen&zeile=3&durchsicht=100&vergleich=1&fokus=1`. Reset (`0`) clears it.
- **Layout:** tool rail · Proben/Leser panel · Bühne (stage) · Inspektor · Belegleiste, as in the mock.
  Focus mode collapses both side panels.
- **Stage views:**
  - Seite: the real rendering with line guides from recorded line boxes.
  - Text: extracted reading, with words that differ from the drawn text marked.
  - Zeichen: glyph boxes plus glyph ID and mapping on hover. Only the differing glyphs are coloured.
  - Struktur: a readable chain (Seite → Schrift/ToUnicode → Textblock → Zeile → Glyphen). Raw data stays behind "Rohdaten".
- **Durchsicht** fades from the drawn page to the extracted reading over the same line positions.
  "Andere Lesart zeigen" (R) animates it from 0 to 100% and pulses the differing words twice.
- **Vergleichen** (V): two synced pages (A ↔ B, or two readers), each with its reading strip below.
  One selection drives both pages and the inspector.
- **Inspektor:** the four-step chain gezeichnet → Zeichen → Zuordnung → gelesen for the selected line.
  The mapping table shows only the differing word. "Rohdaten" holds the real content-stream / ToUnicode excerpt.
- **Eigene Lesart:** four inputs feed the existing narrow PDF writer. The result appears as the specimen
  "Meine Lesart" with status **"Neu erzeugt · nicht gemessen"** until a reader run exists.
- **Belegleiste:** always states "Gemessen" (reader, version, run date, file) or
  "Neu erzeugt · nicht gemessen". It links to the original file and the evidence record.
- **Brücke:** "Zur menschlichen Erfahrung" opens the overlay
  „Was muss mitreisen, wenn eine KI für uns liest?“. Its button routes to the .phf photo-frame investigation
  in the Commons canvas. If that investigation has no ID yet, link to `/canvas` and note it in the PR.
- **Assistant dock:** opens once with „Lies diese vier Zeilen …“ and an "Andere Lesart zeigen" button.
- **Shortcuts:** ↑/↓ select a line, 1–4 switch views, R reveal, V compare, F focus, G dock, 0 reset, Esc closes.

## Constraints
- Prototype quality: no new state library, no Tailwind or shadcn, no chart library, no config systems.
- All UI text in **German**, verbatim from the mock unless real data replaces it. Code and the PR in English.
- No hard-coded colours outside `tokens.css`. The paper colours become tokens (`--paper`, `--paper-ink`).
- Accessibility: German `aria-label`s, visible `:focus-visible`, contrast ≥ 4.5:1 on dark surfaces,
  `prefers-reduced-motion` turns off the reveal animation and pulses (the reveal then jumps straight to 100%).
- Below 820px: stage first, then inspector, then evidence strip; rail and specimen panel hidden; floating toolbar inline.

## Acceptance
1. `/lab` shows the real Gedicht A at start. "Andere Lesart zeigen" reveals Gedicht B's real extracted
   reading, and clicking a line shows its real chain in the inspector.
2. Every view, the comparison, focus mode, recipe → "Meine Lesart", and the bridge work. All shortcuts work.
3. Reloading any URL state restores it exactly.
4. Playwright captures of the same states as `reference/screens/` at 1440×900 and 390×844 are committed to
   `docs/reports/pdf-lab-werkbank/`. No horizontal scroll at 390px.
5. Typecheck and build pass. `MODULES.md` and the PDF Lab README point to the new route.

## Out of scope
New extraction engines, OCR runs, uploads of arbitrary PDFs, editing more than four lines, multiplayer.

# PDF encounter — the first part of the demo

3 November 2026 · Claude (assistant) · Proposal. Describes `/lab` on `feat/pdf-lab-werkbank` as inspected in a running dev server on 3 November, and what the demo still needs.

## Question the part answers

"When I send you a PDF, what am I trusting?" The audience sees one page and two readings before anyone explains it.

## What exists today (verified in the browser)

`/lab` is the Aurora Werkbank from PR 59. Real material: `01-poem-visible.pdf` (Gedicht A) and `01-poem-other.pdf` (Gedicht B), recorded MuPDF image, recorded MuPDF and pdftotext extractions, four whole-line Type 3 glyphs with real ToUnicode mappings. Missing data is labelled: „Buchstaben-IDs und Einzelkästen: nicht erfasst“, „Laufdatum nicht erfasst“.

| Element | State |
| --- | --- |
| Views Seite / Text / Zeichen / Struktur | real, keys `1–4` |
| Durchsicht slider and „Andere Lesart zeigen“ (`R`) | real, animated reveal with two pulses, reduced motion respected |
| Inspector chain gezeichnet → Zeichen → Zuordnung → gelesen | real for the selected line; Rohdaten show real excerpts |
| Vergleichen (`V`) | real synced A/B |
| Fokus (`F`, `?fokus=1`) | **done** — collapses both panels, full-width stage. The "focus mode for the PDF document" from the agreed plan needs no further work |
| Eigene Lesart (recipe) | real writer, labelled „Neu erzeugt · nicht gemessen“; exploration only |
| Belegleiste | „Gemessen · pdftotext 26.08.0 · Laufdatum nicht erfasst · 01-poem-other.pdf · Originalquelle · Beleg“ |
| Assistant dock | opens once per browser session; „Andere Lesart zeigen“ / „Schliessen“ |
| Bridge button „Zur menschlichen Erfahrung“ | opens the overlay; its button goes to `/canvas` (fallback page, see BRIDGE) |

## Presenter path (the only states that are rehearsed)

| Step | What the presenter does | URL state |
| --- | --- | --- |
| P1 Lesen | Open the start state. Gedicht A, Seite view, dock open with „Lies diese vier Zeilen …“. Read the four lines aloud or let the audience read. | `/lab` (after reset `0`) |
| P2 Enthüllen | Press `R` or the dock button. Durchsicht goes 0 → 100 %; the differing words pulse. | `/lab?probe=b&durchsicht=100` |
| P3 Eine Zeile prüfen | Press `↓` twice to line 3. The inspector shows "A moth rehearses being flame." drawn, glyph `<43> · /line2`, mapping „abweichend“, read as "A word slips free before a song." Evidence strip: Gemessen. | `/lab?probe=b&durchsicht=100&zeile=3` |
| P4 Fokus (optional, if time) | `F`. The page alone, full width. One sentence: "Same pixels. Different text." `F` again to return. | `…&fokus=1` |
| P5 Brücke | Click „Zur menschlichen Erfahrung“ in the evidence strip. | overlay, see BRIDGE |

The whole part is one to two minutes. Zeichen, Struktur, Vergleichen and the recipe editor stay available for questions and are not part of the path.

## What is still missing for the demo

1. **Bridge target.** The overlay links to `/canvas`, which says the investigation does not exist. BRIDGE and CODEX-BRIEF-1 fix the target to `/canvas/bilderrahmen-mac` and carry context.
2. **Presenter reset.** `0` resets URL state but not the once-per-session dock. The presenter needs a reset that also reopens the dock, so P1 looks the same in every rehearsal. Proposal: `0` pressed twice within two seconds, or a „Demo zurücksetzen“ entry in the rail, clears `sessionStorage` for the dock as well.
3. **Start state is explicit.** `/lab` with no params must equal P1 exactly: Gedicht A, Seite, line 1, Durchsicht 0, dock open. Today this holds; the brief adds a Playwright check so it keeps holding.
4. **The 502 noise.** Without `npm run dev:server`, `/lab` logs proxied `/api` 502s. They are harmless but visible in devtools; the presenter runs the server anyway for the .phf part. Document it in the runbook, no code change.

## Copy (German, verbatim in the UI)

- Dock: „Lies diese vier Zeilen. Dann zeige ich dir, wie ein Programm sie gelesen hat.“ · buttons „Andere Lesart zeigen“ · „Schliessen“ (exists)
- Evidence strip: „Gemessen“ · „Neu erzeugt · nicht gemessen“ · „Laufdatum nicht erfasst“ (exists)
- Stage note under Zeichen: „Eine Glyphe zeichnet eine ganze Zeile. Buchstaben-IDs und Einzelkästen: nicht erfasst.“ (exists)

## Not in this part

New engines, OCR, uploads, more specimens, pdf.js. The standalone Workbench in `sideprojects/pdf-lab/workbench` stays as it is.

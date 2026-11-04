# PDF Lab Werkbank — Step 0

Inspected before implementation on 3 November 2026. Base: `feat/commons-aurora`,
`d3f8b6d3cc25050e7e4854cce7a485f53fa4ba9e`. Author: Codex (assistant).

## Existing applications

- `apps/commons`: React 19, strict TypeScript, TanStack Start v1/Router and Vite 8;
  SPA build in `dist/client`. Shared `AppShell`, `TopBar`, launcher, `Button`, `Chip`,
  `Badge`, icon sprite and Aurora tokens are available. `/lab` is not present yet.
  The PDF Lab navigation currently leaves Commons for the public cabinet.
- `sideprojects/pdf-lab/workbench`: TanStack Start/React, deterministic ingest,
  pure domain/adapters, recorded page images, selection-to-source inspector,
  stored comparisons, and the narrow four-line PDF writer. It remains operational.

## Real specimens and evidence

The four files are in `sideprojects/pdf-lab/output/pdf/`:

| File | Content | Recorded readers |
| --- | --- | --- |
| `01-poem-visible.pdf` | Four Type 3 glyphs; each paints one complete line and maps to its visible wording | MuPDF text/render; Poppler text/render |
| `01-poem-other.pdf` | Same visible drawing; different ToUnicode mappings for all four lines | MuPDF text/render; Poppler text/render |
| `01-poem-direct.pdf` | Ordinary Helvetica control | MuPDF text/render; Poppler text/render |
| `01-poem-raster.pdf` | Image-only control, no text | MuPDF text/render; Poppler text; no stored Poppler rendering in the main report |

Rendering uses committed WebP images, not pdf.js or a live PDF engine. The paired
source renderings are pixel-identical within the measured engines. The raster
control reuses the visible specimen's source preview, explicitly labelled.

`evidence/poems-results.json` records file SHA-256, commands, stdout/stderr, exit
codes, resource limits, extracted text and pixel hashes. Versions: MuPDF 1.26.11,
PyMuPDF 1.26.6, Poppler **pdftotext** 26.08.0. This report has **no run timestamp**;
the separate pdftoppm version is also absent. Do not transfer pdftotext's version
to pdftoppm. `evidence/poems-transforms.json` adds dated (2026-10-31) source,
clone, rewrite and raster observations and engine renders. A transform date is
not the missing timestamp of a main-report run.

`twoPoemFixture.ts` reads the real ASCII fixture bytes: placements, character codes
`41`–`44`, glyph names, CharProcs, font object, content object, FontBBox and
ToUnicode entries. `selectLine()` derives guide regions from placement plus the
font's **declared** bounds. These are not measured ink/letter boxes or native PDF
text selection.

## Required adaptations to the reference

- The packaged mock's German poem, calculated `gNN` identifiers, per-letter
  mapping table, pdf.js reader and sample run date are placeholders.
- A01 has **one glyph per whole line**. Zeichen will show these real line glyphs,
  character codes and mappings, with a declared-bounds explanation. Individual
  letter IDs/boxes are **nicht erfasst**; no synthetic subdivisions are measured.
- Struktur can show parsed page/content/font/ToUnicode/glyph references. A
  human-friendly text-block/line hierarchy is an authored view, not a PDF semantic
  structure tree. Missing tagged structure remains **nicht erfasst**.
- Text and overlay passages must be found in the selected reader's actual
  extraction. Any spatial reflow is labelled; raw extraction retains Poppler's
  differing order/line breaks.
- The four-line writer generates real PDF bytes and a versioned recipe after
  verifying the parent hash. New bytes are parsed for inspection, but have no
  reader run: **Neu erzeugt · nicht gemessen**. Source-render reuse is justified
  only by verifying that the ToUnicode object alone changed.
- Native viewer copy/paste, OCR and physical printing remain unmeasured.

## Reference and delivery plan

The ZIP's `reference/pdf-lab-mock.html` is the implementation reference named by
the user's instructions. It extends the separately attached HTML with the
floating toolbar, keyboard shortcuts, zoom, reveal pulses and generation toast.
Both use placeholder domain material. The ZIP is preserved unchanged.

Small commits: (0) reference and this audit; (1) shared data/route/frame;
(2) real stage representations and synchronized selection; (3) inspector/writer;
(4) URL interactions, keyboard, dock and bridge; (5) browser verification,
screenshots, documentation and proposal. One PR targets `feat/commons-aurora`.

The context packet `cp_7cdc6f026054f6d6650d202f` has cutoff `93a5445150d0`, older
than this base. Current source and `.observstory/knowledge.json` were checked;
historical naming/visual proposals do not override the supplied Aurora mock.

No photo-frame canvas investigation exists on the base. The reference permits
a `/canvas` fallback; its destination must be explicit rather than silently
opening the unrelated Schwammstadt fixture.

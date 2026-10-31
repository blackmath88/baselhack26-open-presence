# A01 — A lamp beside the rain

31 October 2026 · implemented experiment · original text and construction by Codex (assistant). This is a ToUnicode artwork extending the maze glyph bench, not a reproduction of a historical font project.

Read the page. Open the alternate PDF, select the verse and try copying it. Then reveal the mapping, choose a control, or write four new lines in the browser's **Bend your own four lines** form. That form constructs a downloadable PDF locally; it does not imitate extraction or send the poem to a service.

## The two poems

| Visible drawing | Alternate character reading |
| --- | --- |
| I leave a lamp beside the rain. | I keep a tide beneath my tongue. |
| The window gathers little seas. | The silence carries paper boats. |
| A moth rehearses being flame. | A word slips free before a song. |
| Dark gives each wing a name. | The shore was listening so long. |

The two readings are separately authored. No confidentiality is intended: both are plainly inspectable in source and PDF objects.

## Reproduce just this increment

From `sideprojects/pdf-lab`, with the existing `requirements-check.txt` dependencies installed and Poppler on PATH:

```sh
python3 lab.py poems
python3 check-poems.py
node test-poems.js
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/index.html#poems`. Stop the server when finished. Generation of the three vector fixtures remains standard-library-only. The focused checker derives the fourth, raster-only PDF from its measured MuPDF rendering, generates lossless WebP previews, and adds all four files to `output/pdf/manifest.json` and `poems-manifest.json`. It preserves the prior 23 artifacts; no earlier cabinet rebuild is needed. A full `lab.py build` includes the three vector fixtures; run the focused check afterwards to regenerate the derived raster and complete its evidence.

The same bend is available from the CLI:

```sh
python3 lab.py poem --lines \
  "A tide waits under the floor." \
  "The house remembers the sea." \
  "I open a door in a whisper." \
  "Water comes looking for me."
python3 lab.py inspect output/bends/poem.pdf
pdftotext output/bends/poem.pdf -
```

The CLI writes both PDF and JSON recipe with visible text, mapping and SHA-256. Inputs are four printable ASCII lines, 1–32 characters each. This is a conservative local control boundary, not a statement of the PDF format's Unicode limits.

Optional browser smoke, using an already installed Playwright and Chromium (no root manifest or dependency changes):

```sh
# Activate the Python environment containing requirements-check.txt first.
NODE_PATH=/path/to/existing/node_modules \
  CHROMIUM_PATH=/usr/bin/chromium \
  PDF_CHECK_PYTHON=python3 node test-poems-browser.js
```

The test owns a temporary server bound to 127.0.0.1, launches an ordinary browser child, downloads a custom PDF, checks it with both extractors and compares its MuPDF pixels. It closes browser/server and deletes its temporary download before exiting. Screenshots depict the HTML workbench, not a live PDF viewer.

## Construction recipe

`poems.py` uses the existing `build.PDF` writer. Four `/CharProcs` streams each begin with `500 0 d0` and draw one original line with the font's Helvetica resource. The Type 3 font has identity FontMatrix, point-based coordinates, codes 41–44 and four widths of 500. Four positioned glyph invocations paint the verse. The title and captions are ordinary text.

The visible-mapping and alternate-mapping PDFs have byte-identical objects except object 9, their `/ToUnicode` stream. The mapping stream length and subsequent xref offsets consequently differ. Each source code maps to a UTF-16BE sequence representing a complete line. There is no ActualText, invisible text overlay, PDF JavaScript, network action or host command.

`poems.js` is a deliberately narrow writer for this exact uncompressed ASCII fixture. It changes that mapping stream, recomputes its length and all xref offsets, and creates a local Blob download. It rejects oversized inputs and unexpected object structure. `test-poems.js` establishes byte-for-byte parity with the canonical Python alternate fixture and checks mapping-only changes and xref positions for a custom reading. It is not an arbitrary-PDF editing library.

## Measured observations

See [raw engine runs](evidence/poems-results.json), [browser results](evidence/poems-browser-results.json) and [artifact hashes](output/pdf/poems-manifest.json). The precise commands, versions, stdout and stderr are retained. Engine processes use 10 seconds wall time, 8 seconds CPU, 768 MiB address space and 4 MiB file limits. These authored passive fixtures do not execute actions.

| Instrument | Visible vs alternate mapped PDFs | Direct-text control | Raster-only control |
| --- | --- | --- | --- |
| MuPDF 1.26.11 / PyMuPDF 1.26.6 | Identical 612×792 RGB pixels; each intended poem extracted with line breaks | Visible poem extracted; pixels differ from Type 3 | Zero extracted text; exact pixel identity to its MuPDF source render |
| Poppler 26.08.0 | Identical 72 dpi PPM bytes; each intended line extracted | Visible poem extracted; PPM bytes equal to Type 3 | Zero extracted text; raster render equality untested |
| Chromium 154.0.8037.97 workbench | Selector changes actual file and measured extraction display | Selector exercised | Empty extraction display exercised |

MuPDF's mapped render pixel hash is `0868696dcf6c3120a6ea656c17422a2af44378f0486a6b60a1a96d3fab606741`. Equality is within each renderer; the experiment does not require pixels to agree across engines.

**Extraction layout is not preserved uniformly.** Poppler's `-layout` output concatenates the four mapped lines and places them before the ordinary page header. Its default extraction of the custom browser download also changes order and joins some lines. The raw outputs are intentionally retained. All four intended strings survive, but this does not establish poetry lineation, reading-order fidelity, accessibility or native copy/paste quality in Poppler-based products.

The browser smoke used the four custom lines shown in `evidence/poems-browser-results.json`. Its downloaded PDF extracted those strings in both engines, and its MuPDF pixel hash matched the canonical artwork. [Desktop (1440 px)](evidence/previews/01-poem-workbench-desktop.webp) and [mobile (390 px)](evidence/previews/01-poem-workbench-mobile.webp) screenshots were visually inspected; no browser page errors occurred. The arbitrary visitor's next custom file has no recorded consumer run, as the UI states.

## One repair and remaining boundaries

An early, longer fourth-line mapping (`The dark makes room for what it sees.`) came back as raw `D` in the first MuPDF extraction run. Shortening the poems restored all intended strings; controls now cap each line at 32 ASCII characters. This is an observed fixture limitation, not a demonstrated universal engine limit or a minimized defect report. The accepted specimens and current raw runs are the shortened version. The unrelated direct-text pixel difference remains an observation with unassigned cause; no additional repair loop was attempted.

Native viewer selection/copy/paste, screen-reader behavior, OCR of the raster and physical printing remain **not run**. A later [transformation notebook](TRANSFORMATION-NOTEBOOK.md) measures object-clone and Ghostscript pdfwrite survival, with raw outputs and separate pixel metrics. The browser smoke tests the workbench and downloaded bytes, not Chromium's native PDF viewer. The preview is labelled as a measured rendering. This is self-verified assistant work, not independent review or human acceptance.

Next useful increment: qualify selection/copy/paste in one named interactive viewer, recording its version and actual pasted text, especially the four-line reading order. The transformation notebook now supplies the bounded rewrite comparison; native viewer line order remains open.

# One glyph, three maps

31 October 2026 · bounded local observation by Codex (assistant). This reduces the two-poem Ghostscript mapping-loss observation to a 200×200 page with one vector glyph. No title, captions, nested text, Helvetica resource, forms or actions remain.

The original drawing is a teal square crossed by an orange diagonal. Code `41` invokes the same `/mark` CharProc in every source. Only object 5, the ToUnicode CMap, changes:

| Case | Source mapping | Source extraction, both engines | After Ghostscript pdfwrite, both engines |
| --- | --- | --- | --- |
| Identity control | `41 → A` | `A` | `A` |
| Nonidentity one-character control | `41 → Z` | `Z` | `Z` |
| Short multi-character experiment | `41 → SEA` | `SEA` | `A` |

The Z control matters: an identity map could appear to survive merely because the reader falls back to the original A code. Here the nonidentity one-character map survives, while the three-character map does not. This narrows the observation for these specimens/settings; it does not establish a universal length threshold or a standards defect.

## Recipe and bounds

From `sideprojects/pdf-lab`, using the existing check environment, Ghostscript and Poppler:

```sh
python3 minimize-mapping.py
```

This uses `build.PDF` for three seven-object source PDFs and reuses the existing notebook's bounded instrument functions. It does not rebuild earlier artifacts. Six files and a manifest go to `output/mapping-minimal/`. Raw commands, versions, decoded CMaps, extraction and render hashes go to `evidence/mapping-minimal.json`. Existing 27 cabinet PDFs and four transformation derivatives are checked unchanged.

The Type 3 font has `/FontMatrix [.001 0 0 .001 0 0]`, `/FontBBox [0 0 1000 1000]`, width 1000, a single `/mark` glyph and empty font resources. Its content is:

```text
1000 0 d0
0.1 0.55 0.6 rg 100 100 800 800 re f
1 0.6 0.2 RG 35 w 150 150 m 850 850 l S
```

The page invokes that glyph once: `BT /G 160 Tf 1 0 0 1 20 20 Tm <41> Tj ET`. Each ToUnicode stream uses one `beginbfchar` entry. There are no other authored differences in source objects; stream lengths and xref offsets change as needed.

Each input is independently rewritten under the notebook's existing recipe:

```sh
SOURCE_DATE_EPOCH=1793473800 gs -q -dSAFER -dBATCH -dNOPAUSE \
  -sDEVICE=pdfwrite -dCompatibilityLevel=1.7 \
  -dAutoRotatePages=/None -dOmitInfoDate=true -dOmitID=true \
  -sOutputFile=output/mapping-minimal/multiple-rewrite.pdf \
  output/mapping-minimal/multiple-source.pdf
```

The fixed epoch is a reproduction setting, not a run timestamp. Each child is limited to 10 wall seconds, 8 CPU seconds, 768 MiB address space and 4 MiB file output. Fixtures are original, passive and local. No paid API, network action or host-execution payload.

## What the CMaps show

Ghostscript 10.08.0 writes a one-entry `beginbfrange` for each one-character control:

```text
Identity: <41><41><0041>
Single:   <41><41><005a>
```

For SEA, the output ToUnicode stream contains the codespace definition but no `beginbfchar` or `beginbfrange` entries. Both extractors return A. The decoded source and output streams are committed in full, with hashes, in the evidence. The three rewritten outputs are **not** byte-identical: Z remains distinct. Do not generalize the earlier two-poem byte collapse to these controls.

Versions: MuPDF 1.26.11 through PyMuPDF 1.26.6, Poppler 26.08.0, Ghostscript 10.08.0. Both source extraction results are asserted to equal the intended mapping before rewrite results are interpreted.

## Rendering is measured separately

Within each renderer, all three source mappings have the same pixel hash, and all three rewritten mappings share another pixel hash. However, the rewrite is not pixel-identical to its source:

| Instrument | Changed pixels at 72 dpi | Maximum channel error | Mean error (0–255 scale) |
| --- | ---: | ---: | ---: |
| MuPDF | 16,512 / 40,000 | 16 | 0.17613 |
| Poppler | 15,600 / 40,000 | 1 | 0.13000 |

These counts apply to each mapping. Poppler's many changed pixels are only one red-channel unit apart; for example a teal interior sample changes `(25,140,153)` to `(26,140,153)`. MuPDF has a different antialiasing/color sample outcome. No color-management cause or perceptual-equivalence claim is established. The unmodified raw sample hashes and labelled lossless renders are retained.

## Play and inspect

Open `index.html#poem-journey`, then **Minimize: one glyph, three maps**. Switch map/instrument to compare actual source/output artifacts, recorded extraction and decoded CMaps. The preview is a measured render, not a live PDF viewer.

A focused browser check reuses the existing host/test lifecycle and skips earlier workbench scenarios:

```sh
NODE_PATH=/path/to/existing/node_modules \
  PDF_CHECK_PYTHON=python3 node test-poems-browser.js --minimal
```

It checks all three controls in both instruments, actual served PDF hashes, CMap display, keyboard selection and 1440/390 px layouts. See `evidence/mapping-minimal-browser.json` and `evidence/previews/minimal-workbench-{desktop,mobile}.webp`. The loopback host and ordinary browser child close on exit.

No repair was needed. No other mapping lengths, CMap encodings, font types, Ghostscript versions, native viewer copy/paste, OCR or physical printing were tested. This is assistant self-verification, not independent review or human acceptance. The next justified step is source/spec inspection of the multi-character mapping path before adding variants or calling this a bug; alternatively qualify native viewer copy/paste on the existing artwork.

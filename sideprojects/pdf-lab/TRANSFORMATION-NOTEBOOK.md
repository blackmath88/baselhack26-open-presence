# A01 — Which poem survives a new file?

31 October 2026 · local observations by Codex (assistant), self-verified. This notebook turns the existing two-poem artwork into a small transformation experiment. It does not qualify physical printing, native copy/paste or every application's Save As.

Start at `index.html#poem-journey`. Choose a starting mapping, transformation and instrument. Compare actual recorded renderings, predict which reading survives, then reveal the raw extraction. **Show changed pixels** switches to a measured RGB difference mask; it does not run a renderer in the browser. Each state links to the source and actual output PDF, their hashes, its command and decoded output character map.

## Reproduce

Use the existing check environment (`requirements-check.txt`), Poppler and Ghostscript. No new dependency or root manifest change:

```sh
cd sideprojects/pdf-lab
python3 check-transforms.py
python3 -m http.server 8080 --bind 127.0.0.1
```

The source inputs are the committed A01 `visible`, `other` and `raster` PDFs. The command does **not** rebuild any source specimen. It creates four derivatives in `output/transforms/`, raw evidence in `evidence/poems-transforms.json`, and labelled rendering/difference WebPs. All 27 cabinet source hashes are checked before and after. The four derivatives have a separate manifest; they are not additional cabinet families.

The script optionally honors `PDF_LAB_CHECKPOINT=/path/to/CHECKPOINT` for the bounded NUC window; normal offline reproduction does not require runtime files. Each child has 10 seconds wall time, 8 CPU seconds, 768 MiB address space and 4 MiB file-output limits. Inputs are the existing small owned fixtures, with no PDF actions or network requests. Error/timeout fails the recipe rather than becoming a survival observation.

To repeat the browser controls, with an existing Playwright installation:

```sh
NODE_PATH=/path/to/existing/node_modules \
  CHROMIUM_PATH=/usr/bin/chromium \
  PDF_CHECK_PYTHON=python3 node test-poems-browser.js
```

The browser test checks source/clone/rewrite/raster in both instruments, actual served artifact hashes, visible versus alternate selection, keyboard selection/reveal and 390 px layout. Its loopback host and Chromium child close when the test exits. It verifies the workbench, not a native interactive PDF viewer.

## Operations are different experiments

1. **Identity control:** use the exact original bytes. This is the visual and extraction baseline for that starting map.
2. **pypdf 6.10.0 object clone:** `PdfWriter(clone_from=source).write(output)` in a bounded process. No deliberate content edits or rasterization. The output bytes differ from the original; this operation preserves both measured pixel outputs and intended line strings.
3. **Ghostscript 10.08.0 pdfwrite:** reinterpret the page and produce another PDF using the explicit settings below. This is not the same operation as an object clone, rasterization or a physical printer.
4. **MuPDF 1.26.11 raster control:** reuse the existing A01 72 dpi RGB image-only PDF. Both branches deliberately reuse that same control, justified by A01's measured identical mapped renders. They are not two independently executed rasterizations. There is no OCR pass.

Ghostscript command, replacing paths with the chosen input/output:

```sh
SOURCE_DATE_EPOCH=1793473800 gs -q -dSAFER -dBATCH -dNOPAUSE \
  -sDEVICE=pdfwrite -dCompatibilityLevel=1.7 \
  -dAutoRotatePages=/None -dOmitInfoDate=true -dOmitID=true \
  -sOutputFile=output/transforms/poem-other-rewrite.pdf \
  output/pdf/01-poem-other.pdf
```

The fixed environment epoch and metadata switches are recorded reproduction settings, not the experiment's actual wall-clock timestamp. Each clone/rewrite is executed twice in the run and compared byte-for-byte; all four derivatives were stable within this run. The checked-in version/settings qualify that observation, not every platform or Ghostscript release.

## Measured matrix

Versions: Python 3.12.16, pypdf 6.10.0, MuPDF 1.26.11 through PyMuPDF 1.26.6, Poppler 26.08.0, Ghostscript 10.08.0. Renders are RGB at 72 dpi, 612×792. Pixel difference means any changed channel, without perceptual tolerance. Values apply to both starting mappings, measured separately except the explicitly reused raster control.

| Operation | MuPDF extraction | Poppler extraction | Changed MuPDF pixels | Changed Poppler pixels | Outputs for the two source mappings |
| --- | --- | --- | ---: | ---: | --- |
| Identity | Four intended line strings | Four intended line strings; order/lineation differ | 0 | 0 | Different bytes |
| pypdf clone | Four intended line strings | Four intended line strings; order/lineation differ | 0 | 0 | Different bytes |
| Ghostscript pdfwrite | Raw `A`, `B`, `C`, `D` instead of verse | Raw `ABCD` instead of verse | 3,043 / 484,704 | 0 / 484,704 | **Exactly the same bytes** |
| Raster control | Empty | Empty | 0 / 484,704 | 25,090 / 484,704 | Same reused control |

Header and caption text survives the Ghostscript rewrite; “zero poem lines” does not mean zero extracted text. Poppler's raw output and MuPDF's line breaks remain in the evidence. The classifier checks all four full strings independently; it does not certify reading order, accessibility or poetic lineation.

The MuPDF rewrite mean absolute RGB channel error is approximately **0.0178 / 255** over the whole page. This is a measured sample difference, not a claim that the picture is perceptually identical. Poppler's rewritten render is exactly equal to its source samples at this resolution. The raster comparison in Poppler differs because the source raster is MuPDF's output; it is not evidence that an image-only PDF carries a second poem.

## Two readings collapse to one file

The source maps differ, and pypdf keeps those differences. Under this Ghostscript recipe, both sources produce output SHA-256:

`50dd20d903152dbdd52c22e9621a529c868f80a58c70583ec444c47c73aafd99`

That is actual output byte identity, not merely equal extraction or equal render hashes. Both source files were processed independently and then compared. The rewritten Type 3 font still has a `/ToUnicode` stream, but that decoded stream contains no `beginbfchar`/`beginbfrange` entries. The poem strings are absent from extracted verse, and both engines fall back to A–D. This directly observed structure supports the mapping-loss explanation for these fixtures. It does not establish why Ghostscript made that choice or whether the input is conforming in every respect.

The raw structure listing includes decoded ToUnicode streams and their hashes. A mere `/ToUnicode` key is therefore not a sufficient survival check. Likewise, visually unchanged output in one renderer is not evidence of semantic preservation.

## Minimized follow-up — one glyph, three maps

[The minimized experiment](MAPPING-MINIMAL.md) now removes the poem layout and nested text. One tiny vector glyph maps to A, Z or SEA. Both extractors return the intended source strings. Ghostscript 10.08.0 preserves A and Z, but SEA becomes A; its output CMap has no mapping entries. This separates the nonidentity single-character control from the short multi-character case without establishing a general length threshold or standards defect. Source/rewrite rendering differs in both engines and is measured separately. The three rewritten files do not all collapse to the same bytes because Z survives. The existing notebook has a small selector/CMap drawer for these actual artifacts.

## Artifacts and limits

- [Raw notebook](evidence/poems-transforms.json): parent/output hashes, exact commands, stdout/stderr, tool versions, structure, pixel metrics and pair comparisons.
- [Derived manifest](output/transforms/manifest.json): the four clone/rewrite PDFs and their parent hashes.
- [Ghostscript result](output/transforms/poem-other-rewrite.pdf) · [pypdf result](output/transforms/poem-other-clone.pdf).
- Workbench screenshots and browser result: `evidence/previews/01-poem-journey-{desktop,mobile}.webp`, `evidence/poems-browser-results.json`.
- [Source artwork, controls and original limitations](TWO-POEMS.md).

No OCR, physical printing, screen-reader testing, interactive native viewer selection, font substitution or other rewrite settings are measured. No security defect, historical reproduction or universal tool behavior is claimed. All results are assistant self-verification, not independent review or human acceptance.

Next useful increment: qualify one actual viewer's selection/copy/paste and pasted line order. The one-glyph minimization is now recorded; source/spec inspection is needed before making a causal or conformance claim about Ghostscript. Keep the existing paired poem artwork as the artistic reference.

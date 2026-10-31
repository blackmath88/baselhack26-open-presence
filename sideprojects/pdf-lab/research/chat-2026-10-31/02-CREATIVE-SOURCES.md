# Creative repositories and tinkering sources

31 October 2026 · Perplexity, assistant · Annotated source leads from the conversation. All functionality and viewer support below are source-reported unless explicitly qualified. No project was built or executed here. Pin commits and inspect licences before importing code or artefacts.

## Games and small computers

| Source | What makes it interesting | Support and next dissection |
|---|---|---|
| [osnr/horrifying-pdf-experiments](https://github.com/osnr/horrifying-pdf-experiments) | Breakout through PDF form fields and events; original 2016-era experiments | README reports Chrome and tentative Acrobat/Foxit support. Read generators to understand appearance streams and input constraints; current support unknown. |
| [ThomasRinsma/pdftris](https://github.com/ThomasRinsma/pdftris) | Form-field monochrome grid and input; January 2025 lead | Author reports PDFium and PDF.js. Demonstrates a specific runtime subset, not all form scripts. |
| [ThomasRinsma/pdfdoom](https://github.com/ThomasRinsma/pdfdoom) | Doom as ASCII art, compiled code and PDF I/O | Author limits support to PDFium. Requires appropriate WAD rights and build-tool investigation. |
| [ading2210/linuxpdf](https://github.com/ading2210/linuxpdf) | Linux through a TinyEMU RISC-V emulator compiled to asm.js | Different project/lineage from ThomasRinsma's ASCII Doom; do not conflate DoomPDF implementations. Study runtime bridge and display. |
| [simplyrohan/pdfboy](https://github.com/simplyrohan/pdfboy) | Peanut-GB emulator adapted to PDF | Author specifies Chrome-based browsers and Emscripten 1.39.20; Mac build warning. Inspect main.c, peanut_gb.h, glue.js, generate.py and embed_file.py. Use an owned homebrew ROM. |
| [rwarnking/pdf-games](https://github.com/rwarnking/pdf-games) | LaTeX/JS collection: cellular automata, ASCII donut, chess and other games | Author tested Acrobat Reader, not other viewers. Historical TeX Live 2021 setup; MIT reported. Extract small interaction patterns rather than porting every game. |
| [Lucas-C/undying-dusk](https://github.com/Lucas-C/undying-dusk) | Approximately 200,000-page dungeon crawler, exploration, inventory and link navigation | Author supplies a viewer table and recommends Sumatra. Inspect gen_pdf.py, pdf_game/ and STORY.md. Do not repeat its first-PDF-video-game priority claim. Page topology as game state is the useful connection. |
| [esdmr/badpdf](https://github.com/esdmr/badpdf) | Bad Apple playback experiment | Search-indexed author description reports PDFium/PDF.js testing; full fetch failed in this research. Display primitive, licence and scheduler remain to inspect. Use original owned animation for a remix. |

## Multiple identities, self-reference and construction history

| Source | Mechanism / material | Caveat and transfer |
|---|---|---|
| [Corkami: Abusing File Formats](https://github.com/corkami/docs/blob/master/AbusingFileFormats/README.md) | Original format-craft explanations, including PDF polyglots and source/output combinations | Historical viewer restrictions matter. Distinguish a real usable second format from a recognition trick. |
| [Corkami PoCs](https://github.com/corkami/pocs) | Hand-crafted specimens and binary-format experiments | Includes [Super NES / Mega Drive / PDF construction notes](https://github.com/corkami/pocs/blob/6d277c83efdceb6916ee8c6efe6ff0639cc6193f/poly/SnesMd/snes_md.txt). Do not assume modern compatibility or asset rights. |
| [ESultanik/PDFGitPolyglot](https://github.com/ESultanik/PDFGitPolyglot) | PDF is a Git repository containing LaTeX source and a copy of itself; 2017 project | README demonstrates cloning the PDF. Build uses patched Git, Python 2.7 and TeX; inspect make_polyglot.sh, update_deflate_headers.py and verify_xrefs.py in isolation. |
| [corkami/mitra](https://github.com/corkami/mitra) | Polyglots, near-polyglots and format-interleaving strategies: stack, cavity, parasite, zipper | Mocky also manipulates recognisable signatures. A detector's identification is not validation. Use inert owned PDF/image/archive material. |
| [TruePolyglot](https://truepolyglot.hackade.org/) and [GitHub fork](https://github.com/ansemjo/truepolyglot) | Focused PDF/ZIP constructions and layout constraints | Fork warns inherited docs may be outdated and reports limited Firefox/Evince tests. Legacy PyPDF2 API is a build qualification task. |
| [misc0110/polyglot-jpg-pdf](https://github.com/misc0110/polyglot-jpg-pdf) | Small C tool combining JPEG/PDF interpretations | Author says Acrobat Reader 10 onward cannot open the resulting PDF. Treat this as a compatibility specimen, not universally valid output. |
| [corkami/collisions](https://github.com/corkami/collisions) | Published MD5 collision examples and construction explanations | Keep MD5/SHA-1 weakness distinct from PDF behaviour and SHA-256. Use existing harmless examples first. |
| [Hashquines](https://github.com/corkami/collisions/blob/master/hashquines/README.md) | PDFs displaying their own MD5, through image or text constructions | Not evidence that secure hashes can generally be made self-displaying this way. Separate hashquine, source bundle and exact self-reproducer. |

## Hidden readings and channels

| Source | Mechanism / material | Caveat and transfer |
|---|---|---|
| [thoppe/PDF_steganography](https://github.com/thoppe/PDF_steganography) | Font mappings; example and Makefile; copy/paste alternate reading | Inspect example.tex, replace_sub.py, sub_cipher.py. Historical font tools; no licence established in this research. |
| [ncanceill/pdf_hide](https://github.com/ncanceill/pdf_hide) | 2012 research prototype, Python 3, samples/tests and qpdf dependency for compressed PDFs | GPLv3+ reported. Exact carrier needs source inspection; do not call it undetectable based on README rhetoric. |
| [aagallag/PDFStego](https://github.com/aagallag/PDFStego) | C++/PoDoFo; AES-128-GCM and Base64; author warns extraction exposes hidden material | GPLv3+ reported. Concealment, discoverability and confidentiality are separate measurements. |

## TeX as an interactive authoring ecosystem

- [animate](https://ctan.org/pkg/animate), [source](https://gitlab.com/agrahn/animate): graphics/text animation; source snapshot listed 2024-10-14. Test exact playback requirements.
- [ocgx2](https://ctan.org/pkg/ocgx2), [source](https://gitlab.com/agrahn/ocgx2): optional-content authoring, listed 0.60 / 2024-09-16. All TeX engines does not mean all PDF viewers.
- [fancytooltips](https://ctan.org/pkg/fancytooltips): arbitrary TeX and animated material in tooltips; documentation specifies Adobe Reader.
- [interactiveanimation](https://ctan.org/pkg/interactiveanimation): branching interactive frames; historical pdfTeX/Adobe Reader/JavaScript requirements.
- [PoC||GTFO 0x04](https://archive.org/details/pocorgtfo04), June 2014: publication-as-format-experiment, ZIP feelies and encrypted-volume/PDF craft. Read as archaeology, not a reason to run legacy volume tooling.

## Interactive geometry and custom interpreters

- [Asymptote source](https://github.com/vectorgraphics/asymptote), [tutorial](https://asymptote.sourceforge.io/asymptote_tutorial.pdf), [2026 author talk](https://www.math.ualberta.ca/~bowman/talks/tug26.pdf): programmable graphics, historical PRC-in-PDF and newer V3D direction. Keep PRC and V3D separate.
- [Scott Pakin's interactive example](https://www.pakin.org/~scott/asymptote_export/blender_asymptote.pdf): Blender to Asymptote to PRC to LaTeX/PDF; historical interactive-reader requirement and static poster fallback.
- [pdfv3dReader](https://github.com/vectorgraphics/pdfv3dReader): custom V3D-aware PDF.js viewer; name PDF engine and model interpreter separately.
- [Okular-v3d-Plugins](https://github.com/vectorgraphics/Okular-v3d-Plugins): embedded V3D, Poppler-based plugin changes, prerendering/version constraints. Useful implementation anatomy; not a first-demo dependency.

## Promising remixes, not implementation claims

A poem with another copy/paste reading; a layer-checkbox combination lock; a revision-history mystery; a PDF/ZIP self-contained workshop; an original ten-second demo; a visible register machine; an interactive model with a meaningful static poster; and a tiny page-state dungeon. Every remix needs its own source/licence manifest, controls and consumer matrix.

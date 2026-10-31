# PDF as several small machines

Research and local run date: 31 October 2026. Cabinet 003 adds ten generated PDFs: eight saved layer configurations, one bitmap circuit sheet and one calculator-function artwork. The gallery now has nine exhibit families and 23 files.

Labels: **Observed** means this checkout's recorded execution; **Source-reported** means a primary author reports it; **Proposed** means not built. An accepted file is not automatically conforming. A renderer is not the whole viewer product.

## 07 — The lock is the layers panel

**Question.** Can a static PDF make visibility depend on A AND NOT B AND C, and do independent readers evaluate it consistently?

**Construction.** `weird.lock()` creates three OCGs and an OCMD with `/VE [/And 5 0 R [/Not 6 0 R] 7 0 R]`. Four neighbouring panels use AnyOn, AllOn, AnyOff and AllOff policies. The gate also contains AllOn as its fallback policy. Eight fixtures alter only the catalog's default ON/OFF sets. Their page content streams are byte-identical. All paint is synthetic; there is no JavaScript.

**Controls.** Three individual OCG panels check initial states. Four policy panels distinguish expression behaviour from simpler policy handling. Independent Boolean calculations provide the intended truth table. The file remains inspectable even when the gate is hidden: this is a puzzle, not confidentiality.

**Instruments.** Poppler 24.02.0; MuPDF 1.26.11 through PyMuPDF 1.26.6; PDFium 156.0.8076.0 through pypdfium2 5.14.0. Rendering runs are separate processes, bounded to 10 seconds wall time, 8 seconds CPU, 768 MiB address space and 4 MiB per output file. Fixed blank panel-interior coordinates classify green versus grey; raw sample values and render hashes are retained.

**Hypothesis.** Every reader paints the gate only in state 101 and honours the four policy controls.

**Falsifier and observed result.** The hypothesis fails for this MuPDF build. All three readers follow the individual A/B/C states. Poppler and PDFium match all eight expected indicators in all eight configurations. MuPDF paints the gate and AllOn panel in every state and never paints AnyOff. AnyOn and AllOff match the intended table. We have not established the cause, generalised to other versions, or classified this as a security issue.

| ABC | Intended gate | Poppler | MuPDF | PDFium |
|---|---|---|---|---|
| 000 | hidden | hidden | visible | hidden |
| 001 | hidden | hidden | visible | hidden |
| 010 | hidden | hidden | visible | hidden |
| 011 | hidden | hidden | visible | hidden |
| 100 | hidden | hidden | visible | hidden |
| 101 | visible | visible | visible | visible |
| 110 | hidden | hidden | visible | hidden |
| 111 | hidden | hidden | visible | hidden |

**Demo.** Change the switches in the gallery to select actual recorded renders of each saved state. Open that state's actual PDF. Then try a real reader's layers panel. The gallery switches do not execute a PDF renderer and do not establish live viewer toggle support.

**Next investigation.** Minimise the policy discrepancy to one OCMD and one rectangle; compare direct versus indirect OCG arrays and a gate with no fallback `/P`; check a second MuPDF release. Those variants are not tested yet. Independently validate syntax before attributing a renderer bug.

[Adobe's OCMD API reference](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdflsdk/apireference/PD_Layer/PDOCMD.html), accessed 2026-10-31, documents the four policies and visibility-expression interface. This supports the construction mechanism, not a universal viewer-support claim.

## 08 — Pictures that add

**Question.** Can simple bitmap combination operations expose a computation clearly enough to reverse-engineer by watching the intermediate images?

**Construction.** The browser workbench implements a 16-bit NAND operator. Five gates produce an independent half-adder at every pixel: N=NAND(A,B); L=NAND(A,N); R=NAND(B,N); SUM=NAND(L,R); CARRY=NAND(N,N). The static PDF explains the network and shows its four scalar input cases. The browser simulator is our own code; the PDF does not run the simulator.

**Controls and instruments.** Independent XOR and AND calculations are the oracle, not a duplicate implementation of the NAND network. `node test-weird.js` checks 327,680 bitmap pairs, covering every 16-bit A against five B patterns. The circuit sheet is rendered and visually inspected with MuPDF.

**Hypothesis.** Every position satisfies A+B=SUM+2*CARRY.

**Falsifier.** A single pixel with an incorrect sum or carry disproves the implementation. No such mismatch appeared in the checked pairs. This is not exhaustive coverage of all 2^32 input pairs.

**Demo.** Paint A and B, watch the five derived pictures, and explain why the carry is separate. This is 16 half-adders, not a 16-bit adder with propagated carry. A future extension could make carry propagation visible as successive frames.

**Historical boundary.** Project Zero's [15 December 2021 FORCEDENTRY analysis](https://projectzero.google/2021/12/a-deep-dive-into-nso-zero-click.html) describes the CoreGraphics PDF/JBIG2 exploit and notes CVE-2021-30860 was fixed in iOS 14.8 on 13 September 2021. The toy illustrates Boolean composition only. No exploit file, memory corruption, codec payload or vulnerable decoder is reproduced. Historical exploitation is not evidence of a current vulnerability.

## 09 — The colour is a program

**Question.** Can a tiny non-JavaScript language generate a visible artwork inside a PDF, with enough transparency to explain its evaluation?

**Construction.** A Type 1 function-based shading invokes a Type 4 calculator function. For coordinates x,y in [0,1], it computes v=(sin(2160x)*cos(1440y)+1)/2, then RGB=(v,1-v,0.35). Angles are degrees. The stream is:

```text
{ 1440 mul cos exch 2160 mul sin mul 1 add 2 div dup 1 exch sub 0.35 }
```

**Controls.** A host-language analytic formula predicts six interior pixel samples. Inspection asserts FunctionType=4 and ShadingType=1. The generated file embeds no image grid or JavaScript. The function leaves exactly three colour outputs.

**Instruments and hypothesis.** The same three bounded renderer processes should produce the wave pattern with sample channels close to the independent formula. A difference greater than 0.15 in a unit colour channel falsifies this deliberately loose sampling check; this threshold is not a standards tolerance.

**Observed.** All three render the pattern. Maximum sampled channel errors are approximately 0.022 (MuPDF), 0.016 (Poppler) and 0.017 (PDFium) at 72 dpi. This covers six samples, not whole-image equality or colour-managed fidelity. Different raster sampling is expected.

**Demo.** Read the stack program while looking at the art. Change the two frequencies in `colour_program()`, rebuild and compare. A later extension could expose a step-by-step stack trace for one coordinate; that interface is not built yet.

The [PDF specification errata, clauses 7.10.5.1–2](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html), accessed 2026-10-31, identify Type 4 calculator functions and clarify their syntax. This is a restricted function language, not arbitrary PostScript or host access.

## The next two experiments — specified, not claimed as reproduced

### The hash that looks back

**Source-reported.** [Corkami's hashquine collection](https://github.com/corkami/collisions/blob/master/hashquines/README.md) describes files displaying their own MD5. Its construction strategy permits changing the displayed value while keeping the overall MD5 unchanged. This is not an extractor calculating a digest, and it does not imply a comparable SHA-256 construction.

**Question/construction.** Pin an original published specimen and its source commit; record provenance and licence before vendoring. Compare displayed text, extracted text and locally computed MD5; also record SHA-256. Use a one-byte-modified copy as a negative control. Run two renderers and an extractor. Hypothesis: original display matches MD5; edited control fails the equality. Falsifier: original digest/display mismatch or different rendering. Demo: same apparent self-reference can be preconstructed rather than computed at viewing time. No original hashquine binary was imported or measured in this build.

A collision pair is a separate experiment: two distinct byte strings with one weak digest. [Google/CWI's original 23 February 2017 announcement](https://security.googleblog.com/2017/02/announcing-first-sha1-collision.html) reports two different PDFs with identical SHA-1. A polyglot is instead one byte string with multiple format interpretations. Do not merge these into one “two valid readings” claim. Equal hashes alone do not prove byte identity; compare bytes where possible and record the hash algorithm.

The pasted report's `shattered.io` citation currently resolves to a general news site in this research session. Prefer the original announcement; do not silently assume old domain contents are unchanged.

### The scan that agrees with itself and is wrong

**Source-reported.** [David Kriesel's original account](https://www.dkriesel.com/en/blog/2013/0802_xerox-workcentres_are_switching_written_numbers_when_scanning) describes Xerox scan pixel substitutions discovered in July 2013 with OCR deliberately off. This is a historical device/encoding finding, not a claim that all JBIG2 is lossy or that modern scanners reproduce it.

**Question/construction.** First implement a clearly labelled symbol-deduplication toy on synthetic digit bitmaps. Sweep a documented similarity threshold and preserve the exact source raster. Include identity/no-merging and exact-match-only controls. Measure pixel changes and digit identity against source ground truth; run OCR separately as another consumer. Hypothesis: approximate merging can substitute a glyph while the transformed raster remains readable. Falsifier: no substitutions occur at tested thresholds, or OCR does not agree with the altered pixels. Do not describe simulated substitutions as an actual JBIG2 reproduction.

**Demo.** Source, encoded/transformed result and OCR side by side, with provenance at each step. Agreement between downstream consumers is not proof of fidelity to the source. A later real-encoder experiment requires a pinned encoder, settings and independent verification. Neither the toy nor actual codec reproduction is built in this slice.

## What the workbench should teach next

Replace a single ladder with independent axes: standards status, consumer agreement, computational mechanism and trust effect. A standards-valid feature can be incompatible; a polyglot can depend on parser tolerance; a weak-hash collision need not cross a sandbox. Self-reference is not inherently more dangerous than ordinary interactivity.

The most productive next work is reducing the observed layer discrepancy, then making the colour function's stack inspectable. Both deepen real running exhibits. The hashquine and scan stories remain strong queued investigations, with acquisition, measurement and interpretation kept separate.

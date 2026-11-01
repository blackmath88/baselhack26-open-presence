# Where the short map is lost

31 October 2026 · source audit by Codex (assistant). No new PDF experiment or renderer matrix was run. This connects the existing A/Z/SEA observations to version-matched upstream source, with pinned hashes and a reproducible offline audit.

## Finding and confidence

The static source path contains an explicit simple-font mapping filter consistent with all three minimized cases. Ghostscript's Type 3 font uses a Unicode decoder callback. The decoder returns byte lengths and caps this path at four bytes. The pdfwrite font code then adds a ToUnicode entry for a simple font with an Encoding only when that decoded byte length is at most two. The font writer can still serialize the allocated CMap after the entry was skipped.

| Existing measured case | Input UTF-16BE bytes | Inferred decoder return bytes | Writer insertion gate | Observed output CMap |
| --- | ---: | ---: | --- | --- |
| A | 2 | 2 | Add | One mapping entry |
| Z | 2 | 2 | Add | One mapping entry |
| SEA | 6 | 4 | Omit | No mapping entries |

This is a **static source-path inference matched to measured output**, not a traced execution or a rebuilt binary. The installed Arch package reports `ghostscript 10.08.0-1`; the upstream tag matches that version, but its source-to-binary relationship was not independently attested. The installed `/usr/bin/gs` SHA-256 is recorded. No claim that every Ghostscript version or font uses this path.

The gate measures **bytes**, not an abstract count of Unicode characters. The three measured destinations contain BMP ASCII values. Other encodings, supplementary Unicode values, font types and glyph names remain untested; do not promote this audit into a general “one character works, two fail” rule.

## Pinned source route

Repository: ArtifexSoftware/ghostpdl, tag `ghostpdl-10.08.0`, commit `05631c2cba4e578fdd6bd25cae6f0939436de848`. The tag target was verified with `git ls-remote`; the GitHub commit endpoint resolved the same commit. Relevant files were fetched read-only and hashed. No upstream code is vendored or executed.

1. [pdf/pdf_font3.c, lines 140–157](https://github.com/ArtifexSoftware/ghostpdl/blob/05631c2cba4e578fdd6bd25cae6f0939436de848/pdf/pdf_font3.c#L140-L157): Type 3 font setup assigns `pdfi_decode_glyph` as its decoder.
2. [pdf/pdf_font.c, lines 2036–2245](https://github.com/ArtifexSoftware/ghostpdl/blob/05631c2cba4e578fdd6bd25cae6f0939436de848/pdf/pdf_font.c#L2036-L2245): the reader looks up the input ToUnicode data; its byte-copy cases cap this route at four bytes; the simple-font decoder invokes that lookup. The branch returns its copied byte length.
3. [devices/vector/gdevpdte.c, lines 319–443](https://github.com/ArtifexSoftware/ghostpdl/blob/05631c2cba4e578fdd6bd25cae6f0939436de848/devices/vector/gdevpdte.c#L319-L443): `pdf_add_ToUnicode` requests decoder data, allocates a CMap and conditionally inserts the entry. Lines 434–439 contain the simple-font/Encoding byte-length gate. Nearby comments describe deliberate omission of multi-value entries and cite existing upstream issue numbers; those comments are source rationale, not newly verified issue outcomes.
4. [devices/vector/gdevpdtw.c, lines 580–634](https://github.com/ArtifexSoftware/ghostpdl/blob/05631c2cba4e578fdd6bd25cae6f0939436de848/devices/vector/gdevpdtw.c#L580-L634): an available CMap resource can be allocated and attached to the output font. That is consistent with an output ToUnicode key whose CMap has no actual entries.

This explains the existing results at the source-policy level. It does not establish the source branch taken by the installed binary at runtime, the reason for every color-sample difference, or a whole-file validity verdict. No repair or patch to Ghostscript was attempted.

## What the PDF reference permits

The [Adobe PDF 1.4 Reference, §5.9, printed pages 369–371](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.4.pdf#page=389) describes ToUnicode mappings from one character code to a sequence of Unicode values and requires a one-byte codespace for simple fonts. This is relevant to the specimens' `%PDF-1.4` header and `<00> <FF>` codespace: multi-value destinations are part of the format's documented mechanism. It is not a full conformance review or a requirement that an arbitrary conversion preserve every source feature.

The [PDF Association's PDF 2.0 errata, §9.10.3](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html#h-9.10.3) supplies additional ToUnicode context, but is not substituted for the older reference as the specimens' version basis.

## Reproduce the audit without rerendering

Download only the pinned files into a scratch directory; this is source reading, not model/API access or source execution:

```sh
audit_source_dir=$(mktemp -d)
for relative in pdf/pdf_font3.c pdf/pdf_font.c \
  devices/vector/gdevpdte.c devices/vector/gdevpdtw.c; do
  curl -fsSL --max-time 15 \
    "https://raw.githubusercontent.com/ArtifexSoftware/ghostpdl/05631c2cba4e578fdd6bd25cae6f0939436de848/$relative" \
    -o "$audit_source_dir/${relative##*/}"
done
python3 audit-mapping.py --source-dir "$audit_source_dir"
```

The audit itself is offline and standard-library-only. It verifies the four pinned source hashes, the existing six artifact hashes and their measurement basis. It compares the limited static byte-path prediction with the already recorded output CMap entry counts. It does not compile or run upstream code, call Ghostscript, regenerate PDFs or re-extract text.

[Audit evidence](evidence/mapping-source-audit.json) contains exact source hashes, line references, input/deduced byte lengths, observed entry counts, installed-binary hash and confidence limits. Its input measurement SHA-256 binds it to [the minimized run](evidence/mapping-minimal.json). The notebook drawer now shows these static-inference values for the selected A/Z/SEA case and links directly to the pinned source.

The focused `node test-poems-browser.js --minimal` check now verifies that the source-audit values follow the selected map, that all four pinned source links are present, and that prior artifact controls, keyboard selection and desktop/mobile layout still work. It still does not qualify native PDF viewer copy/paste. This is assistant self-verification, not independent review or human acceptance.

The original artwork, minimized measurements and all 37 existing PDFs remain unchanged. The bounded source audit is complete; no further variant matrix is justified by this increment alone.

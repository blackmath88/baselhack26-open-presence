# Foundations, security reading and corrections

31 October 2026 · Perplexity, assistant · Source leads and qualifications. No historical exploit was executed here.

## Representation and trust research

- [Well-Tagged PDF 1.0](https://pdfa.org/wp-content/uploads/2024/02/Well-Tagged-PDF-WTPDF-1.0.pdf): logical structure, extraction and accessibility expectations. Legitimate alternate representations are not automatically deception.
- [ActualText/Alt discussion](https://github.com/pdf-association/pdf-issues/issues/60): replacement text and alternative description must not be conflated.
- [PDF Mirage, USENIX Security 2017](https://www.usenix.org/conference/usenixsecurity17/technical-sessions/presentation/markwood): source-reported mismatch between glyph appearance and extracted information. Historical service outcomes are not current guarantees.
- [Subverting Automatic Paper-Reviewer Assignment, USENIX Security 2023](https://www.usenix.org/system/files/usenixsecurity23-eisenhofer.pdf): relevant primary work on manipulated document representations.
- [PhantomLint v1, 25 August 2025](https://arxiv.org/html/2508.17884v1): hidden-prompt detection and extract/OCR comparison. Inspect exact methods and tested pipelines before asserting a specific hidden-layer outcome.
- [Story Beyond the Eye, 2022 preprint / PETS 2023](https://arxiv.org/abs/2206.02285), [artifact](https://github.com/maxwell-bland/deredaction): residual layout inference after redaction, distinct from directly retained text recovery.
- [Files inside PDF](https://pdfa.org/files-inside-pdf/), [forensic-analysis challenges](https://pdfa.org/challenges-in-the-forensic-analysis-of-pdf-files/), [incremental-save discussion](https://pdfa.org/presentation/in-defense-of-the-incremental-save/): attachments, revisions and forensic limits.
- [Kriesel's Xerox scan investigation](https://www.dkriesel.com/en/blog/2013/0802_xerox-workcentres_are_switching_written_numbers_when_scanning): historical digit substitutions in a scanning/compression pipeline. Do not promise a harmless reproduction will yield the same result without implementing and testing an encoder.

## Instrument shelf

| Instrument | Role | Correlation / limit |
|---|---|---|
| [qpdf](https://qpdf.readthedocs.io/en/stable/overview.html), [pikepdf](https://github.com/pikepdf/pikepdf) | Structure, decoding access, rewriting | Same underlying qpdf family; not two independent parsers. qpdf is not a renderer or general text extractor. |
| [Poppler](https://poppler.freedesktop.org/) | Rendering/extraction and CLI instruments | Record mode/options and build. |
| [MuPDF](https://mupdf.com/), [PyMuPDF](https://github.com/pymupdf/PyMuPDF) | Rendering, extraction, edits | Same engine family; AGPL/commercial licensing requires distribution review. |
| [PDF.js](https://github.com/mozilla/pdf.js), [PDFium](https://pdfium.googlesource.com/pdfium/) | Inspectable browser/native engines | Host integration and build flags matter. Wrappers do not add independence. |
| [PDFBox](https://pdfbox.apache.org/), [pdfminer.six](https://github.com/pdfminer/pdfminer.six) | Additional extraction implementations | Extraction is not appearance validation. |
| [veraPDF](https://github.com/veraPDF/veraPDF-library), [Arlington model](https://github.com/pdf-association/arlington-pdf-model) | Profile conformance and spec-derived structure | Not truth/security proof. Inspect exact backend and validation scope. |
| [pyHanko](https://github.com/MatthiasValvekens/pyHanko) | Signature creation/validation | Trust store, timestamps, revision coverage and permissions need explicit configuration. |
| [Didier Stevens PDF tools](https://blog.didierstevens.com/programs/pdf-tools/) | Triage and object inspection | PDFiD is keyword-oriented triage, not complete semantic parsing. Check per-tool terms. |

Full current licences, transitive dependencies and releases were not audited in this archive. Earlier chat latest-version claims are not a lockfile. Existing RESEARCH-REVIEW-2026-10-31.md records checked corrections, including qpdf licensing.

## Incident Atlas: read and explain, do not auto-execute

- [Mozilla CVE-2024-4367 advisory](https://www.mozilla.org/en-US/security/advisories/mfsa2024-21/), [ESR advisory](https://www.mozilla.org/en-US/security/advisories/mfsa2024-22/): font-handling type-check failure enabling JavaScript in PDF.js context; fixed in Firefox 126 / ESR 115.11 in May 2024. Not automatically native execution or sandbox escape. These are historical fixing releases, not installation recommendations.
- [Project Zero FORCEDENTRY analysis, December 2021](https://googleprojectzero.blogspot.com/2021/12/a-deep-dive-into-nso-zero-click.html), [Apple fix](https://support.apple.com/en-us/103150): CVE-2021-30860 and the JBIG2 weird-machine story. A vulnerability supplied capabilities not available to a correctly bounded decoder. Safe counterpart: build our own bitmap logic simulator, not exploit-oriented codec inputs.
- [Shadow attacks](https://pdf-insecurity.org/signature/shadow-attacks.html), [paper](https://pdf-insecurity.org/download/Shadow_Attacks__Hiding_and_Replacing_Content_in_Signed_PDFs.pdf): signed-byte integrity and displayed meaning can diverge; historical viewer evaluation, not a crypto forgery or current universal vulnerability.
- [Certification attacks](https://pdf-insecurity.org/signature/certification.html), [paper](https://pdf-insecurity.org/download/pdf-certification/paper.pdf): Evil Annotation and Sneaky Signature; permitted changes can mislead visual interpretation.
- [PDFex, CCS 2019](https://www.pdf-insecurity.org/download/paper-pdf_encryption-ccs2019.pdf), [overview](https://www.pdf-insecurity.org/encryption/encryption.html): particular attacker/decryption scenario and absent integrity protection; not universal password recovery.
- [Adobe Acrobat/Reader bulletin index](https://helpx.adobe.com/security/products/acrobat.html): living remediation source rather than a home-grown safe/unsafe label.

Each atlas card should record date, exact affected/fixed versions, prerequisites, demonstrated impact, boundary, source, safe analogy and current unknowns. Historical exploit attachments are external reading material, not one-click runner inputs. No hidden tracking, real-data exfiltration, sandbox escape or testing third-party targets belongs in default experiments. If a new real issue emerges, stop casual publication and use coordinated disclosure.

## Corrections preserved from the conversation

1. No justified novelty claim for the evidence model. Usefulness does not require being first.
2. OCR is not ground truth, and LLM PDF ingestion is not universally screenshot/OCR. See the provider-specific discussion.
3. Direct extraction is not full source decompilation. Speed needs a benchmark.
4. Full rewrite does not necessarily sanitize; cleanup and reachable/residual objects matter.
5. Revision recovery must follow structure, not blind %%EOF splitting.
6. Overlay content may remain while some extractors suppress it; not leaks in every extractor.
7. A game working in a viewer proves only the paths exercised, not all JavaScript or form features.
8. The same engine in different wrappers is correlated; distinct engines can share libraries.
9. Hash identity concerns bytes under the chosen algorithm. Weak-hash collisions are a separate case; use SHA-256 for specimen identity. A hash proves neither truth nor equivalent interpretation.
10. Signatures do not establish factual truth. Certificate trust, signed revision and subsequent permitted changes must remain separate.
11. A screenshot does not reveal embedded text, object history, interaction or service state. Model answers do not identify an undisclosed ingestion pipeline.
12. Existing Cabinet 003 implementation and measurements supersede early documentation-only status claims. We did not independently rerun that cabinet.
13. Some earlier replies were truncated and some source claims were too confident. Type 4 iteration, exact hidden-OCG ingestion behaviour, scanner-reproduction outcomes and build compatibility remain verification tasks unless local evidence establishes them.

## Ten difficult questions to retain

- Is the audience a maker, educator, reverser or agent-workflow builder? Provisional: curious technical makers; do not let a scanner UI set the brief.
- Must we discover a vulnerability? No: explanatory specimens and negative reproductions have value.
- Is Acrobat the oracle? No: compare implementation, specification and declared purpose.
- Is every mismatch bad? No: accessibility, search and display have different legitimate needs.
- Can removal be proved by one extractor? No: state test scope and residual uncertainty.
- Can a valid signature bless the current appearance? Not without revision/permission interpretation.
- Can agent answers reveal preprocessing? Not reliably; use controlled representations and provider documentation.
- Can a downloaded PDF reproduce a cloud review? Unknown until the route and external state are tested.
- Should custom readers count as ordinary PDF support? No: name the extra interpreter and fallback.
- Should XL LAB and PDF LAB share a framework now? Defer until actual duplicated requirements justify it.

## Next investigations, proposed

Pin source commits and tool builds; audit fixture/asset licences; inspect PDFium templates and PDF.js layer traces; define transition records; qualify actual viewers; compare file annotations with cloud comments; distinguish transient OCR from saved text; and preserve uncertainty for hosted agents. Do not expand every lead into a dependency before one complete inward trace and one outward journey work.

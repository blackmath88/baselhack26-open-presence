# Claim ledger and verification queue

31 October 2026 · All external historical claims below are **unverified in this repository pass**.

The imported report is research input, not a verified source ledger. Its inline numbers and annotated bibliography disagree in places; several references have an empty citation ID such as `[, pp. 19–20]`. Do not infer correctness by proximity. Reconcile against the full “Quellen” URL list and original documents. Retain stable IDs below in future sources.json.

| ID | Claim or question | Candidate original source | Production treatment |
| --- | --- | --- | --- |
| C01 | Native-file exchange can depend on application/version/fonts and alter layout. | [Camelot](https://pdfa.org/wp-content/uploads/2020/07/warnock_camelot.pdf); [Warnock/Wulff interview](https://knowledge.wharton.upenn.edu/article/adobe-acrobat-at-20-successes-second-guesses-and-a-few-miscues/) | Verify passage; label the manual example illustrative. Do not universalise. |
| C02 | PDF uses a page representation with text, vectors, images and font resources, rather than merely a screenshot. | [Adobe PDF Reference 1.3](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf) | Identify version-specific sections; seek original 1.0 reference for launch claims. |
| C03 | Font embedding can reduce recipient font dependencies, but is conditional. | Same reference, §5.8; [LoC PDF/A-1](https://www.loc.gov/preservation/digital/formats/fdd/fdd000125.shtml) | Do not use PDF/A constraints as claims about ordinary early PDF. |
| C04 | PDF's document/page organisation differs from executing a PostScript program. | Same reference, pp. 19–20 and §3.4/3.6; Camelot | Distinguish proposal from shipped format and random access from network loading. |
| C05 | Camelot memo chronology and Acrobat launch date. | Camelot; [specification archive](https://pdfa.org/resource/pdf-specification-archive/); contemporary announcement still needed | Check 1990 origins versus 1991 memo; verify claimed 15 June 1993 launch. |
| C06 | Reader initially cost money and became free in 1994. | Warnock/Wulff retrospective interview; original Acrobat 2.0 announcement still needed | Verify exact event/date. Omit price rather than conflating remembered range with launch price. |
| C07 | Contemporary Exchange/Distiller pricing and competing free viewers. | [Macworld January 1994 OCR](https://archive.org/stream/MacWorld_9401_January_1994/MacWorld_9401_January_1994_djvu.txt), pp. 102–107 | Inspect scan, not only OCR; date/currency and product must accompany each amount. |
| C08 | FPL printing-cost reduction of 94%, to US$3,000/year. | [Adobe FY1995 annual report](https://archive.computerhistory.org/resources/access/text/2017/01/102770160-05-01-acc.pdf) | Locate page/baseline; attribute explicitly to Adobe's customer case. No independently audited ROI claim. |
| C09 | Tandem savings over US$1m in 1995. | Same FY1995 report | Confirm period, workflow and scope; retain vendor attribution or omit. |
| C10 | Cisco US$50m/year publishing savings. | [Adobe FY1997 annual report](https://www.adobe.com/aboutadobe/invrelations/pdfs/97annrep.pdf), reported p. 14 | Broader PDF/HTML/PostScript web/CD-ROM workflow; never label PDF-only savings. |
| C11 | Reader adoption figures: 6–10m users, 20m copies, over 100m copies. | FY1995/FY1997 reports; PDF Reference preface | Different denominators; no fabricated active-user time series. Optional detail. |
| C12 | Free receiving increased value of creation/workflow tools. | Product strategy/accounts above; product-specific financial records if available | Mark economic mechanism/network effects as interpretation. Adobe total revenue is not Acrobat revenue. |
| C13 | Later standardisation and specialised profiles differ from publication of the format. | [LoC PDF/X](https://www.loc.gov/preservation/digital/formats/fdd/fdd000124.shtml); LoC PDF/A-1; [ISO 32000-2](https://www.iso.org/standard/75839.html) | Verify ISO 32000-1 transition separately; distinguish published spec, royalty-free permissions, ISO and open source. |
| C14 | Visual fidelity does not guarantee reading order, structure or accessibility. | [W3C PDF3](https://www.w3.org/TR/2012/NOTE-WCAG20-TECHS-20120103/PDF3.html); technical reference | Example is explanatory, not a complete assistive-technology test. |
| C15 | Form, signatures, tagging and compression features appeared over time. | Technical reference version notes; [LoC early PDF](https://www.loc.gov/preservation/digital/formats/fdd/fdd000316.shtml) | Omit feature chronology unless needed and verified. Never put later features in 1993. |
| C16 | ATProto portability/signing does not establish truth, completeness or continued source availability. | [Overview](https://atproto.com/guides/overview), [repositories](https://atproto.com/specs/repository), [blobs](https://atproto.com/specs/blob) | Recheck living docs at implementation; distinguish protocol mechanics from hypothetical pilot capability. |

## Editorial claims, not historical findings

- E01: Follow one service manual to make dependency changes perceptible.
- E02: Give business value a complete act.
- E03: “The page arrived intact. What should arrive with an answer?” is proposed closing copy.
- E04: Context record fields and benefits are project hypotheses, not shipped or proven behaviour.
- E05: 1998 desktop chrome is one possible visual shell, not a historical reconstruction.

## Verification record template

For each claim record status (unverified / verified / qualified / omitted), exact supported wording, source URL and edition/date, page/section, short paraphrase, limitations, access date and intended scene. Keep publication date distinct from event date. Quotes require checking the original page and respecting reuse rights.

## What can proceed now

The semantic skeleton, labelled synthetic manual and comparable visual studies can proceed. Do not put unresolved numbers or dates into hero copy, animated counters, pricing cards or source-backed captions.

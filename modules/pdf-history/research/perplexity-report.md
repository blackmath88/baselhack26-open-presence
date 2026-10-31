> Imported research input · supplied 31 October 2026. The report below is preserved as supplied after extraction from the upload's tool-output wrapper. Historical sources have not been independently verified in this repository pass. Citation IDs are incomplete/inconsistent; see [CLAIMS.md](CLAIMS.md). Statements about source inspection below are part of the supplied report, not validation by this module.

---

# PDF: making the printed page travel

## 1. Answers to the core questions

PDF originally solved a problem of **dependencies**: a recipient could receive a document’s file without receiving the application, version, fonts and output environment needed to reproduce it. Paper preserved the appearance but required physical distribution; native files preserved editability but could depend on the recipient’s software. PDF offered a portable representation of the already-composed page.[1][2]

Its technical breakthrough was not simply “taking a picture.” PDF combined positioned text, font information, vector graphics and raster images, using PostScript’s imaging model inside a document structure designed for interactive viewing. A reader could render the result without running the original authoring application. Font embedding could remove an important dependency; page organisation and cross-reference information enabled navigation without executing an entire print program.[3]

For users, that meant fewer compatibility negotiations and more reliable viewing and printing. For organisations, it enabled a shift from printing and distributing copies to distributing files and printing selectively. Adobe captured value through paid creation, conversion and workflow products, while free Reader distribution increased the audience those products could reach. Contemporary Adobe reports document both adoption and customer savings, although their promotional case studies require attribution rather than treatment as independently audited results.[4][5]

Adoption was neither immediate nor inevitable. Charging recipients, competing formats, installation friction, limited hardware and an unclear distinction between “a document to edit” and “a document to distribute” impeded it. Free Reader in 1994, web distribution, institutional workflows, publishing integration and eventually standards-based interoperability reinforced one another. The strongest historical lesson is that a portable object needs an affordable, widely available receiving environment—not merely an elegant specification.[2][6][7]

For Open Presence, the analogy is useful but bounded: PDF made a chosen representation travel more reliably. It did not establish that representation’s truth, authorship, completeness or surrounding conversation. A portable contribution record would need to choose different invariants—and demonstrate that recipients actually inspect them.

## 2. Before PDF: the file arrived, but the document did not necessarily follow

### Three different things travelled

By the late 1980s and early 1990s, an editable source document, its printed output and its distributable electronic representation were distinct objects.

A native file could contain instructions such as “set this paragraph in this font within these margins.” Opening it elsewhere could require compatible software and fonts. Substitution could change character widths, line endings and pagination. A file that opened successfully was not necessarily a file that reproduced the sender’s pages. Wharton’s historical introduction explicitly describes same-application/version requirements, font changes, reflow and repagination.[2]

Print output was different: the authoring program had already decided where marks belonged. Warnock’s Camelot paper identified the gap precisely: applications could print to many printers, yet there was no universal electronic equivalent for communicating and viewing that printed information.[1]

The past was not universally broken. Shared software environments worked; plain text travelled effectively when typography did not matter; PostScript already supported professional printing. Camelot itself acknowledged working network distribution of PostScript and successful Display PostScript environments. Its complaint was that these solutions did not serve the broad installed base economically or conveniently.[1]

### The work behind “send me a copy”

Paper and fax bypassed application incompatibility by transmitting the finished appearance. But paper introduced printing, collation, binding, mailing and inventory; fax produced remote paper with quality and communications disadvantages that Camelot explicitly criticised.[1][4]

Floppy disks, CD-ROMs and networks transported bytes; they did not automatically transport the software dependencies needed to interpret them. This distinction matters more than a nostalgic inventory of media. Camelot envisaged both network delivery and CD-ROM publications, including manuals, maps and reference works. It explicitly targeted modest existing machines, including 640K PC configurations and CGA/EGA/VGA displays—not just powerful workstations.[1]

Storage and bandwidth constrained the solution. Full-page bitmaps could reproduce appearance, but high-resolution images were bulky and resolution-bound. Describing text and shapes economically, then rasterising them at the destination, avoided making every page a large photograph. Compression helped, but early PDF did not compress everything; Acrobat engineering leader Bob Wulff later identified that as a missed opportunity. [, pp. 8–9][2]

### Documented workflows

Three cases provide a firmer foundation than a fictional “everything broke” office:

- Florida Power & Light: Adobe’s 1995 report describes a 1991 baseline of 8,000 procedures, approximately 30,000 pages, maintained across 52 books and 101 volumes. After electronic delivery with Acrobat, Adobe reported a 94% reduction in printing costs, to US$3,000 annually. This is a contemporary vendor-reported customer outcome, not an independently verified calculation.[4]
- First Call: the same report describes financial research moving from paper reports into searchable, viewable PDFs on its RESEARCH DIRECT service. Appearance reassured an audience accustomed to printed reports while electronic delivery improved access.[4]
- Cisco: Adobe’s 1997 report describes FrameMaker source material producing PDF, HTML and PostScript. Cisco attributed US$50 million annually in printing and reproduction savings to its broader web/CD-ROM publishing operation. That figure must not be labelled “PDF savings”: the documented system deliberately used several formats. [, p. 14]

### What the alternatives did well

| Alternative | Strength | Gap PDF addressed |
|---|---|---|
| Native application files | Editing and application-specific behaviour | Recipients needed compatible applications, versions and resources. [2] |
| Plain text / RTF | Text interchange; RTF retained more formatting than plain text | Interchange was not the same as preserving an already-composed page. The contemporary review distinguishes text-oriented exchange from portable page systems. [6] |
| PostScript | Rich, device-independent print descriptions; established output pipeline | General-purpose execution and state complicated predictable interactive viewing and arbitrary page access. [1][, pp. 19–20] |
| Images and scans | Captured appearance, including existing paper | Resolution, size and absent machine-readable text; OCR was an additional process. [, pp. 8–9, xv–xvi] |
| Common Ground, Replica, Envoy | Competing portable-document approaches, including free viewers | PDF faced a market, not an empty category. Free competitors pressured Adobe’s reader strategy. [2][6] |
| DynaText / structured publishing | Navigable electronic publications | A different authoring and publication proposition from capturing arbitrary application output. [6] |
| Early HTML | Linked, network-native information | Not a faithful replacement for an existing print layout; often complementary rather than inferior. Cisco’s parallel outputs demonstrate the distinction. [2][, p. 14] |

## 3. Invention: moving the computation to the sending end

### Camelot was a proposal, not the finished specification

Warnock’s 1991 Camelot paper proposed “Interchange PostScript,” or IPS: process application-generated PostScript into a simpler representation, include necessary font characters, and supply viewers for ordinary machines. Its examples included electronic mail, centrally maintained document collections, CD-ROM manuals and selective local printing. Its prediction of millions saved in inventory costs was an ambition, not a measured outcome.[1]

The chronology starts earlier than that memo: Wulff’s 2013 recollection dates an initial prototype to June 1990 and a Windows demonstration for IBM to August 1990. Acrobat’s commercial launch followed on 15 June 1993. These are different milestones, not contradictory invention dates.[2]

Camelot’s proposed IPS would be valid PostScript/EPS. Final PDF should not therefore be described as merely renamed PostScript: it retained the imaging model but introduced its own object and document organisation. [, pp. 19–20][1]

### Mechanism → visible consequence → limitation

1. Fixed page description.  
   The authoring system settles layout before distribution; the recipient renders positioned marks instead of repaginating the source. This preserves page references, diagrams and form geometry. It also makes adaptation to a narrow screen harder. [, pp. 7–9]

2. Fonts and font embedding.  
   Carrying font programs or subsets reduces dependence on the recipient’s font collection. But embedding is conditional on supported font technology, authoring settings and licensing permissions. PDF can contain unembedded fonts; a `.pdf` extension is not proof of self-containment. [, §5.8, pp. 339–342][8]

3. Mixed representations.  
   Text can remain text, diagrams can remain vectors and photographs can remain images. The result can scale and search better than a page-sized screenshot. However, a scan-only PDF still lacks usable text unless OCR supplies it, and visible glyphs do not by themselves guarantee correct extraction or semantics. [, pp. 8–9, xv–xvi; §5.9]

4. Independent reader.  
   The recipient needs a PDF implementation rather than the originating word processor or layout program. This removes one dependency while introducing another: the reader must be installed, capable and compatible with the file’s features. [, pp. 1–3][2]

5. Page/object access.  
   A page tree and cross-reference information let software locate relevant objects instead of executing preceding pages as a print-oriented program might require. This is not the same as instant network loading: later linearisation addressed efficient delivery over networks. [, §3.4, §3.6; Appendix F, pp. 565–595]

6. Compression.  
   Different filters suit text/graphics, monochrome images and photographs. Compression improves distribution economics but cannot make all document types equally small; photographic scans and embedded resources still cost bytes. Flate compression, for example, belongs to PDF 1.2, not the original launch. [, §2.2.2, §3.3]

PDF is the format. Acrobat Exchange, PDFWriter and Distiller were tools for creating or manipulating it; Reader was a consumption product. Other implementations were possible because Adobe published the format. Later standards and product features must not be folded into “PDF in 1993.” [, pp. 1, 5–6, 17–20]

## 4. A dated timeline

| Date | Event and significance |
|---|---|
| 1984–1985 | Warnock retrospectively links a slow PostScript tax-form demonstration to Graph Bind, which precomputed program operations. This is an origin recollection, not contemporaneous performance documentation. [2] |
| June–August 1990 | Prototype and IBM demonstration, according to Wulff’s later account. [2] |
| 1991 | Camelot paper sets out the capture/send/view/print ambition and its proposed technical approach. [1][2] |
| 15 June 1993 | Acrobat suite and PDF launch; PDF 1.0 reference published in June. [2][9] |
| January 1994 | Macworld compares competing document-exchange products: evidence of a contested category and task-specific tradeoffs. [, pp. 102–107] |
| Autumn 1994 | Reader becomes free with Acrobat 2.0. Do not confuse this product event with the later publication date of the revised reference. [2][9] |
| 1995 | Adobe reports 6–10 million Reader users and distribution through bundling and the Internet; Acrobat 2.1 targets web/multimedia use. [4] |
| 1996–1997 | Acrobat 3.0/PDF 1.2 generation; Adobe reports more than 20 million Reader copies distributed in 1997. [9][5] |
| 1999–2001 | PDF/X moves from an initial national standard to ISO profiles for dependable prepress exchange. [10] |
| 2000–2001 | PDF 1.3 reference documents logical structure and digital signatures; PDF 1.4/Acrobat 5 era extends the structure/accessibility trajectory. These are not 1993 guarantees. [, pp. 3–4][11] |
| 2005 | PDF/A-1 published for constrained long-term preservation. [8] |
| 2008 | ISO 32000-1 standardises PDF 1.7 under ISO governance. [7] |
| 2017 / 2020 | PDF 2.0 and its subsequent revised ISO edition. [12][13] |

Interactive forms are likewise later than launch: the PDF 1.3 reference documents them, while its version annotations distinguish earlier introductions. Digital signature fields are explicitly listed among PDF 1.3 additions. Neither a signature field nor password permissions makes arbitrary PDF content true or tamper-proof. [, pp. 3–4, §7.6]

## 5. Pain → mechanism → workflow → value

| Pain | Technical mechanism | Workflow change | Beneficiary | Economic value | Evidence |
|---|---|---|---|---|---|
| Recipient lacks source application | Common page representation and reader | Distribute output without distributing authoring software | Recipients; IT teams | Reduced compatibility coordination; not quantified here | Technical reference; oral history. [3][2] |
| Missing fonts change appearance | Positioned text; embedded font resources where permitted | Review/print a composed page | Authors; publishers | Fewer reproduction surprises; conditional, not universal | Font specification and archival constraints. [, §5.8][8] |
| Repeated manual printing/distribution | Electronic files plus local rendering | Maintain centrally; distribute electronically | FPL; procedure users | Adobe reported 94% lower printing costs, to US$3,000/year | FY1995 customer vignette; vendor-reported. [4] |
| Shipping sales collateral worldwide | PDF collections on CD-ROM | Distribute a searchable electronic collection | Tandem sales organisation | Adobe reported over US$1 million hard-cost savings in 1995 | FY1995 report; vendor-reported. [4] |
| Large technical documentation sets | Single-source outputs to several formats | Publish online/CD-ROM; print selectively | Cisco and customers | US$50 million/year claimed for the broader operation—not PDF alone | FY1997 report, p. 14. [5] |
| Paying just to read creates friction | Free Reader | Sender can address a larger audience | Recipients; Adobe’s paid-tool customers | Audience expansion; causal interpretation | Free-reader decision and subsequent distribution figures. [2][4] |
| Printer receives incomplete production assets | PDF/X constraints and validation | Exchange production-ready files | Printers; publishers | Lower uncertainty and rework; no ROI asserted | Library of Congress PDF/X account. [10] |
| Future rendering depends on missing resources | PDF/A constraints | Create and validate archival derivatives | Archives; records managers | Better preservation readiness, not guaranteed permanence | Library of Congress PDF/A account. [8] |

## 6. Adoption and the business model

### The difficult beginning

Contemporary Macworld coverage lists Acrobat Exchange at US$195 and Distiller at US$695, with a US$2,495 network Distiller option. Its January 1994 issue is strong evidence for early market pricing, but not a substitute for the exact launch price sheet. Wharton’s later interview places Reader at US$35–50 per seat before the free-reader decision. These are US-dollar nominal prices, not inflation-adjusted comparisons.[2][6]

The initial proposition asked recipients to acquire software for files they might rarely receive. Installation and rendering added friction on constrained machines; bigger files also challenged electronic distribution. Adobe’s own engineering history acknowledges both early compression shortcomings and the commercial problem. Warnock recalled approximately four years of losses; Wulff remembered engineering support feeling less secure around 1996. These are retrospective testimony, not audited product-level profit disclosures.[1][2]

Resistance was sometimes rational. A spreadsheet recipient might need formulas, not a faithful picture of cells. Someone revising prose might prefer the native document. Warnock’s recollection of analysts asking why people should not send Lotus files illustrates a genuine disagreement about the job to be done.[2]

### Five turning points

The ordering below is interpretation; the underlying events are documented.

1. Existing print pipelines lowered authoring friction. PDF could capture output from applications without persuading every vendor to implement a new export format. This was a crucial supply-side advantage.[2]

2. Free Reader in 1994 lowered recipient friction. Adobe followed pressure from free competitors and browsers; it did not invent free software distribution.[2]

3. Web and browser integration made distribution habitual. Adobe’s 1995 report names integration arrangements involving Netscape, Microsoft, AT&T and Oracle, alongside free Internet availability. The web supplied a delivery channel for existing pages, not just a rival publishing format.[4]

4. Institutional and publishing workflows supplied repeat demand. Government information, financial research, manuals and prepress made reliable pages operationally valuable. PDF/X later narrowed ambiguity for production exchange rather than assuming every ordinary PDF was press-ready.[4][10]

5. Published specifications and later ISO governance broadened the ecosystem. Independent tools reduced dependence on one application; formal standards subsequently supplied governance and constrained profiles.[3][7]

### Value creation is not value capture

Individuals gained easier receiving, searching, navigating and selective printing. Organisations could shorten distribution cycles and avoid some physical production and coordination costs. Printers, software vendors, integrators and archives gained opportunities in rendering, conversion, validation, OCR, workflow and preservation. [, pp. xv–xvi][4]

Adobe monetised productive work around the file: creation, conversion, enhancement, scanning/OCR and enterprise workflows. Free consumption increased the usefulness of paid production tools. Calling this a network effect is an economic interpretation: more capable recipients made PDF more attractive to senders; more distributed PDFs made compatible readers more useful.

The figures support growth, but require careful denominators:

- FY1995: Adobe estimated 6–10 million Reader users.
- FY1997: Adobe reported more than 20 million Reader copies distributed.
- March 2000 preface: Adobe reported well over 100 million copies distributed. These are different measures, not a consistent active-user series. [, p. xv][4][5]

Adobe’s FY1995 US$762.3 million total revenue and US$578.9 million application-products revenue are not Acrobat revenue. Nor does PostScript licensing revenue measure PDF monetisation. No product-specific early revenue series has been verified for this dossier.[4]

### Four meanings of “open”

- Published specification: outsiders can inspect the representation.
- Royalty-free implementation: relevant permissions permit implementation without usage royalties.
- Open standard: governance operates through a standards process, as PDF did through ISO from 2008.
- Open-source software: implementation source code has an appropriate licence; this does not follow from any of the above. [, pp. 5–6][7]

Adobe’s reference granted implementation-related copyright permissions while retaining copyright and explicitly distinguishing patents and product software. Wulff’s “no patent encumbrances” recollection should therefore not replace examination of the actual legal notices. [, pp. 5–6][2]

## 7. The tradeoffs: what preserving the page made harder

PDF succeeded partly because it preserved decisions other systems would remake. That same choice could be awkward when users wanted different decisions.

- Reflow and small screens: shrinking a complex page preserves relationships but can make text unreadable. Reflow requires useful structure or reconstruction; it is not equivalent to zooming.[2][14]
- Accessibility: visual position is not reading order. Tags, correct sequencing, alternative descriptions and usable controls depend on authoring and implementation. W3C warns that complex layouts may require repair even after tagged conversion.[14][15]
- Extraction and semantics: coordinates can say where a number appears without saying whether it is a table heading, total or footnote. Later logical-structure facilities help when actually populated. [, §8.4.3]
- Editing and collaboration: PDF is editable, but its page-oriented representation is not necessarily the best source for substantial revision or collaborative authoring. Annotation capability does not provide a universal shared editing or version-management system. [, pp. 1, 7; §7.4]
- Context and versions: a stable-looking copy can still be obsolete or detached from its source. Basic metadata is not a complete account of authorship, disagreement or publication history; early PDF metadata was particularly limited.[9]
- Preservation: missing fonts, external dependencies, unsupported features and lost storage remain risks. PDF/A deliberately constrains ordinary PDF: embedding fonts, prohibiting encryption and executable features, and requiring metadata. A valid archival file still needs custody, backups and ongoing access.[8][16]

These are different failure classes: format design, missing file content, poor authoring and imperfect software. The story should not collapse them into “PDF is inaccessible” or “PDF preserves everything.”

## 8. Testing the bridge to Open Presence

The most defensible analogy is: “PDF made a chosen document representation portable across software environments. Could a contribution record make chosen context inspectable across platforms and AI interfaces?”

### Compare the transported objects

| Dimension | PDF history | Proposed contribution record |
|---|---|---|
| Object | Composed pages | Attributed observation plus circumstances and relationships |
| Stable property | Intended page appearance | Identity, exact claim/version, source references and declared context |
| Dependencies | Fonts, images, rendering rules | Schemas, identity resolution, source snapshots, attachments and relationship meanings |
| Inspection | View, search, print; inspect included metadata | Distinguish source evidence, author statement and later interpretation |
| Outside the object | Editorial process, truth, omitted discussion | Missing participants, deleted sources, private circumstances and community norms |
| Economic roles | Authors, recipients, publishers, tool vendors | Contributors, readers, hosts, indexers, moderators and funders |
| Adoption route | Useful exports plus ubiquitous reading | Useful imports/exports plus context displays in existing discovery workflows |

The right invariant is not “freeze the answer.” It may be “preserve what was asserted, by whom, under which stated conditions, and how this version relates to others.”

### What AT Protocol supplies—and does not

Official documentation separates the layers:

- Identity: DIDs locate account keys and the current hosting service.
- Hosting: a PDS stores and serves an account’s repository.
- Record portability: repositories can be exported as CAR files for backup, synchronisation and migration.
- Authentication: signed repository commits support verification of included records; records are not simply standalone human-signed truth certificates.
- Indexing/discovery: AppViews aggregate and interpret network data; a custom record does not automatically appear in useful search results.
- Moderation: labels and service policies are additional mechanisms, not consequences of portability.[17][18][19]

Two limitations are especially important for this project. Repository deletion need not preserve a tombstone or earlier content, and the usual repository export does not automatically include referenced blobs or other repositories’ records. A content hash identifies expected bytes; it does not keep those bytes available. Older signature verification can also require identity/key history.[18][20]

### Three lessons worth carrying forward

1. Make receiving useful before demanding participation. A context inspector should work without requiring every reader to become a contributor.
2. Capture from existing work. Preserve source URLs, revisions and circumstances during a real investigation rather than asking people to reconstruct them afterward.
3. Define a small interoperability target. A minimal, testable record profile and two independent readers would demonstrate more than a broad portability claim.

### Three breaks in the analogy

1. Appearance is easier to compare than adequate context. A page mismatch is visible; omitted disagreement may not be.
2. Conversation is multi-author and evolving. One person’s export cannot claim to preserve everyone’s experience.
3. Participation has ongoing social costs. Portability does not fund moderation, reward follow-ups or create community commitment.

### Questions to test

- Do contextual records improve applicability judgments in the photo-frame pilot?
- Can two readers distinguish original contributions from AI-proposed connections?
- What survives deletion, host failure, migration and broken source links?
- Who pays for retention, indexing and moderation?
- Will contributors add useful corrections without polishing them into essays?

The pilot should prove those behaviours before claiming that ATProto solves preservation or discovery.

## 9. Scrollytelling handoff

Use one recognisable illustrated service manual throughout. Clearly label it as a composite, not an actual FPL document. Real workflows appear in adjacent evidence cards.

| Scene | Question and factual explanation | Object and scroll transformation | What it teaches; status and sources |
|---|---|---|---|
| 1. “It prints perfectly. Here.” | Why does sending the file differ from sending the page? Native output depends on its environment. | Manual moves between two document windows; a font disappears and a paragraph pushes onto another page. | Dependency failure, not universal historical chaos. Labelled illustration. [2] |
| 2. “Send the paper instead.” | What worked already? Paper/fax transmitted appearance, with production and communications costs. | File branches into paper stack, fax and disk; show tasks rather than invented stopwatch figures. | Existing solutions had strengths and costs. Illustration grounded in Camelot and workflows. [1][4] |
| 3. “The printer already understands.” | What did PostScript contribute? A shared imaging model and widespread application output. | Print dialog routes the manual into drawing instructions. | Capture existing output rather than rebuild every application. Documented mechanism. [1] |
| 4. “Do the work before sending.” | What changed? Simplify execution into page descriptions and document objects. | A loop expands into marks; page cards gain an index. | Precomputation and random access, not a screenshot. Mechanism illustration. [, pp. 19–20, §3.4] |
| 5. “Pack the missing pieces.” | Why can appearance survive? Text, vector paths, images and permitted embedded fonts travel together. | Exploded page reveals object types; font subset joins the package; an unembedded-font warning remains possible. | Conditional self-containment. Documented mechanism. [, §5.8] |
| 6. “A portable file meets a paywall.” | Why did launch not guarantee adoption? Recipients faced price, installation and competing viewers. | Early product cards interrupt the journey; Reader price becomes zero at the 1994 marker. | Receiving friction governs network value. Documented events; causal interpretation. [6][2] |
| 7. “Distribute first. Print selectively.” | Where did organisations benefit? Manuals and collateral moved to networks/CD-ROMs. | One master reaches offices; recipients print selected pages; reveal attributed FPL/Tandem figures. | Workflow inversion, not “paper disappeared.” Documented customer claims. [4] |
| 8. “One format, specialised contracts.” | Why later profiles? Print exchange and archiving need additional constraints. | Base file branches into PDF/X and PDF/A checklists, dated 2001/2005. | Later standards tighten requirements; they were not launch features. [10][8] |
| 9. “The page survived. What didn’t?” | What remains unresolved? Reading order, context and versions do not follow from visual fidelity. | Fixed page stays unchanged while reading order scrambles and source/version panels disappear. | Appearance is not meaning or provenance. Illustration grounded in limitations. [14][9] |
| 10. “When an answer travels…” | What might the project preserve? Show a testable context record, not an accomplished protocol solution. | Manual gives way to a pilot observation with author, conditions, source revision, disagreement and follow-up; distinguish hosted/indexed/available states. | A design hypothesis with explicit boundaries. Interpretation; ATProto mechanics documented. [17][18] |

### Three small experiments

1. Substitute a font: toggle predetermined glyph widths and observe changed pagination; then compare positioned PDF-style output and optional font embedding.
2. Read the same page three ways: visual layout, deliberately incorrect extraction order and correctly structured reading order. Never imply the simulation is a complete screen-reader test.
3. Remove a dependency: disable a font, source link or blob in two parallel panels. Show separately what remains renderable, verifiable, understandable and available.

Implementation brief: one offline HTML file with embedded CSS, JavaScript and SVG; system fonts; no network-dependent rendering. Keep all narrative and source notes readable without JavaScript. Provide scene anchors, real buttons, visible focus, keyboard/touch operation and a reduced-motion sequence of static before/after states. Do not hijack scrolling.

Use late-1990s/early-2000s desktop chrome as the explainer’s presentational shell, explicitly labelled—not as a reconstruction of 1991 software. Date each historical state. Avoid fake download speeds, unverified period screenshots and decorative progress bars.

Both reference repositories were accessible through authenticated GitHub reads. I inspected their root listings and READMEs, not implementation files. The brief is therefore aligned with the stated project and repository organisation without claiming an audit of their code.

## 10. Annotated bibliography and remaining gaps

The following 18 sources are the substantive research base. Dates describe publication or edition where known; event dates are distinguished above.

1. [Warnock, The Camelot Project](https://pdfa.org/wp-content/uploads/2020/07/warnock_camelot.pdf), 1991, six-page memo. Foundational problem statement and proposed mechanism; aspirations are not outcomes.[1]
2. [Adobe, PDF Reference 1.3](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf), first printing July 2000. Primary technical authority: pp. 5–20; §3.4; §5.8–5.9; §7.6; Appendix F. Its version markers prevent back-projecting features.[3]
3. [Macworld, January 1994](https://archive.org/stream/MacWorld_9401_January_1994/MacWorld_9401_January_1994_djvu.txt), Charles Seiter, “Brave New Documents,” pp. 102–107. Contemporary competing-product comparison and pricing; OCR needs visual checking before quotation.[6]
4. [Adobe Annual Report 1995](https://archive.computerhistory.org/resources/access/text/2017/01/102770160-05-01-acc.pdf). Financial totals, Reader estimate and FPL/Tandem/First Call cases. Relevant locators: stockholder letter and electronic-distribution sections; scan-page mapping remains to verify.[4]
5. [Adobe Annual Report 1997](https://www.adobe.com/aboutadobe/invrelations/pdfs/97annrep.pdf), published with January 1998 stockholder letter. Reader distribution; Bosch/NASA, p. 5; Cisco, p. 14. Promotional customer accounts must remain attributed.[5]
6. [Wharton interview with Warnock and Wulff](https://knowledge.wharton.upenn.edu/article/adobe-acrobat-at-20-successes-second-guesses-and-a-few-miscues/), 5 June 2013. Rich oral history; retrospective, interested testimony.[2]
7. [Library of Congress: PDF 1.0–1.3](https://www.loc.gov/preservation/digital/formats/fdd/fdd000316.shtml), significant update 2019. Edition chronology, disclosure and limited early metadata.[9]
8. [PDF Association specification archive](https://pdfa.org/resource/pdf-specification-archive/). Primary-document index; distinguishes reference editions from product chronology.[12]
9. [PDF Association: de facto document technology](https://pdfa.org/pdf-the-de-facto-document-technology/), 26 July 2017. Published specifications, royalty-free implementation and ISO transition; industry perspective.[7]
10. [Library of Congress: PDF/X family](https://www.loc.gov/preservation/digital/formats/fdd/fdd000124.shtml). Prepress constraints, profiles and standards chronology.[10]
11. [Library of Congress: PDF/A-1](https://www.loc.gov/preservation/digital/formats/fdd/fdd000125.shtml). 2005 publication, embedding requirements and structural limitations.[8]
12. [Library of Congress: PDF/A family](https://www.loc.gov/preservation/digital/formats/fdd/fdd000318.shtml). Broader preservation context and later variants.[16]
13. [Library of Congress: PDF 1.4](https://www.loc.gov/preservation/digital/formats/fdd/fdd000122.shtml). Separates later capabilities and standards foundations from launch.[11]
14. [W3C PDF3 technique](https://www.w3.org/TR/2012/NOTE-WCAG20-TECHS-20120103/PDF3.html), 2012 edition. Concrete reading-order, reflow and repair requirements.[14]
15. [ISO 32000-2:2020](https://www.iso.org/standard/75839.html), publication December 2020. Current-standard scope and edition identification.[13]
16. [AT Protocol overview](https://atproto.com/guides/overview). Identity, PDS, relays, AppViews and migration assumptions; living documentation.[17]
17. [AT Protocol repository specification](https://atproto.com/specs/repository). Signed commits, CAR export, deletion, missing history and external-reference limitations.[18]
18. [AT Protocol blobs](https://atproto.com/specs/blob) and [labels](https://atproto.com/specs/label). Separate asset availability from record authentication, and moderation from storage.[19][20]

### Evidence gaps to resolve before production

- Obtain and visually inspect the original 1993 reference and launch price sheet; the later reference and contemporary review support this dossier but do not replace them.
- Verify exact early system requirements, installer sizes and benchmark timings before animating numeric hardware/download comparisons.
- Inspect the 1994 review’s scanned pages and map FY1995 report passages to printed/PDF page numbers.
- Seek independent corroboration of vendor-reported savings and a reliable early Acrobat-specific revenue/profit series.
- Establish first IRS distribution and fillable-form dates from agency records; do not repeat unsupported “star customer” metrics.
- Resolve chronology carefully: Adobe retrospective pages sometimes use 1990 for Camelot’s beginnings, whereas the memo is conventionally dated 1991; reference publication dates also need not equal feature shipment dates.[2][9][21]

The implementation should retain these uncertainties in its source notes rather than smoothing them into an inevitable-success story.

Quellen
[1] [PDF] The Camelot Project - John Warnock https://pdfa.org/wp-content/uploads/2020/07/warnock_camelot.pdf
[2] Adobe Acrobat at 20: Successes, Second Guesses and a Few ... https://knowledge.wharton.upenn.edu/article/adobe-acrobat-at-20-successes-second-guesses-and-a-few-miscues/
[3] PDF Reference, Second Edition - Adobe Inc. https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf
[4] Adobe Annual Report 1995 https://archive.computerhistory.org/resources/access/text/2017/01/102770160-05-01-acc.pdf
[5] [PDF] idea - Adobe https://www.adobe.com/aboutadobe/invrelations/pdfs/97annrep.pdf
[6] Full text of "MacWorld 9401 January 1994" - Internet Archive https://archive.org/stream/MacWorld_9401_January_1994/MacWorld_9401_January_1994_djvu.txt
[7] PDF: the de facto document technology – PDF Association https://pdfa.org/pdf-the-de-facto-document-technology/
[8] PDF/A-1, PDF for Long-term Preservation, Use of PDF 1.4 https://www.loc.gov/preservation/digital/formats/fdd/fdd000125.shtml
[9] PDF_1_3, PDF Versions 1.0-1.3 https://www.loc.gov/preservation/digital/formats/fdd/fdd000316.shtml
[10] PDF/X Format Family (PDF for Prepress Graphics File ... https://www.loc.gov/preservation/digital/formats/fdd/fdd000124.shtml
[11] PDF_1_4, PDF Version 1.4 https://www.loc.gov/preservation/digital/formats/fdd/fdd000122.shtml
[12] PDF Specification Archive https://pdfa.org/resource/pdf-specification-archive/
[13] Portable document format - ISO 32000-2:2020 https://www.iso.org/standard/75839.html
[14] Ensuring correct tab and reading order in PDF documents https://www.w3.org/TR/2012/NOTE-WCAG20-TECHS-20120103/PDF3.html
[15] PDF Techniques for WCAG 2.0 https://www.w3.org/TR/WCAG20-TECHS/pdf
[16] PDF/A Family, PDF for Long-term Preservation https://www.loc.gov/preservation/digital/formats/fdd/fdd000318.shtml
[17] Protocol Overview - AT Protocol https://atproto.com/guides/overview
[18] Repository https://atproto.com/specs/repository
[19] Labels https://atproto.com/specs/label
[20] Blobs - AT Protocol https://atproto.com/specs/blob
[21] History of the PDF Timeline | Adobe Acrobat https://www.adobe.com/acrobat/resources/pdf-timeline.html
[22] Adobe Annual Report 1996 - Computer History Museum https://archive.computerhistory.org/resources/access/text/2017/01/102770161-05-01-acc.pdf
[23] Adobe annual report, 1995 - 102770160 - CHM https://www.computerhistory.org/collections/catalog/102770160
[24] Adobe Systems Incorporated annual reports - 102720940 - CHM https://www.computerhistory.org/collections/catalog/102720940
[25] History of PDF - Wikipedia https://en.wikipedia.org/wiki/History_of_PDF
[26] A Brief History of PDF - by Libo - Building Probable https://buildingprobable.substack.com/p/a-brief-history-of-pdf
[27] Adobe Annual Report 1995 - DocsLib https://docslib.org/doc/9242646/adobe-annual-report-1995
[28] ADOBE INC. 1995 filings — annual reports & disclosures ... https://financialfilings.com/companies/adobe-inc/1995/
[29] PDF: From Cold War Weapon to Industry Standard https://www.welcometothejungle.com/en/articles/btc-pdf-industry-standard
[30] The History of the PDF (1991–2026): Camelot, Acrobat, ISO ... https://pdfnoob.com/pdf/history
[31] Publishing lessons from the long history of the PDF - BookMachine https://bookmachine.org/2023/01/30/publishing-lessons-from-the-pdf/
[32] Alternatives to Adobe Acrobat PDF programs - Plaintiff Magazine https://plaintiffmagazine.com/recent-issues/item/alternatives-to-adobe-acrobat-pdf-programs
[33] PDF Reference 1.0 | PDF | Digital Technology | Graphic Design https://www.scribd.com/document/383404197/PDF-Reference-1-0
[34] Adobe Acrobat vs ComPDF Comparison - Capterra UK 2026 https://www.capterra.co.uk/compare/1012240/1033541/adobe-acrobat-dc/vs/compdfkit
[35] Images and Video - AT Protocol https://atproto.com/guides/images-and-video
[36] Blob Lifecycle - AT Protocol https://atproto.com/guides/blob-lifecycle
[37] Reads and Writes - AT Protocol https://atproto.com/guides/reads-and-writes
[38] OAuth Patterns - AT Protocol https://atproto.com/guides/oauth-patterns
[39] Identity - AT Protocol https://atproto.com/guides/identity
[40] Adobe PDF Reference Archives - eastmoaa.org https://eastmoaa.org/wp-content/uploads/pdf_reference_archive.html
[41] [PDF] Great software: Adobe Acrobat | Edisco https://www.edisco.it/images-and-messages-3/wp-content/uploads/sites/125/2026/04/Great-software-Adobe-Acrobat.pdf
[42] OUR DOCUMENTS RESEARCH RESOURCES . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . https://ground.news/article/our-documents-research-resources
[43] ISO 32000-2:2020(en), Document management https://www.iso.org/obp/ui/
[44] Formats, Evaluation Factors, and Relationships https://www.loc.gov/preservation/digital/formats/intro/format_eval_rel.shtml
[45] PDF/A-4, PDF for Long-term Preservation, Use of ISO ... https://www.loc.gov/preservation/digital/formats/fdd/fdd000532.shtml
[46] Descriptive Cataloging Manual 2025 Update 2 https://www.loc.gov/aba/publications/FreeDCM/DCM_2025-02.pdf
[47] Full text of "MacWorld 9304 April 1993" - Internet Archive https://archive.org/stream/MacWorld_9304_April_1993/MacWorld_9304_April_1993_djvu.txt
[48] Full text of "MacWorld 9303 March 1993" - Internet Archive https://archive.org/stream/MacWorld_9303_March_1993/MacWorld_9303_March_1993_djvu.txt
[49] MacWorld 9103 March 1993 : Free Download, Borrow, and Streaming https://archive.org/details/MacWorld_9103_March_1993
[50] Full text of "Macworld" - Internet Archive https://archive.org/stream/macworld00unse_64/macworld00unse_64_djvu.txt
[51] Adobe Acrobat 5.x - WinWorld https://winworldpc.com/product/adobe-acrobat/5x?WqeKA=GJR5T
[52] Wer sind wir https://www.ilef.ch/amtlichepublikationen/3034114
[53] The Evolution of PDF Standards: Accessibility, Security, and ... https://pdfa.org/the-evolution-of-pdf-standards-accessibility-security-and-compliance/
[54] Milestones in the History of PDF https://pdfa.org/download-area/publications/PDF-Timeline-Poster.pdf
[55] PDF versions – PDF Association https://pdfa.org/pdf-versions/
[56] ADBE 10K FY11- FINAL https://www.adobe.com/content/dam/cc/en/investor-relations/pdfs/ADBE-10K-FY11-FINAL.pdf
[57] ADBE 10K FY13 - FINAL https://www.adobe.com/content/dam/cc/en/investor-relations/pdfs/ADBE-10K-FY13-FINAL.pdf
[58] FORM 10-K https://www.adobe.com/content/dam/cc/en/investor-relations/pdfs/ADBE-10K-FY10-FINAL.pdf
[59] ADBE 10K FY17 https://www.adobe.com/cc-shared/assets/investor-relations/pdfs/adbe-10k-fy17-final.pdf
[60] Full text of "Macworld January 1996" - Internet Archive https://archive.org/stream/MacWorld9601January1996/MacWorld_9601_January_1996_djvu.txt
[61] Full text of "MacWorld 9503 March 1995" - Internet Archive https://archive.org/stream/MacWorld_9503_March_1995/MacWorld_9503_March_1995_djvu.txt
[62] Normative references | Errata for PDF specifications https://pdf-issues.pdfa.org/32000-2-2020/clause02.html
[63] A Brief Interactive History of PDF Specifications https://safedocs.pdfa.org/timeline/pdfhistory/pdf-history.html
[64] Full text of "MacWorld 9506 June 1995" - Internet Archive https://archive.org/stream/MacWorld_9506_June_1995/MacWorld_9506_June_1995_djvu.txt
[65] Web Content Accessibility Guidelines Working Group ... https://www.w3.org/2012/10/18-wai-wcag-minutes.html
[66] Understanding Success Criterion 2.4.3: Focus Order | WAI https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
[67] User Agent Support Notes for for PDF Techniques https://www.w3.org/WAI/WCAG20/Techniques/ua-notes/pdf
[68] Understanding SC 1.3.2 (Meaningful Sequence): Level A https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html
[69] Adobe Inc. - Wikipedia https://en.wikipedia.org/wiki/Adobe_Inc.
[70] PDF Accessibility Reading Order https://lists.w3.org/Archives/Public/w3c-wai-ig/2012JulSep/0051.html
[71] RE: PDF Accessibility Reading Order https://lists.w3.org/Archives/Public/w3c-wai-ig/2012JulSep/0052.html
[72] Report-Based Moderation in Ozone https://atproto.com/blog/report-based-moderation
[73] Accounts and deletions https://atproto.com/guides/account-lifecycle
[74] 2023 Protocol Roadmap https://atproto.com/blog/protocol-roadmap

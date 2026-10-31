# PDF LAB outside: the document has several lives

Research date: 31 October 2026. Author: Perplexity; kind: assistant. Edited, source-linked Markdown edition of the outside-track research answer in the project conversation. This preserves its substantive findings, proposals, experiments and handoff; it is not a verbatim transcript. Chat citation tokens have been replaced with durable source links. No hosted services, viewers or model APIs were executed in this research pass. No claims below establish new local measurements.

Companion: [Inside deep dive](08-INSIDE-DEEP-DIVE.md). Earlier framing: [Outside document journeys](04-OUTSIDE-DOCUMENT-JOURNEYS.md). Existing implementation: [RUNNING](../../RUNNING.md) and [WEIRD-MACHINES](../../WEIRD-MACHINES.md).

## Verdict

Build a document whose file, preview, searchable content and conversation can be inspected separately. The strongest territory is not which viewer supports which feature, but which part of the experience belongs to the bytes and which part is supplied elsewhere.

Three useful findings:

1. Hypothesis reconnects annotations across separately hosted and local copies using a document fingerprint. Moving a file can reconnect a conversation without embedding it. [Hypothesis copies](https://web.hypothes.is/help/annotations-not-syncing-across-copies-of-a-pdf/) and [local PDFs](https://web.hypothes.is/help/annotating-locally-saved-pdfs/).
2. Google Drive documents API comments that are not shown in the PDF previewer. No comments visible does not establish no comments exist. [Drive comments](https://developers.google.com/workspace/drive/api/guides/manage-comments).
3. SharePoint OCR can put recognised PDF text into a search index without exposing it in the extracted-text metadata column. Searchability, appearance and downloadable text are different surfaces. [SharePoint OCR](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/ocr-overview?view=o365-worldwide).

These are mechanisms for creative experiments, not incident reports.

## Evidence language and repository access

- D: documented by an official source or inspectable project.
- R: source-reported, not reproduced here.
- M-repo: measurements recorded in the repository, not rerun here.
- P: proposal or inference.
- ?: not established.

Both supplied GitHub browser URLs failed in the originating research pass; connector access worked. The author read AGENTS.md, the PDF LAB directory, RUNNING.md and the preserved outside dossier. RUNNING.md blob 260ecd4fad26bd32923e5cde2704c90a08b62710 reports Cabinet 003, nine families and 23 generated PDFs. Existing specimens cover alternate extraction, forms, repair, PDF/ZIP identity, revisions, print differences, layer logic and colour computation. Interactive qualification remains incomplete; the recorded PDFium configuration without V8 did not establish JavaScript support. No hosted journey was established by those measurements. Reuse this work, rather than starting another generator.

## 1. Ecosystem and state boundaries

```text
FILE PLANE: original / revisions / derivatives
    |                 |                  |
PRESENTATION     INTERPRETATION     COLLABORATION
preview/print    text/OCR/search    comments/replies
thumbnail/UI     chunks/model      anchors/resolution
    |                 |                  |
ACCESS PLANE: account / role / link / policy
                      |
DOWNLOAD: possibly missing external state
```

These are evidence categories, not necessarily separate components. A preview can include comments; export can burn annotations into pixels. Apple documents annotation burn-in as a save option. [PDFKit WWDC22](https://developer.apple.com/videos/play/wwdc2022/10089/).

| Boundary | What changes | Question |
|---|---|---|
| File -> viewer | Interpretation/UI | Which revision, bytes and layer state? |
| File -> derivative | Representation | Thumbnail, raster, rewrite, OCR or original? |
| File -> index | Discoverability | What text is indexed and where stored? |
| File -> conversation | Social state | Which identifier/anchor binds comments? |
| Account -> preview | Authority | Whose permissions does the preview use? |
| Service -> download | Portability | What disappears offline? |
| File -> agent | Supplied evidence | Text, images, retrieved chunks or mixture? |

The research mistake is treating all seven as PDF support.

## 2. Creative boundaries worth investigating

### The same page, three conversations

Hypothesis documents fingerprints joining copies and DOI-based relationships between HTML/PDF versions. [Copies](https://web.hypothes.is/help/annotations-not-syncing-across-copies-of-a-pdf/), [DOIs](https://web.hypothes.is/blog/dois/).

P: compare identical bytes in different locations; changed bytes with intentionally preserved document identity; visually equivalent bytes with a changed identity. Use only a private owned group. Observe which conversation reconnects.

Some Hypothesis help text calls the fingerprint a digital signature. Do not adopt that terminology: [PDF.js API](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js) describes a not-guaranteed-unique identifier. It is neither a cryptographic signature nor full-file SHA-256. A service's same-document relation can differ from byte identity.

### A conversation that exists but is invisible

Drive distinguishes anchored/unanchored comments and documents that unanchored comments are not shown in its PDF previewer while remaining API-retrievable. P: display page, preview comment UI and sanitised API records side by side. Application-defined API anchors must not be assumed equivalent to native preview highlights. [Drive comments](https://developers.google.com/workspace/drive/api/guides/manage-comments).

### Search knows another reading

SharePoint OCR documents search indexing for scanned/hybrid PDFs; for PDF/TIFF, recognised text is not exposed in the image-oriented extracted-text metadata column. P: upload an owned image-only phrase; compare local extraction, preview selection, service search, metadata and downloaded bytes. Search success does not establish a saved PDF text layer. [OCR overview](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/ocr-overview?view=o365-worldwide).

### Three links that look like one document

Graph preview creates temporary embeddable URLs and warns that previews operate with the calling identity's authority. These are not ordinary recipient-specific share links. [Preview API](https://learn.microsoft.com/en-us/graph/api/driveitem-preview?view=graph-rest-1.0). Microsoft advises storing item identity, not caching temporary preview URLs as durable references. [Preview flow](https://learn.microsoft.com/en-us/sharepoint/dev/embedded/build/preview-files).

P: compare a share link, preview reference and download reference, showing role/lifetime while never publishing usable tokens.

## 3. Consumer matrix

No new live measurements. Unknown means not established, not unsupported.

| Surface | Documented knowledge | Remaining boundary | Status |
|---|---|---|---|
| Chrome desktop | On-device OCR; download/save routes | Does OCR persist through each save? | D/? [Chrome](https://support.google.com/chrome/answer/16215622?hl=en&co=GENIE.Platform=Desktop) |
| Edge | Adobe-powered reader integration; policy transition | Record actual build/policy; Chromium ancestry does not identify the renderer | D/? [Policy](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/newpdfreaderenabled) |
| Teams + Acrobat | Configurable viewing/commenting integration | Channel pinned tabs and Assignments retain native viewer; mobile integration excluded in inspected docs | D [Teams](https://learn.microsoft.com/en-us/microsoftteams/adobe-acrobat-pdf-viewer-teams) |
| Drive preview | Hosted comments/API | API state versus visible UI; download embedding untested; engine undisclosed | D/? [Comments](https://developers.google.com/workspace/drive/api/guides/manage-comments) |
| Acrobat shared review | Local/server comment synchronisation | Which download carries which state? | D/? [Sync](https://helpx.adobe.com/ca/acrobat/desktop/share-and-review-documents/manage-reviews/check-comments.html) |
| Nextcloud | Explicit PDF.js integration | Thumbnail generation is separately configured | D [Viewer](https://github.com/nextcloud/files_pdfviewer), [previews](https://docs.nextcloud.com/server/stable/admin_manual/configuration_files/previews_configuration.html) |
| PDFKit-based app | Selection, annotation, widgets, writing | Do not infer all Apple preview configurations; burn-in changes structure | D/? [PDFKit](https://developer.apple.com/documentation/pdfkit) |
| Paperless-ngx | Original/archive/search pipeline | Some editing actions modify stored original | D [Usage](https://docs.paperless-ngx.com/usage/) |
| OpenAI PDF API | Extracted text plus page images | Private parser/render/layer/attachment handling unknown | D/? [Inputs](https://platform.openai.com/docs/guides/file-inputs) |
| Claude PDF API | Images plus extracted text | Text citations do not cover image-only material | D/? [PDF](https://platform.claude.com/docs/en/build-with-claude/pdf-support), [citations](https://platform.claude.com/docs/en/build-with-claude/citations) |
| Gemini PDF API | Visual processing; specified native-text handling | Model/endpoint-specific; internals undisclosed | D/? [Docs](https://ai.google.dev/gemini-api/docs/document-processing) |
| Existing cabinet | Named local engine tests | Hosted routes/live interaction unqualified | M-repo, RUNNING.md |

API documentation is not a statement about every consumer chat product, connector or agent.

## 4. Identity, versions and caches

Graph distinguishes content cTag, whole-item eTag, item identity, version identity, thumbnails and content endpoints. None replaces local SHA-256. [driveItem](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0), [version content](https://learn.microsoft.com/en-us/graph/api/driveitemversion-get-contents?view=graph-rest-1.0).

P: upload V1 with a large version marker, capture every surface, replace content through the same item with V2, record available IDs/tags/time, repeat until convergence or timeout and in a fresh session. Report surface X showed V1 at T while download was V2, not an invented server-cache architecture. Client state, indexing delay, wrong item/version and instrumentation error are alternatives.

Paperless documents preserving originals during normal ingestion but also says rotation/page deletion can alter the stored original. Keep immutable specimens outside the consumer's working storage. [Usage](https://docs.paperless-ngx.com/usage/).

## 5. Tinkering shelf

Live branches need pinning. Dates are historical documentation/package labels, not latest-version claims.

| Source | Useful entry point | Reuse/limit |
|---|---|---|
| [Hypothesis client](https://github.com/hypothesis/client) | Identity metadata and annotation anchoring | BSD-2-Clause plus component notices; private-group testing |
| [Nextcloud PDF viewer](https://github.com/nextcloud/files_pdfviewer) | PDF.js integration versus preview providers | AGPL-3.0; pin dependencies/configuration |
| [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) | Ingestion -> archive -> text -> search -> download | GPL-3.0; review external dependencies |
| [OCRmyPDF](https://ocrmypdf.readthedocs.io/en/latest/cookbook.html) | Skip/redo/force and sidecar | Retrieved docs labelled 17.13.1; sidecar is OCR text, not all pre-existing text; check signature handling |
| [NAPS2](https://github.com/cyanfish/naps2) | Acquisition, page operations, Tesseract, SDK examples | Application GPL-2.0+; several SDK components LGPL and samples MIT; inspect component terms |
| [PDFKit](https://developer.apple.com/documentation/pdfkit) | Controlled consumer and write/burn-in options | Apple SDK/sample terms, not open renderer source |
| [Graph preview](https://learn.microsoft.com/en-us/graph/api/driveitem-preview?view=graph-rest-1.0) | Temporary preview/authority | Work/school prerequisites; least privilege |
| [Drive comments](https://developers.google.com/workspace/drive/api/guides/manage-comments) | Comment ledger independent of UI | Scopes and anchor semantics matter |
| [eq2db](https://ctan.org/pkg/eq2db) | End Quiz -> explicit server script | 2.0, 2016-01-02; LPPL; current support untested |
| [pmdb](https://ctan.org/pkg/pmdb) | Source-selection PDF | Earlier 2021-06-07 lead; LPPL 1.2; fresh fetch failed in research pass |
| [FitR](https://ctan.org/pkg/fitr), [xbmks](https://ctan.org/pkg/xbmks) | Spatial/cross-document navigation | Historical 2020 leads; LPPL; fresh fetches failed; support unknown |

P: a FitR-style oversized journey map where destinations frame the file, conversation, index and model evidence. The report becomes an interface to its own investigation. Do not install the whole shelf before one journey works.

## 6. Five reproducible experiments

### J01 — Same page, different doorway

Question: does behaviour depend on opening route? Build: existing alternate-reading and screen/print specimens plus plain baseline/version marker. Routes: local, direct browser, storage preview, Teams integration and channel-tab opening where available.

Controls: same input SHA-256, account/platform held fixed where possible, plain page. Instruments: manifest, screenshots, copied text, actions, downloaded files and independent render/extraction. Hypothesis: a specific documented route difference changes feature exposure even when downloads remain byte-identical. Falsifier: predicted difference absent or changed input explains it. Demo: four doors to one object. Privacy: owned tenant/files, sanitised identity/URLs, no embedded network actions.

### J02 — Same page, different social lives

Question: what binds comments and what travels offline? Build: embedded annotation; exact copy elsewhere; visually equivalent copy with changed identifier. Add a private Hypothesis annotation; keep Drive as a separate subtest.

Controls: service/group/user fixed; identical visible pixels/text; immutable pre-rewrite source. Instruments: SHA-256, PDF IDs/fingerprint, annotation JSON, local annotation listing, screenshots, author aliases/replies/resolution/times. Hypothesis: external association follows an identity across locations without embedding conversation. Falsifier: association fails or another uncontrolled identity explains it. Demo: document reconnects to readers. Privacy: private owned group; never manipulate identifiers against others' documents.

### J03 — Who added the words?

Question: file text, transient recognition or service index? Build: owned image-only unique phrase, native-text equivalent, known OCR-layer equivalent. Routes: Chrome, local OCRmyPDF, optional already-authorised SharePoint OCR.

Controls: confirm no text objects; positive/negative searches; preserve original raster. Instruments: hashes, structure, extraction, OCR sidecar, viewer copy/search, service search. Hypothesis: searchability can arise without native text in original; persistence varies by route. Falsifier: text pre-existed, no recognition occurred or route result contradicts prediction. Demo: environment can read words the original does not encode as text. Privacy: no real receipts/letters; unique synthetic marker. OCRmyPDF sidecar excludes pre-existing text, so incompleteness is not automatically content loss.

### J04 — Download is not one operation

Question: which properties survive ingestion/save/export? Build: owned text/image/field/annotation/link/source-attachment PDF, plus clearly marked V2. Routes: pinned Paperless and selected browser downloads.

Controls: immutable external original, no-op download, deliberate raster control, preserve/OCR/transform separated. Instruments: original/archive/download hashes, object inventory, render/extraction diffs, links/fields/attachments, IDs/tags/time. Hypothesis: archive, original, with-changes and print/export preserve different properties. Falsifier: output unexpectedly identical or wrong route/version used. Demo: lineage tree showing inheritance. Privacy: isolated service, synthetic metadata, no mail; share-link actions separately approved.

### J05 — Same page, different agent evidence

Question: what changes with text, image, hybrid, native PDF or retrieval? Build: native label/number/diagram, outlined equivalent, raster equivalent, explicitly labelled alternate-reading specimen with no hidden instructions.

Controls: fixed questions/expected answers, visible-text versus encoded-text questions separate, fixed image rendering, fresh/repeated requests. Instruments: exact inputs/prompts, model/endpoint/configuration, usage, outputs/citations. Hypothesis: recognition, answers, citation and localisation differ by evidence route. Falsifier: no repeatable difference. Demo: evidence envelopes, not a model leaderboard. Privacy: explicit upload approval, cost cap, synthetic data, cleanup; no bearer preview/download URLs.

Known wrong supplied text supports an extraction/representation finding. Misread known image supports a recognition-error candidate. Correct known input plus wrong arithmetic supports a reasoning-error candidate. A hosted PDF answer alone does not identify its private ingestion cause. Visual answering without citation may reflect a citation-channel limitation. Instruction following is a separate experiment, not established here.

## 7. Permissions and observation scope

Separate file encryption/permissions, viewer enforcement and service identity/role/link policy. [Google sharing controls](https://support.google.com/drive/answer/2494893?hl=en-GB&co=GENIE.Platform=Desktop) constrain service actions, not every conceivable reproduction of information.

Distinguish authenticated access, anonymous share, temporary preview and prior local copy. Paperless documents expiring/deleted share links redirecting to login, not disappearance of already downloaded files. [Usage](https://docs.paperless-ngx.com/usage/).

Network traces establish observed requests/responses, not complete storage/retention/server architecture. Use explicit owned actions; strip cookies, authorization headers and URL secrets.

## 8. Transition record — proposal v2

```yaml
schema: pdf-lab.transition/proposal-v2
id: J02-run-001
status: not-run
question: What connects the document to its conversation?
purpose: collaboration-portability
inputs:
  - specimen_id: social-page-A
    sha256: null
    byte_length: null
    pdf_identifiers: []
    parent_transition: null
action:
  name: upload-preview-comment-download
  exact_steps: []
  started_at: null
  completed_at: null
consumer:
  host_product: null
  host_version: null
  platform: null
  viewer_ui: null
  rendering_engine: unknown
  engine_version: unknown
  extractor: unknown
  wrapper: null
  build_flags: []
  configuration: {}
authority:
  account_alias: owned-reviewer-A
  role: null
  access_route: authenticated
  link_kind: null
  link_secret: never-record
  observed_permissions: []
  service_policy_version: unknown
service_identity:
  item_alias: null
  version_alias: null
  etag: null
  ctag: null
  exposed_pdf_fingerprint: null
  annotation_group_alias: null
outputs: []
external_state_changes: []
observations:
  visible: []
  structure: []
  extraction: []
  interaction: []
  search: []
  citations: []
information:
  preserved: []
  added: []
  lost: []
  not_testable: []
evidence_refs: []
hypotheses: []
alternative_explanations: []
unknowns: []
privacy_redactions: []
```

Each output needs kind/hash/size/format/derivation/evidence. External changes include comments, replies, resolution, permission/index/share state. Temporary access capabilities and enduring document identities have different roles; do not store usable private URLs.

## 9. Serious challenges

- Measure individual edges before a full linear journey; otherwise too many variables change.
- Changed hashes are not automatically loss: annotation/OCR legitimately changes bytes.
- Screenshots are not universal controls: intent, OCG state, annotations, fonts and resolution matter.
- A stable item ID is not stable content. A fingerprint is not a content hash. External comments can change while PDF bytes do not.
- A small route-specific matrix beats vague product support labels.
- Agents are not the first dependency: social identity and OCR already produce strong explainable exhibits.

## 10. First slice and narrative

P: one page, two lives. Reuse an owned alternate-reading specimen, visible version marker, embedded comment and private external annotation. Route: immutable local source -> local browser -> private annotation environment -> exact copy elsewhere -> download -> offline reopening.

Need: existing PDF LAB instruments; pinned browser; private owned group or isolated annotation environment; local server; hashing/inspection; sanitised capture. Optional next slice: Paperless/OCRmyPDF lineage.

Defer tenant-wide Teams/Edge changes, enterprise DLP, broad mobile coverage, multi-provider models, public sharing, custom distributed annotation infrastructure and privileged legacy integrations.

The historical analogy is recognisable appearance surviving transmission, not PDF guaranteeing truth. P narrative: the page arrived; words changed channel; comments stayed elsewhere; identity reconnected people; the agent received a derivative. Experiments decide which lines apply to each route.

## Agent-ready handoff

```text
Status: research proposal, no hosted journey executed.
Read current guidance and cabinet state; do not overwrite measurements.
Objective: one page, two lives: file versus external conversation.
Pin browser, code and instruments. Reuse owned specimens.
Obtain approval for service writes/uploads; choose one private environment.
Preserve immutable inputs, hashes and PDF IDs separately.
Capture opening, annotation, copied location, download and offline opening.
Implement transition evidence; retain raw outputs and sanitised report.
Acceptance: explain what is in the file, what environment adds,
what binds comments, what survives offline and what remains unknown.
Do not call fingerprints signatures, changed hashes corruption,
or model answers proof of hidden preprocessing.
Next: transient OCR versus persisted OCR/archive.
Defer broad deployments, public sharing, tracking and exploit execution.
```

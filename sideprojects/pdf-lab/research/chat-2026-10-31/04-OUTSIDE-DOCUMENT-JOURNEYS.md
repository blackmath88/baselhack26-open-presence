# Outside: viewers, services and document journeys

31 October 2026 · Perplexity, assistant · Documented mechanisms and proposed measurements.

## The unit is file plus environment

Local bytes, selected revision, viewer/engine/build, permissions, account, tenant configuration, preprocessing, server state and user action together determine the experience. A product name is not a complete instrument identity. Upload, preview, search, edit, export and agent ingestion can be different pipelines inside the same product.

## LLM ingestion is not universally screenshot then OCR

The user's question proposed picture-taking plus OCR and asked whether code-level extraction would be easier/faster. Preserve the question, but do not adopt it as a universal fact.

- [OpenAI file inputs](https://platform.openai.com/docs/guides/file-inputs): documentation explicitly says PDF processing supplies extracted text and page images to vision-capable models. Rechecked in this archive preparation.
- [Claude PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support): documents a visual/text PDF path; exact hosting/platform conditions matter.
- [Gemini document understanding](https://ai.google.dev/gemini-api/docs/document-processing): documents visual PDF processing; native-text handling is described in the provider's document-processing documentation.
- [Claude citations](https://platform.claude.com/docs/en/build-with-claude/citations): text citations and visual comprehension are not the same capability.
- [Claude coordinates](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates): documents server-side PDF rasterisation and coordinate limitations.

These links describe APIs, not every chat product, connector or agent built on the models. Exact extractors, renderers, layer states, resolution, attachment handling and retained data remain unknown unless documented or observed. A vision model reading an image need not invoke a standalone OCR component. Model answers do not reveal the hidden pipeline.

Separate four possible failures: representation mismatch; extraction/OCR error; reasoning error on the supplied representation; instruction-following/prompt injection. Text-only, image-only and hybrid controls help, but do not prove how a hosted upload was internally processed.

## Teams, SharePoint and OneDrive

[Microsoft's Teams Acrobat configuration](https://learn.microsoft.com/en-us/microsoftteams/adobe-acrobat-pdf-viewer-teams) permits Acrobat to be the default PDF app. [Adobe's collaboration guide](https://experienceleague.adobe.com/en/docs/document-cloud-learn/acrobat-learning/integrations/acrobatandteams) documents viewing, annotation and review. [Browser configuration](https://helpx.adobe.com/acrobat/web/use-acrobat-extensions/acrobat-for-sharepoint-and-onedrive/configure-browsers-acrobat.html) includes third-party-cookie dependencies.

Therefore record the exact route: Teams desktop/web, tenant integration, browser, file location, identity and permissions. Do not assign an undisclosed default renderer from the product logo. Compare local download, direct browser view, storage preview, Teams integration and export separately.

## Comments and links can live outside the bytes

[Acrobat shared links](https://helpx.adobe.com/acrobat/desktop/share-and-review-documents/share-documents/share-pdfs.html), [internal-server reviews](https://helpx.adobe.com/acrobat/desktop/share-and-review-documents/share-documents/internal-server-review.html), and [comment synchronisation](https://helpx.adobe.com/ca/acrobat/desktop/share-and-review-documents/manage-reviews/check-comments.html) document hosted review and synchronisation mechanisms.

Proposed question: is a comment embedded in the PDF, stored in a service, or synchronised across both? Test each route instead of generalising. Record download options, file annotations, author/time metadata, resolved state, access controls and server-visible conversation independently. An unchanged file hash does not imply unchanged service state. A revoked share link does not prove previously downloaded copies are revoked. The latter is a boundary question to investigate, not a measured revocation guarantee.

## Scanning and automatic OCR

[Google Drive scanning](https://support.google.com/drive/answer/3145835?hl=en&co=GENIE.Platform=Android) documents capture, crop/rotation, filters and searchable PDFs. [Chrome PDF handling](https://support.google.com/chrome/answer/16215622?hl=en&co=GENIE.Platform=Desktop) documents on-device OCR for scanned PDFs.

Searchable in this viewer does not prove a text layer exists in the original file. Test original bytes, transient viewer augmentation and saved/exported output separately. A scanner's capture/cleanup stage can alter information before a PDF is created. Specify exact app, settings and stage; do not infer processing location for every feature.

## Three kinds of outward action

1. Document-originated: URI links, form submissions and exposed scripting methods.
2. Viewer/service-originated: share, comment, save-to-cloud, account and collaboration controls.
3. Pipeline-originated: previews, OCR, indexing, conversions and model preparation.

[Acrobat JavaScript API](https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsapiref/index.html), [document methods](https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsapiref/doc.html), and [forms guide](https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsdevguide/JS_Dev_AcrobatForms.html) describe methods and security restrictions. Existence of an API is not permission for arbitrary network or filesystem access.

If network behaviour is tested, use an explicit action, synthetic marker and owned local/controlled endpoint. No hidden tracking, credentials, third-party targets or real-data exfiltration. Redact account identifiers, tokens, private links and unrelated traffic from published logs.

## Deliverables, proposed

- Route map: local file -> upload -> preview -> comment -> download -> agent.
- Original and derivative hashes, including downloaded variants.
- Identified host, engine, wrapper and build, or explicit unknowns.
- Service-side state that did not travel with the download.
- OCR, extracted text, preview and other derivatives where observable.
- Permission, prompt and network observations using owned accounts.

A screenshot only supports visible-state claims. Network logs support observed requests, not the complete server architecture. Service and engine versions may be undisclosed; keep that uncertainty in the run record.

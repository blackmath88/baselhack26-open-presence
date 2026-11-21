# PDF processing boundaries in an MCP workflow

Proposed December research, 21 November 2026. Start with the cabinet’s [paired poems](TWO-POEMS.md) and [transformation notebook](TRANSFORMATION-NOTEBOOK.md). When a tool hands a document to another process, the extractor, thumbnail renderer and browser may each interpret the same bytes differently. Identify which one actually ran before attributing behaviour to a library or service.

| Stage | Research question | Harmless comparison or evidence |
| --- | --- | --- |
| PDF generation | Can user-supplied punctuation alter the document structure? | Write a literal title containing parentheses and a backslash through the normal writer. Compare the page, extracted text and parsed object inventory with a plain-title control. Expect the text to round-trip and the inventory of actions to stay the same. |
| Extraction and viewing | Which representation reaches the user or assistant? Does this consumer support document actions or JavaScript? | Compare the existing paired poem in a reader, extractor and static preview. Record each consumer’s identity, version and settings. Distinguish the presence of action metadata from observed execution. |
| Thumbnail generation | Which executable and package revision renders the preview, and under which OS account? | Render a normal cabinet specimen in the owned workbench. Record the configured renderer, effective file access, network isolation and output. Check vendor backports against the installed package. |
| Browser delivery | Which origin serves the response, and what interpretation does the browser choose? | Inspect a benign PDF response from the local cabinet. Record the MIME type, disposition, nosniff header, final origin and observed handling for navigation and embedding. The cabinet’s PDF/ZIP specimen illustrates multiple format identities. A missing header alone proves neither HTML execution nor cookie access. |
| MCP integration | Does the integration return page pixels, extracted text, metadata or a URL? | From an owned integration’s configuration, identify the consumer and who grants access to the file. If no integration is present, leave this a design question. |

## Advisory context

- **Adobe Acrobat and Reader.** CVE-2026-34621 concerns prototype pollution and possible execution with the current user’s privileges. Adobe reports exploitation in the wild. Match the installed product and build to the bulletin. A heap-spray technique or sandbox escape in a particular viewer would require separate evidence. [Adobe APSB26-43](https://www.adobe.com/trust/security/products/acrobat/apsb26-43.html)
- **Ghostscript.** CVE-2026-125396 describes a SAFER bypass in upstream releases before 10.08.0. For a thumbnail service the first question is whether it invokes Ghostscript at all. Record the distribution package’s fix status as well as the upstream version. [Debian security tracker](https://security-tracker.debian.org/tracker/CVE-2026-125396)

**Evidence target.** One fixture hash, exact consumer versions, expected and observed interpretations, the applicable control, and cleanup of temporary outputs. Findings about an owned reader apply to the recorded configuration. Deployment in Swiss identity or voting services remains unverified. [Cyber December mission](https://github.com/blackmath88/cyber-december27/blob/main/docs/DECEMBER-2026-BOUNTY-MISSION.md)

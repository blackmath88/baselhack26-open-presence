# PDF LAB — Chat-to-Creative-PDF, capability-driven MCP

Status: **proposed implementation plan**, 2026-11-02. This does not claim an MCP service, new generators, deployment or live client connection exists. User direction: create **real experimental/creative PDFs from ChatGPT and Claude**, not only ordinary PDFs, and have future approved PDF LAB capabilities become discoverable without changing the MCP server each time.

## Start from the working product

Read repository `AGENTS.md`, current knowledge/context packet, `sideprojects/pdf-lab/README.md`, `PLAN.md`, `WORKBENCH-BUILD.md`, `RUNNING.md`, and actual generator/test implementations. Preserve cabinet and existing creative priorities. Check current workbench branches/PRs before changing code. Existing evidence includes paired poems/Type 3 mapping, maze, layers, bitmap, Type 4 colour, PDF/ZIP, revisions and print-mode exhibits; **existence of a specimen does not mean it is already a parameterized safe authoring capability**.

Transfer the tested architectural pattern from [msteams-personas](https://github.com/blackmath88/msteams-personas): one editable project format, shared validation/compilation/render operation for web/CLI/MCP, bounded artifacts and retrieval. Relevant [CLI/MCP handoff](https://github.com/blackmath88/msteams-personas/blob/main/docs/CLI-MCP-HANDOFF.md) and [MCP server](https://github.com/blackmath88/msteams-personas/blob/main/tools/mcp-server.mjs). Reuse principles and test cases; **do not copy its M365 renderer or assume current ChatGPT/Claude transport compatibility**.

## Product journey

User: “Create three versions of a poem that looks identical but extracts differently. Show me the PDFs, previews and exactly what Poppler/MuPDF read. Make version two stranger.”

Assistant: discover available capabilities → obtain typed example → author/validate project → execute allowlisted generator → inspect with installed bounded instruments → retrieve actual PDFs, previews, manifest and evidence → revise recipe → reopen same project in Workbench.

Every result must distinguish **generated** from **measured**, historical measurements from this run, and **not_run/unsupported** from success. Never imply a PDF behaves identically across readers based on one renderer.

## Architecture

```
ChatGPT / Claude       Browser Workbench        CLI
       \                    |                  /
          shared project/v1 + validator
                       |
         versioned capability registry
                       |
       allowlisted generator / inspector adapters
                       |
       immutable PDFs + previews + evidence manifest
                       |
              bounded artifact retrieval
```

The registry is a **static, reviewed build-time manifest** initially, not arbitrary plugin execution or runtime scanning/import of untrusted modules. Adding a registered module to a new deployment makes it visible through the unchanged `get_capabilities` tool. Clients may need a refresh/reconnect; server updates are not magical remote code loading.

Suggested capability record: `id`, `version`, `title`, `description`, `kind` (generator/inspector), `inputSchema`, `outputs`, `limits`, `dependencies`, `availability` (available/unavailable/experimental), `safetyProfile`, `exampleId`, `adapterId`. An adapter must implement a fixed, tested interface; validate schemas at runtime. Availability reflects actual installed instruments and build configuration, not wishlist entries.

Project `pdf-lab.project/v1`: project ID/title, ordered recipe instances with capability ID/version and typed parameters, requested inspections, references to immutable parent/output artifacts and authored explanations. Keep produced hashes/observations in a **render manifest**, not mutable project inputs. No arbitrary filesystem paths, executable source or shell fragments in MCP requests.

Stable five-tool MCP:
1. `get_capabilities`: version, modules, readiness, limits, installed instruments, transport-independent constraints.
2. `get_example`: valid project for a capability ID.
3. `validate_project`: located diagnostics for invalid IDs/versions/parameters/dependencies/budgets.
4. `render_project`: all-or-nothing bounded generation; returns render ID and artifact manifest/links, not huge inline binary.
5. `retrieve_artifact`: manifest-allowlisted PDF, PNG/WebP preview, raw text/JSON evidence; MIME types correct, binary retrieval tested with actual ChatGPT and Claude clients separately.

Use the **same** validation and execution code in website, CLI and MCP; no second renderer or drift. MCP adapter thin; artifacts stored outside Git in isolated directories with retention/quota and hash verification. Browser-only mode may expose a subset if server-side instruments are unavailable; communicate that clearly.

## Milestones and acceptance gates

### C0 — Audit and contract (small)
Inspect exact existing generators and current workbench. Record capability inventory: implemented artifact, parameters supported, engines installed, security constraints, source revision. Define project/v1, registry/v1 and render manifest/v1 with one complete valid example and invalid fixtures. Do not introduce a new service.

### C1 — First creative loop (P0)
Implement **dual-reading poem** using the existing narrow writer. Parameterize only verified bounded text controls (respect 4 ASCII lines, 1–32 chars where that fixture requires it). Generate real PDF, original bytes hash, recorded/generated distinction and downloadable artifact. Reopen project via CLI and web if current shell exists. Test repeatability, invalid text, malformed JSON, output size and failed-write cleanup.

### C2 — Prove growth without MCP rewrite (P0)
Add a **second independently meaningful mechanism**, preferably existing layer lock or glyph maze after verifying actual parameterization and viewer support. Register it by adding adapter + capability declaration + tests, **without modifying the five MCP tool handlers**. Capability list and example change automatically; unsupported actions remain unavailable. This is the architectural acceptance test.

### C3 — Real assistant round trip (P0)
Expose stdio to local Claude and a secured, supported ChatGPT connection where available; do not expose unauthenticated HTTP. Test get capabilities → example → validate → render → retrieve actual PDF bytes, preview and manifest. Verify file signature, SHA-256, content MIME, links, size and refusal of traversal/unknown render IDs. Include actual screenshots or retrieved artifacts. Mark any client not tested as unverified.

### C4 — Measured interpretations (P1)
Attach named Poppler/MuPDF/PDFium/PDF.js adapters **only where actually installed and exercised**. Capture versions, flags, timeouts, raw output, failure/unsupported/not_run, and source/output hashes. Compare visible, extracted and structural channels. Historical evidence is labelled historical, never re-stamped as live.

### C5 — Experimental construction (P2)
Permit chat to propose a *new* mechanism via reviewed adapter code in a disposable, network-disabled, resource-capped sandbox. Never accept arbitrary Python/JS or shell via public MCP `render_project`. Promote a successful experiment to the registry only after tests, safety review, provenance and a new release. Failed/interesting negative results remain inspectable.

### C6 — Workbench integration and reuse (P2)
Open the same project/recipe, generated PDFs and evidence in the TanStack Workbench; share selection and artifact identities, compare runs and preserve reproducible bundles. Avoid making the Workbench a prerequisite for CLI/MCP.

## Acceptance tests

- Web/CLI/MCP same project → same semantic artifact inventory and hashes when generator deterministic (or explicitly documented nondeterminism).
- Two creative modules discoverable; second module requires no MCP handler change.
- Invalid recipe, missing module/version, unsupported instrument, traversal, symlink escape, excessive output, cancellation, timeout, failed generator, stale artifact and tampering fail with located diagnostics and no falsely successful manifest.
- Read-only retrieval never accepts arbitrary paths; artifact IDs are server-generated; bounded concurrency and cleanup; no external writes beyond authorized artifact root.
- Client retrieves **actual PDF** and preview, not just a resource URL; exact client/transport/version recorded.
- Each observation includes engine/version/settings/evidence and explicit gaps.
- No public upload, untrusted active-content execution or generic PDF interpreter exposed in C1–C3.

## Decisions and scope

**User-stated direction:** creative real PDF authoring from chat; capability growth discoverable by MCP; reusable website/CLI/MCP architecture. **Proposed:** static registry, five stable tools, first two modules, phased inspection/sandbox. **Open:** exact host/transport, retention/quota, PDF preview engine, second module, approval policy for new adapters, public publishing. Do not auto-merge or deploy.

## External sparring targets (leads, not audited endorsements)

- [MCP specification](https://modelcontextprotocol.io/specification) — tool/resource discovery and transport constraints.
- [msteams-personas](https://github.com/blackmath88/msteams-personas) — internal working shared renderer precedent.
- [GCHQ CyberChef](https://github.com/gchq/CyberChef) — recipe/operation composition and discoverability.
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) — typed nodes, graph workflows, extensibility.
- [Pandoc](https://github.com/jgm/pandoc) — document conversion and composable filters.
- [Typst](https://github.com/typst/typst) — programmable document construction.
- [Quarto](https://github.com/quarto-dev/quarto-cli) — authored documents and multiple outputs.
- [OpenSCAD](https://github.com/openscad/openscad) — parameterized reproducible artifacts from source.
- [Blender](https://github.com/blender/blender) — scripted creative production and headless rendering.
- [Node-RED](https://github.com/node-red/node-red) — discoverable operation nodes and bounded workflows.
- [ImageMagick](https://github.com/ImageMagick/ImageMagick) — composable image transforms and format interoperability.

Research must verify exact relevant code, licences and limitations before adoption; cross-domain analogies are hypotheses, not compatibility proof.

## Repository handoff

New finding: msteams-personas already demonstrates shared project validator/rendering with a stable five-tool MCP and artifact retrieval; PDF LAB has multiple real experimental artifacts but no verified capability-driven MCP. Proposal: C0–C6 above. Agreed direction: chat-generated creative PDFs with growing capability discovery. Open decisions: host, second adapter, privacy/retention, sandbox, transport. Affected documents: this plan; existing WORKBENCH-BUILD and PLAN remain authoritative for their own scope.

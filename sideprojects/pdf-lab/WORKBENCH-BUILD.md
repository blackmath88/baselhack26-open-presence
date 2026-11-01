# PDF Workbench — modular application build
1 November 2026 · ChatGPT / Codex, assistant · Implementation blueprint requested by Achim.
Status: user-requested direction; detailed contracts, packet boundaries and ordering below are proposed implementation choices. No application is delivered by this document.

## Start here
Build Batch A (phases 0–2) using [Claude's execution brief](CLAUDE-WORKBENCH.md).
Read the [supplied research synthesis](research/2026-11-01-workbench-direction.md) and [PR #26](https://github.com/blackmath88/baselhack26-open-presence/pull/26).
Keep [PLAN.md](PLAN.md) as the creative experiment roadmap. This document adds the application roadmap, not a replacement for the strange-document vision.

## Source state and precedence
Inspected main: `4c998e90408100de4b04c8af83b0024d9f3c0162`; recursive tree complete (not truncated).
PR #26 is open/unmerged at `9594563174ea856a551b95836182cd16d1531766`: one research proposal, not application code.
PR #23 is open/unmerged at `283a85a602b4f7d562ee6c8bc9f417886de8ff42`: .phf story and presentation planning. Its PDF → .phf → Observatory narrative uses a concise paired-poem opening; the middle stays longest. This workbench must not become a prerequisite for that presentation or replace its opening.
Source packet read: `cp_49910240c91373d872f079ac` (also inspected the other committed packet), cutoff `93a5445150d05b3626507f8ef5868d13d62d57ef`, older than inspected main. Historical complete=true applies only to that packet.
Required hosted knowledge.json and snapshot.json fetches failed. Their current resolved commit, completeness and diagnostics are unverified. The source knowledge manifest was read, not mistaken for a generated snapshot.

Read current instructions and compare current main before implementation. Reconcile concurrent PDF changes, especially PR #24's guided opening, without overwriting them. No dependency on merging #23, #24 or #26 is required for Batch A; use their pinned references for context. Do not promote research into accepted project-memory decisions.

## Product contract
A visitor encounters an actual strange PDF, reveals the relevant mechanism, changes something, compares named observations and keeps the evidence.
The page stays central. Technical depth appears in the same investigation.
Public label: PDF LAB / Workbench. “PDF Studio” is descriptive input, not an instruction to rename the repository, experiment IDs or parent .phf product.

Agreed in the current user request: modular growth from existing product; TanStack Start shell; clean modern Cisco-inspired visual direction; a repository build plan for Claude.
Not yet decided: exact component library, PDF.js introduction, production hosting, public uploads, execution OS, future instrument priorities. Choose routine Batch A details autonomously and record them. Runtime/deployment decisions belong to the phase that needs them.

## Existing product → new capability
Paths below are relative to this folder.
| Existing material | Reuse in workbench | Boundary |
| --- | --- | --- |
| index.html, cabinet.css, cabinet.js | Preserve as working legacy cabinet and fallback; use byte-inspection behaviours as reference | Do not wrap the whole cabinet in an iframe and call it a new UX |
| output/pdf/manifest.json and poems-manifest.json | Read-only inventory of actual files, byte counts and hashes | Legacy manifests overlap; deduplicate by path/hash, retain source references |
| output/pdf/01-poem-{visible,other,direct,raster}.pdf | First specimen family | Different artefacts, even when pixels agree |
| evidence/poems-results.json | Named historical extraction/render checks, versions, limits, not_run | Schema has versions/limits/checks/not_run/runs; no invented execution timestamp |
| evidence/previews/01-poem-*.webp | Recorded render stage | Raster preview currently reuses the source render; label that distinction |
| poems.js, poems.py, test-poems.js | Existing narrow writer and canonical construction | Browser bend is four printable ASCII lines, 1–32 chars, authored fixture only; not a generic editor |
| lab.py bend / inspect / history; build.py; exhibits.py | Later local recipe/inspection adapters | Existing inspect/recovery are scoped, not arbitrary-PDF guarantees |
| transforms.js; evidence/poems-transforms.json; output/transforms/manifest.json | Stored clone/rewrite/raster comparison and lineage | Distinguish pixel, extraction and structural outcomes |
| output/mapping-minimal/; evidence/mapping-minimal.json; MAPPING-SOURCE-AUDIT.md | Deeper A/Z/SEA mechanism reveal | Static source inference is separate from measured engine output |
| weird.js / weird.py / evidence/weird-results.json | Later layer, bitmap and colour modules | Browser simulation is not PDF engine execution |
| RUNNING.md and requirements-check.txt | Existing commands and dependency evidence | Per-run versions differ; never apply one global engine version to all runs |

The README reports 27 source PDFs, four transformation derivatives and a separate six-file minimal experiment. Discover counts from validated inputs, not a hand-maintained marketing number. No local runtime or renderer tests were run during this documentation pass.

## Visual implementation contract
Use one coherent shell: a narrow stable navigation, breadcrumb/title, workspace/processing identity, and dominant stage. Default navigation only exposes usable destinations; future My PDFs/Recipes/Findings/Journeys must not be dead links.
Cabinet cards lead with actual artwork and one question, not badges or diagnostics.
Selecting a meaningful authored region opens an inspector; “Make variant” opens recipe controls; comparison reuses the stage. Preserve the selected specimen and focus across views.

Proposed starting tokens (our design, not Cisco tokens): canvas #F5F8FC, surface #FFFFFF, secondary #EDF3F8, ink #152536, muted #506274, border #D8E2EC, accent #087E8B. Validate text/control contrast before use. Use system sans, 8px spacing rhythm, 8–12px radii and restrained shadows. No warm cream, decorative gradients, hacker console or floating windows. Transparency is limited to chrome with an opaque fallback.

Desktop: stage dominates, inspector about 320–380px when open. Tablet: collapsible navigation. Phone: stage first, contextual sheet or sequential section, focus returned to trigger; no squeezed three-column desktop.
Support keyboard equivalents for hotspots, visible focus, Escape/close, reduced motion, browser back/forward and deep links. Do not require colour to interpret evidence.
View labels distinguish recorded rendering, live viewer, teaching simulation, generated file and external manual observation.

## Durable contracts, kept small
Create under `workbench/src/domain` only what the active slice uses. Runtime-validate every external manifest and later command; TypeScript alone is insufficient.

- Artefact: stable ID, SHA-256, byte count, media type, source locator, optional parent and recipe/run relationship. Original bytes immutable.
- Specimen: editorial question and family with links to artefacts; labels are not identity.
- Instrument: engine family, wrapper, exact reported version/configuration, capability. Missing data stays unknown.
- Run: schema version, input hash, operation, instrument, configuration, limits/environment when recorded, status, output references, diagnostics, evidence source and evidence origin. Preserve historical metadata verbatim; do not stamp imports as fresh runs.
- Evidence reference: path plus source commit and JSON pointer/object reference where available. Preserve raw alongside normalized representation.
- Observation: reported result and evidence references; interpretation is a separate assertion with author, confidence/limits.
- Selection: specimen, optional page, region, object refs, operator refs, run/transition. Coordinate system and page dimensions must accompany any region. Use explicit correspondence edges carrying authored/measured/inferred/unknown and evidence; one global certainty flag cannot describe several different links.
- Recipe/variant and transition contracts arrive when used, with schemaVersion and immutable parent/output IDs.

Keep view state (zoom, tabs, open inspector) outside persisted research records. Version exports; reject unsupported future schemas with a useful message. Add migrations only when a second real version exists.
Feature modules declare question, eligible specimen capability, action, required instrument, output representation, evidence and unknowns. A static typed registry is enough; no plugin marketplace.

Dependency direction: routes/shell → features → domain; adapters implement domain contracts. Domain imports neither React nor filesystem/process APIs. Server-only modules never enter client bundles.

## Asset and execution boundaries
Batch A is curated and read-only. Build a deterministic ingestion step selecting the known manifests, reports, previews and PDFs from the parent folder into generated workbench assets. Preserve bytes and produce a source/hash inventory; ignore generated copies in Git. Never expose the whole repository or accept filesystem paths from URLs. A fixture/hash mismatch shows an error instead of stale evidence. Test direct route reload and asset paths in production build as well as dev.

Use recorded images first; native PDF download is always available. An authored hotspot is explicitly an authored guide, not native PDF text selection. PDF.js is optional later; if added, name its engine/version and do not relabel cached MuPDF output as PDF.js.

The existing browser writer can supply Batch B generation without a subprocess. Keep its fixture guard/limits, export recipe and parent/output hashes, and show new output as unmeasured until instruments run.
For Python/engine jobs, use allowlisted operation IDs, validated bounded arguments and argv arrays, never user shell commands. Isolate each job directory, restrict paths, disable network for processing, terminate process groups on cancel/timeout, cap CPU/memory/output/concurrency and retain diagnostics. Existing fixture limits (10s wall, 8s CPU, 768MiB address space, 2MiB output) are historical starting evidence, not a reviewed arbitrary-upload policy.
Protect even localhost mutations against cross-origin requests; validate origin/host and bind loopback. No uploads, parsing arbitrary files, public service or remote API in Batch A.

## Phases and gates
| Phase | Complete user capability | Deliverables / gate |
| --- | --- | --- |
| 0 Consolidate | Access current material through truthful records | Read-only adapters, deduped inventory, schemas, input hash check; malformed/missing evidence handled; source files unchanged |
| 1 Encounter | Cabinet → real specimen → explanation → original | TanStack Start/React/strict TS/Vite, tokens, routes and stage; no mock viewer; deep link survives reload |
| 2 Inspect | Select an authored region and follow page/text/mapping/evidence | Shared selection, excerpts and contextual inspector; provenance origin/unknown visible; keyboard/mobile work |
| 3 Bend | Change mapped text and download a real immutable variant | Reuse narrow writer first; recipe export/hash lineage; invalid input rejected; new artefact marked not measured |
| 4 Compare | Explain differences across original/variant and named engines | Historical comparison first, then bounded live jobs; distinct pixel/text/structure metrics, pin/unlink, settings and raw outputs |
| 5 Bring your own | Inspect unfamiliar owned PDF honestly | Local import, persistence, quarantine/limits/cancellation, unsupported/partial states, reviewed execution boundary; no fabricated intent or automatic active content |
| 6 Keep/journey | Reopen and share an evidence-linked investigation | Findings, lineage and transition records, manual observations, versioned self-contained bundle; reopen verifies hashes |
| 7 Extend | Add a new instrument or recipe without changing the shell | Capability adapter and conformance tests; OCR/traces/revisions/layers/agents report their own limits |

Dependency order is 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Stored comparison can appear in Batch A because evidence already exists; full execution/comparison infrastructure remains phase 4. No claim that exports or cancellation exist in the read-only phase.

## Batch A — Claude's immediate implementation scope
Deliver phases 0–2 as one polished slice:
1. Inventory actual files and inspect schemas; add validated read-only mapping and hash inventory.
2. Scaffold isolated `workbench/` using current official React Start instructions; pin dependencies and commit lockfile. Avoid experimental framework APIs and unnecessary UI packages.
3. Build cabinet and `/specimens/$specimenId` route; use validated search params for view and evidence selection.
4. Make two poems the fully supported encounter, with visible/alternate/control choices. Other specimens may link to the legacy cabinet until their adapter is implemented; do not imply equal support.
5. Add page/text views using actual stored outputs and a meaningful authored line/region selection with truthful mapping reveal. Derive excerpts from checked fixture bytes or pinned generator construction; unsupported structure fails honestly.
6. Add compact recorded side-by-side reading comparison, exact engine/run labels and original download.
7. Exercise the four states below, fix visual problems, then write the handoff and open an implementation PR.

Four review frames:
- Encounter: real paired-poem artwork, “Two readings. One picture.”, one obvious reveal action.
- Inspect: selected line stays visible; relevant ToUnicode/drawing explanation and source/run evidence open beside it.
- Change: Batch A links to the working legacy authoring section with a clear destination; Batch B replaces it with real in-place authoring. Do not fake a generated result.
- Compare: preserved original/alternate identities, recorded extraction from MuPDF/Poppler, exact source labels and accessible raw evidence.

Batch A ends with implementation evidence and a runnable local app. Do not expand into all later phases during this first brief. The review milestone is about UX quality, not waiting for permission to perform routine implementation steps.

## Checks proportional to this change
- Contract tests: valid existing records; missing/corrupt report; unsupported schema; hash mismatch; duplicate inventory; missing version remains unknown.
- Integration: production asset URLs and direct route reload; source hashes remain unchanged; new selection opens correct evidence and resets safely on specimen change.
- Browser walkthrough at 1440, 768 and 390px: cabinet → specimen → select → text/evidence → original download → back. Check focus, keyboard, reduced motion, loading/failure states and no console/request errors.
- Inspect actual screenshots of encounter, inspector and comparison; fix clipped stage, unreadable text and horizontal overflow.
- Run new typecheck/build/tests. Run relevant existing Node tests (`test-poems.js`, `test-cabinet.js`; other suites only when affected). Do not run full Python regenerators that overwrite historical outputs merely for a frontend change.
- Do not claim fresh engine validation from recorded JSON. If live extraction is needed for a later phase, run in temporary outputs and record exact environment.
- Add a new feature through a domain adapter rather than duplicating evidence parsing in components.

## Ownership, integration and rollback
Own `sideprojects/pdf-lab/workbench/**`, workbench docs and a new proposal/report. Modify existing generator/browser modules only when necessary for proven reuse, preserving legacy APIs and tests. Do not edit Commons, Observatory, presentation, output PDFs or historical evidence for Batch A.
Create a feature branch/worktree from refreshed main; do not reset another worker's checkout. Keep shell/selection integration under one owner. This brief does not require parallel workers.
Legacy cabinet is the fallback throughout. Removing the new workbench should leave all existing experiments usable. No root package migration, global toolchain changes, repository rename or deployment.
At handoff record base/head, changed paths, commands/results, screenshots, runnable URL/command, actual capabilities, remaining gaps and next packet. Add an assistant-authored proposal per AGENTS.md; do not write human review records.

## Selected repository handoff
New findings: existing narrow browser generation already solves a useful first authoring path; separate manifests and reports require an adapter, not a new evidence engine. Per-run versions differ. Existing form/viewer qualification remains open.
User direction: modular TanStack workbench, modern coherent Cisco-inspired shell, growth from existing product.
Proposed: Batch A scope, tokens, contracts, deterministic asset adapter, subsequent phase gates.
Open: exact live selection correspondence, later runner OS/boundary, import limits, public exhibition hosting, future instrument order.
Affected: this blueprint, Claude brief, supplied-research synthesis, README/PLAN entry links and assistant proposal. No experiments rerun; no application code changed.

Primary source links and reference status are in the research synthesis. Pinned project narrative:
https://github.com/blackmath88/baselhack26-open-presence/blob/283a85a602b4f7d562ee6c8bc9f417886de8ff42/docs/pitch/PHF-STORY.md

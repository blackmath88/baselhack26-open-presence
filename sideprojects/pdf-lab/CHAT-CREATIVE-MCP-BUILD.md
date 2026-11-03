# PDF LAB — Execution build plan: creative chat-to-PDF

Status: proposed implementation sequencing, 2026-11-02. Parent architecture: [CHAT-CREATIVE-MCP-PLAN.md](CHAT-CREATIVE-MCP-PLAN.md). No runtime or deployment is claimed.

## Objective and stopping rule

Make real strange PDFs from ChatGPT/Claude using one shared creative engine that the browser and CLI can also use. New reviewed generators become discoverable through a stable MCP interface. **Stop adding abstractions once a real file can be created, inspected, retrieved and refined.** Do not replace the existing cabinet or parallel workbench.

## Work packages

| Milestone | Time estimate | Dependencies | Deliverable | Acceptance |
| --- | --- | --- | --- | --- |
| B0 Audit and contract | 2–3h | Current repository instructions, code, PR state | Pinned inventory, project/v1, registry/v1, one valid and negative fixture | Existing generator constraints documented; no fake capability claims |
| B1 Creative generators | 3–5h | B0 | Existing dual-reading poem adapter plus independently different second mechanism | Real PDF bytes, hashes, repeatable fixtures, invalid inputs refused; second adapter registered without MCP handler changes |
| B2 CLI and MCP | 3–4h | B1 | Stable five-tool MCP, CLI sharing same validator/execution | Capabilities → example → validate → render → retrieve actual PDF and preview; MIME, hash, limits and traversal tests |
| B3 Inspection/evidence | 3–5h | B2 | Named engine adapters and evidence manifest | Exact engine/version/config; raw evidence; measured vs not_run/unsupported; no fabricated compatibility |
| B4 Workbench integration | 4–6h | B2–B3 and inspected existing UI | Reopen same project, generated PDF, previews, inspection evidence | Same IDs/hashes across UI, CLI, MCP; meaningful desktop/mobile/keyboard journey |
| B5 Experimental growth | later | B4 and security review | Third module and isolated new-mechanism experimentation | No untrusted code through public MCP; approved adapters only; tests and release gate |

Estimates are rough, not verified durations. B0–B2 constitute the first user-visible release; B3 and B4 may be developed in parallel after shared contracts settle.

## B0 — Source and contract checkpoint

- Read AGENTS.md, context packet, current main, relevant PRs, existing PDF generators, tests, and msteams-personas shared renderer/MCP.
- Try hosted knowledge/snapshot; record resolved commit, completeness and diagnostics or explicit access failure.
- Choose **one** module path under PDF LAB after inspecting the existing build and workbench layout. Avoid a new framework or service.
- Define minimal versioned capability registry and project schema. Parameters validated at runtime; stable IDs and versions; capability availability reflects installed engine.
- Output: architecture note and fixture; do not spend more than ~3 hours before moving to a real PDF.

## B1 — Creative proof

- Adapt the existing two-poem generator, respecting its current bounded ASCII/text constraints; create three variations from one recipe.
- Add one independently meaningful generator already present in PDF LAB (layer lock or glyph maze), but only after confirming it is safely parameterizable. If not, choose the simpler verified existing mechanism and record why.
- Persist immutable generated artifacts outside Git with SHA-256, parent recipe and generator revision.
- Negative cases: invalid text/parameters, output size, deterministic regeneration (or explicitly documented nondeterminism), incomplete writes, unsupported capability version.
- **Gate:** real PDFs exist and can be downloaded; the second capability appears via registry addition alone.

## B2 — Stable MCP and CLI

Reuse the msteams-personas interaction shape, not its M365 rendering implementation:

1. get_capabilities
2. get_example
3. validate_project
4. render_project
5. retrieve_artifact

- One shared operation for CLI, MCP and browser adapter. No second implementation.
- Server-generated render IDs; manifest-allowlisted artifact names; correct PDF/image MIME; binary retrieval tested, not just resource URLs.
- Local stdio first. For ChatGPT use only a supported secured connection; do not publish an unauthenticated server.
- Bound input, time, concurrency, output, storage and retention; cleanup on failure.
- **Gate:** a real assistant session completes all five operations and retrieves a PDF with verified bytes; record exact client/transport. If unavailable, mark client unverified rather than pretending.

## B3 — Evidence, not guesses

- Reuse existing recorded evidence carefully; do not present historical observations as a fresh measurement.
- Run bounded installed inspection engines for generated files, with exact version/settings and source hash. Keep visible, extracted, structural and behavior channels distinct.
- Report success, failure, not_run, unsupported and unknown independently.
- **Gate:** the assistant can retrieve an evidence report tied to the exact PDF and instrument run.

## B4 — One coherent visual journey

- Inspect current TanStack Workbench implementation before adding routes or migrating anything.
- Open recipe/project and generated artifact, preview it, inspect relevant mapping/layers, compare named observations, download the original.
- Preserve existing PDF LAB cabinet and format-bending storytelling.
- **Gate:** screenshot-reviewed, keyboard/mobile usable, source/evidence labels correct, deep-link reload works.

## B5 — Expand safely

- Add third capability without editing MCP handlers; test discovery/version negotiation.
- New arbitrary constructions belong in a separate offline, network-disabled, resource-limited development sandbox. They are not uploaded code through render_project.
- Review and release new adapters deliberately; dynamic loading of arbitrary plugins is not required.

## Agent split and integration

Lead/integrator owns contracts, review, tests and merges. Worker A owns registry/project validator; Worker B owns first generator and fixtures; Worker C (after B0) owns thin CLI/MCP adapter. Avoid overlapping files; integrate after B1 before extending. Do not launch agents unless a runner and permissions are verified. No automatic merge/deploy.

## First sprint: 2 hours, hard stop

- 0–15m: audit exact main/PRs and choose host.
- 15–35m: minimal registry, project example and validator.
- 35–70m: one real dual-reading poem generated with PDF bytes and hash.
- 70–95m: CLI plus MCP capability discovery, validate, render, retrieve.
- 95–110m: test retrieval and failure cases; attempt real assistant client if configured.
- 110–120m: screenshot/file evidence, report and PR. If client integration blocked, preserve working CLI and report the blocker. **Do not spend the sprint on experimental plugin infrastructure.**

## Completion and handoff format

For each milestone provide: baseline and head SHA, changed files, commands actually run, real PDF artifact and SHA-256, client/transport if used, screenshots, pass/fail/not_run checks, limitations, PR URL and next three priorities. Separate proposed, declared, observed, verified and superseded. No unapproved public uploads, services, model spend or deployment.

## Repository handoff

New plan: B0–B5 and bounded first sprint. Agreed direction: chat-generated real creative PDFs and discoverable future capabilities. Proposed decisions: static registry, stable five-tool MCP, dual-reading poem first, second existing generator. Open: hosting, actual client connection, retention, second generator, inspector availability and sandbox. Affected: this document; parent architecture plan unchanged.

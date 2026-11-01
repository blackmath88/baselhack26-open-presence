# Commons experience: phased build proposal

1 November 2026 · Perplexity (assistant) · Proposed sequence, no effort estimates or implementation claims.

Companion: ../product/COMMONS-EXPERIENCE-BLUEPRINT.md and ../product/COMMONS-REFERENCE-ATLAS.md.

## Constant north star

Every phase must look and feel like the agreed Cisco Cloud Control-inspired direction: clean, modern, calm, precise surfaces, clear selection/status and contextual technical depth. Transformer Explainer informs learning-through-working, not a competing visual theme. Do not ship a generic dashboard or a new style per module.

## Architecture boundaries

Verify the existing implementation before coding. Start from apps/commons and reuse actual service, corpus, validation, moderation, authorship, revision, contribution and route contracts. Preserve repository, HTTP, CLI and MCP entrances.

Proposed boundaries, not a directory-reorganisation mandate:
- Shell/routing: stable links, back/reload, query and selection context; no private draft text in URLs.
- Domain: existing source, evidence, problem/account, contribution, revision and relation contracts. Keep source content separate from interpretation.
- Features: discovery, account inspection, comparison, contribution preview and contextual mechanism inspection.
- Selection/navigation: share identifiers and context between views, not a second canonical store.
- Adapters: existing typed Commons client; optional lab or publication adapters behind verified boundaries.
- Execution/permissions: server validation and authorisation remain authoritative. Hiding a button is not access control.
- Persistence/history: backend domain state and history; explicit local draft persistence only if actually implemented; external publication state remains distinct.
- Tests/observability: deterministic domain/client checks, UI integration and browser journeys, actionable error reporting without leaking private drafts.

UI state: expanded explanation, compare selection, pending input, modal/focus. Domain state: accepted records/contributions/revisions. Derived output: ranking, comparison projection and explanation trace. External state: source availability, lab runtime, publication response. Do not collapse these into one optimistic success flag.

Small contracts to reuse or minimally extend only if needed: a search hit with its actual match basis; an account with captured conditions/passages/unknowns; a contribution preview with exact outgoing payload/destination; actual submission result; trace stages with origin and availability. Do not add a generic provenance platform or plugin system.

TanStack: user requests alignment with their practice, not a proven starter migration. Inspect https://github.com/blackmath88/development-practice and the actual Start Kit/starter it identifies. Verify versions, routing/auth/server compatibility and deployment implications. Prefer an incremental shell/client integration if justified. If migration is unnecessary or costly, present the trade-off and pause for approval. Do not introduce SSR, duplicate service endpoints or rewrite the backend just to use a framework.

## Phase 0: verified baseline and one visual checkpoint

User capability: existing real search-to-account flow remains usable while its next presentation is reviewed.
Reuse: current app, corpus, service, scripts and current source/review docs.
New work: baseline report mapping implemented screens/contracts and current test results; small token layer applied to one real result/detail state, not a standalone component catalogue.
Dependencies/uncertainties: actual branch/runtime; exact Cisco screenshot/theme; actual TanStack starter. Clearly label unavailable verification.
Acceptance: document runnable commands and results; capture current and proposed wide/narrow screenshots; identify what survives; review the real query with a source passage. Contrast/focus are checked, not assumed from hex values.
Defer: full migration, repo reorganisation, new backend, live lab/publication work.
Gate: human visual/interaction review of the first real screen before expanding the aesthetic.

## Phase 1: find and inspect, end to end

User capability: enter the real Mac/frame question, recognise an account, inspect evidence and a difference, follow the source and return without losing context.
Reuse: search reader/client, corpus, record/evidence components, routes and actual auth gate.
New modules/contracts: focused investigation presentation and shared route/selection state; extend search response only if needed to expose actual matching basis.
Dependencies: reproducible relevant account and near-match; backend availability. Do not pretend authenticated reads are public.
Acceptance: browser test search -> account -> passage/source -> back; reload/deep link; honest source/interpretation labels; loading/empty/error/partial states; keyboard-only and 360 px viewport; no mock success or fabricated quote.
Defer: comparisons beyond necessary near-match explanation, full lineage view, graph, new publication integration.

## Phase 2: understand a consequential difference

User capability: compare two actual accounts and explain why a similar symptom may not imply the same next step; open Why this matched.
Reuse: account/evidence identifiers and existing search semantics.
New modules/contracts: two-account projection and accessible inline match explanation; preserve query/selection in supported links.
Dependencies: actually captured conditions and actual match metadata; missing fields stay Unknown.
Acceptance: source links remain reachable from comparison; explain one matching circumstance, one difference and one unknown; change/remove a selection without losing the other; stale responses do not overwrite newer queries.
Defer: universal compatibility inference, arbitrary comparison matrices and AI-generated diagnosis.

## Phase 3: contribute and rediscover

User capability: write a small observation attached to an account/passage, preview exact disclosure, submit to the currently supported destination and find it again with honest visibility.
Reuse: composer, attribution/assistance, validation, permissions, moderation and existing shared-room submission. Do not reimplement an already working local/shared contribution path.
New modules/contracts: clearer preview/destination presentation and robust draft/error behaviour where missing.
Dependencies: actual destination/auth policy and submission semantics; verify duplicate/retry handling.
Acceptance: outgoing payload matches preview; private unrelated content excluded; rejected/failed submit preserves text; backend-confirmed identity/status shown; rediscovery through an existing entrance. If shared-room capability is available, verify a second participant can discover it; report local-only boundaries if not.
Defer: new OAuth/federation/public deployment, autonomous publishing and private-chat ingestion.

## Phase 4: inspect the mechanism on real material

User capability: follow an account from source to captured passage to interpretation/result, and a contribution to its actual destination; inspect what a selected observation responds to and what qualifies it.
Reuse: source references, relationship origins, revisions, available tracing and contextual navigation.
New modules/contracts: compact accessible lineage/context projection; add trace fields only where justified by actual execution.
Dependencies: trace coverage, captured historical material and declared relation origin. Lab integration optional and separately verified.
Acceptance: every displayed stage/edge points to actual evidence or explicitly says unavailable/not recorded; no fabricated complete pipeline; text alternative and keyboard navigation; selected object/context persist while changing depth.
Defer: global node-graph landing screen, broad crawling, speculative social relationships and infrastructure diagrams unrelated to the current action.

## Phase 5: validate and deepen the same model

User capability: reliably use the complete find -> judge -> contribute -> rediscover loop and reach expert depth without mandatory lessons.
Reuse: all earlier slices and ordinary repository navigation as a comparison baseline.
New work: observed exploratory sessions, targeted fixes and regression checks, not claims of statistically established benefit.
Dependencies: willing participants and an actual shared destination for community-loop testing.
Acceptance: record where people hesitate; can they explain applicability/mismatch, distinguish source/interpretation, name an unknown, reach original context and predict sharing? Record failures and evidence. Revisit disclosure if people miss important limits. Compare against a simpler view before adding visual complexity.
Defer: scale/impact claims, effort/date promises and unrelated feature suites.

## Cross-phase definition of done

- Existing capability and entrance regressions checked.
- Cisco-inspired hierarchy reviewed on real content, not only ideal fixtures.
- Keyboard, focus restoration, contrast, reduced motion and wide/narrow layouts verified where tools permit; unrun checks listed.
- Loading, empty, error, partial, unsupported and permission states addressed.
- Tests and screenshots identify command, branch/commit and actual result.
- No fixture/simulation presented as community activity or implemented capability.
- Handoff reports changed scope, reused work, checks, limitations and exact next review artifact.
- No automatic merge, deployment, public write or accepted-memory rewrite.

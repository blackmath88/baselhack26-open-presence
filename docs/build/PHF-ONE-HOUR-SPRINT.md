# .phf — one-hour parallel demo sprint
1 November 2026 · Requested by Achim · Prepared by ChatGPT / Codex.

## Outcome
Align the existing subproducts with one story and make the three demos clear:
**past / PDF Lab → future / .phf → present / Observatory**.
The middle receives about 65% of presentation time and the most implementation attention.
Use the existing build. Finish a demonstrable journey before adding features.

Read [story](../pitch/PHF-STORY.md), [build fit](../reports/PHF-STORY-BUILD-FIT-2026-11-01.md), root AGENTS.md and relevant subproject instructions.
The user explicitly asked for parallel UI implementation and naming alignment. This plan authorizes those bounded changes.
Detailed UI choices below are implementation recommendations, not additional human-approved product decisions.

## Shared naming and visual contract
| Surface | Visible name | Supporting line |
| --- | --- | --- |
| Presentation/project | **.phf** | **portable human format** / **trust in ai driven webspace** |
| Past module | **PDF Lab** | What survives when a document travels? |
| Main product | **.phf** | Human context that travels with the answer. |
| Main demo dataset | **Photo Frame Commons** | A real-source demonstration of .phf. |
| Present module | **Observatory** | Human and AI collaboration, made inspectable. |
| Supporting infrastructure | **Project Memory** | Evidence and decisions across time. |

Preserve upstream names in credits and history. Keep repository names, package names, namespaces, schema IDs, API routes,
storage keys and database formats unchanged. “Human Signal”, “Open Presence” and “br-ai-nstorm” can remain as attributed
historical/technical names; replace competing prominent product labels in the active experience.
No new .phf file format or proof-of-humanity claim.

Cool white / neutral grey, dark readable type, restrained blue accent, generous spacing and deliberate hierarchy.
Use existing components and fonts where possible. No warm cream, cockpit, rainbow badges or decorative graph.
One small original pixel time-machine car belongs to the presentation shell only. Reduced-motion and keyboard paths work.
Desktop presenting plus usable phone controls matter; no dependency on hover.

## Clock and dispatch
Four user-opened foreground sessions, A–D. No workers have been started by this plan.
T0 is when the user starts the sessions. Record the real start and target finish; report slippage rather than inventing a hard timeout.
No nested agents, new paid model calls, new credentials or public account publication. Use existing eligible session/runtime.
If a route is blocked, checkpoint and report; do not start a duplicate possibly-running worker.
- 00–05: inspect base and instructions, establish isolated worktree, identify the primary journey.
- 05–30: implement the smallest complete story-facing UI.
- 30–40: focused checks and actual browser walkthrough; capture evidence if available.
- 40–45: checkpoint, push branch, open PR, publish handoff. Stop scope growth.
- 45–60: D integrates settled branches and rehearses the combined experience. A/B/C fix only reported defects within their owned paths.
If finished early, hand off early. If setup consumes the window, deliver a smaller functioning slice.

## Bases and branch discipline
Open Presence inspected main: **4c998e90408100de4b04c8af83b0024d9f3c0162**.
Observstory inspected main: **75f9e660f7aa8506ff047073b5caf97f1ed45a61**.
Planning changes are on **docs/phf-three-part-story**. Fetch current main; if it contains this plan, use that exact main head.
Otherwise branch A/B/D and C's consumer work from the planning branch. Record the actual base SHA.
Recheck concurrent PRs before editing; the inspected hashes are an orientation baseline, not authority to overwrite newer work.
Each session uses separate worktrees. No force pushes, no shared working directories, no overwriting dirty files.
A/B/C open PRs and do not merge. D is the integration owner; review exact diffs and required checks before normal merges.

## A — .phf core experience (highest priority)
Repository: blackmath88/baselhack26-open-presence.
Branch: feat/phf-core-demo.
Write only: apps/commons/src/**; apps/commons/index.html; apps/commons/README.md;
apps/commons/scripts/smoke/** for focused UI smoke; docs/reports/PHF-SPRINT-A.md.
Do not edit server contracts, package/lockfiles, corpus, root docs or other modules.

Produce a clear product experience over the real existing Commons service:
- Make .phf the primary name; Photo Frame Commons describes the demo case.
- Lead with a recognisable question and a useful search entry, with a visible repository entrance.
- Results expose applicability; a source inspector clearly separates original author/quote from agent interpretation.
- A contribution makes voice, circumstances, source passage, assistance declaration and destination understandable.
- Make preview → local submission → reply/correction → rediscovery a coherent visible journey.
- Keep the source and parent accessible. Do not flatten disagreements into a synthetic final answer.
- Provide a good empty/service-unavailable state and an obvious way back to the presentation.
- Small in-context demo hints may guide the presenter; never seed fictional activity as real community evidence.

Accept: the existing “My Mac cannot see my frame” search works against the real server; a staged observation
cites a passage, survives reload, accepts a second participant's reply and is rediscoverable through another entrance.
No source or author label is lost. Check at desktop and phone width and with keyboard.
Run typecheck/build and the relevant existing UI/live-server smoke if runtime permits. Never report skipped checks as passed.
Return exact URL/start command, commit, PR, screenshot or honest unavailable note, checks and remaining limitations.

## B — PDF Lab opening
Repository: blackmath88/baselhack26-open-presence.
Branch: feat/phf-pdf-opening.
Write only: sideprojects/pdf-lab/** EXCEPT existing output/**, evidence/** and research/**;
new screenshot evidence may go in sideprojects/pdf-lab/evidence/phf-sprint/;
modules/pdf-history/index.html and modules/pdf-history/README.md;
docs/reports/PHF-SPRINT-B.md.
Do not modify measured results or generators to fit the pitch; preserve existing specimens.

Produce a short, striking entrance to the existing cabinet:
- PDF Lab keeps its identity and weirdness; the story makes its question immediately clear.
- Provide a guided 60-second presentation path into the existing paired-poem / alternate-reading experiment.
- Show the actual visual artwork and recorded/executed text reading side by side, then reveal the mechanism.
- Keep engine scope and measured vs live distinctions close to the comparison.
- Retain access to the wider cabinet without making the presenter navigate it first.
- End with the bridge: “What should survive when an answer travels through AI?” and a return to the presentation.
- The PDF-history page may point into this guided opening; do not rebuild historical research.

Accept: direct URL to the opening, one intentional reveal, real specimen links, no console errors,
usable phone layout, keyboard controls and no universal viewer/forgery claims.
Use existing relevant poem/browser tests if touched; no broad regeneration.
Return URL, scope, commit, PR and evidence.

## C — Observatory closing
Repositories: blackmath88/observstory (producer) and blackmath88/baselhack26-open-presence (consumer).
Branches: feat/phf-observatory-close in each repository, separate worktrees.
Producer writes: frontend/src/**, frontend public assets only if required, frontend-local tests;
docs/reports/PHF-SPRINT-C.md (create under existing docs structure).
Consumer writes: .observstory/knowledge.json, .observstory/workspace.json, OBSERVSTORY.md,
docs/reports/PHF-SPRINT-C.md. No workflow edits; D alone updates the producer pin.
Do not change coordination decisions or create human review records.

Produce a 45-second closing journey:
- Consistently label the visible product Observatory, retaining Observstory as implementation attribution.
- Present it as today's place for humans and agents to inspect project intentions, evidence and change.
- Give a clear route from a concept/decision to its cited source and status/history where implemented.
- Add selected, source-backed records for the .phf story and real implementation evidence to the consumer manifest.
  Inspect supported record types/statuses first; do not invent a schema. Distinguish a proposed plan from implemented work.
- Preserve stale-data, incomplete-coverage and source-revision mismatch warnings.
- Avoid a dashboard of invented live agent activity; Project Memory runtime remains separately verified.
- Keep producer UI reusable: project-specific .phf copy belongs in consumer data, not hardcoded global branding.

Accept: a presenter can open the real .phf story and an implementation evidence record and understand their different status.
Render against actual consumer data. Run producer required focused frontend checks plus manifest validation/build.
Return two PRs if needed, precise producer SHA, consumer data changes and local render instructions.
Do not declare the published site updated just because producer code is merged.

## D — Presentation shell and integration
Repository: blackmath88/baselhack26-open-presence.
Branch: feat/phf-story-demo.
Write initially: presentation/**, docs/reports/PHF-SPRINT-D.md.
During integration only: README.md, DEMO.md, .github/workflows/observstory.yml, scripts/stage-phf-presentation.*
and correction of cross-module links by agreement with the owning stream.
Do not edit A/B/C-owned product files while those sessions are writing.

Produce a clean, browser-based three-part presentation shell:
- Title exactly .phf / portable human format / trust in ai driven webspace.
- Past / future / now navigation; middle visibly dominant. One small original pixel car transition if useful.
- Concise narrative beats and launch buttons for real app surfaces, not fake product screenshots disguised as working UI.
- Presenter-selectable URLs for Commons, PDF Lab and Observatory. Persist only nonsecret local settings.
- Offline shell works; unavailable services are identified with usable run instructions.
- Keep narrative mode usable on a phone; links must not assume the audience's localhost is the demo host.
- Prefer links/new tabs over brittle cross-origin iframes. No tokens/passwords in URLs, HTML or screenshots.
- Default local contract: presentation on :8001, PDF Lab on :8000, Commons UI :5173/API :8787,
  Observatory local preview from its documented build or the published URL. All endpoints are configurable.
- Each product's handoff supplies its exact opening URL; reconcile those after streams settle.

Integration:
1. Inspect A/B/C PR diffs, actual checks and any unsettled sessions. Merge only settled, scoped changes with required checks passing.
2. Merge producer C first, verify its exact main commit, then update the consumer workflow action pin to that reviewed SHA.
3. Reconcile root demo links/naming and stage presentation + PDF assets under /presentation/ and /pdf-lab/ in the existing Pages artifact if safe.
   Preserve the Observatory root and its generated data. Do not publish private runtime data or pretend Pages hosts Commons.
4. Run the combined main UI/build checks and the concrete find → inspect → contribute → reply → rediscover rehearsal.
5. Verify hosted paths after the existing main workflow completes; if unreachable, report that instead of “live”.
6. Record exact commits, checks, actual URLs, failures and fallback. Do not reset the one-hour budget when integration begins.

The request authorizes UI changes and integration into the existing project. Use the established Pages workflow only;
no new hosting provider, public Commons server, public ATProto write or private NUC access without an available authorized route.
If checks or access block merging/deployment, leave reviewable PRs and explicit blockers rather than bypassing gates.

## Shared handoff format
Each stream's report: actual base/head, files changed, observable behavior, commands/results,
demo URL, screenshot path if available, limitations, PR URL, session status (finished or still active).
Do not include credentials, private chats or machine configuration details.
A summary claiming “done” does not substitute for evidence.

## Coordinator ledger at planning time
| Stream | Owner | State | Depends on |
| --- | --- | --- | --- |
| A | User-opened session A | Not started here | Shared story/naming contract |
| B | User-opened session B | Not started here | Shared story/naming contract |
| C | User-opened session C | Not started here | Shared story; actual producer/consumer bases |
| D | User-opened session D | Not started here | Shell independent; integration waits for A/B/C |

No sessions or timers have been launched, and no remote runtime readiness has been verified by writing this plan.

# Observatory visual workspace — implementation plan
31 October 2026 · Prepared by Codex from Achim's selected conversation handoff.

## Status and authority
The user requested this plan and a Codex implementation prompt. The product and style requirements below reflect the user's explicit corrections and approval. Component names, schema shape and sequencing are implementation proposals. This document does not claim implementation, verification, human review of proposals, or authorization for a new deployment.

## Verified starting point
Open Presence main and hosted knowledge/snapshot resolve to 69bd6f2545a4248e1a7e166394ffd55203a32651 at planning time. Knowledge complete=true, zero diagnostics. Refresh these sources before coding:
- https://blackmath88.github.io/baselhack26-open-presence/data/knowledge.json
- https://blackmath88.github.io/baselhack26-open-presence/data/snapshot.json

The deployed UI is the TanStack frontend from blackmath88/observstory at af5b2d725301f46ee1796b3d215fd90694fb8c12. Source branch at inspection: feat/frontend-tanstack-start. Open Presence's .github/workflows/observstory.yml pins that commit and sets frontend: observatory. The consumer publishes event.json separately. Inspect current branches/PRs before choosing the implementation base; preserve ongoing work.

Implementation ownership:
- blackmath88/observstory: frontend/, reusable data adapters/contracts, release packaging.
- blackmath88/baselhack26-open-presence: declared project/workstream data, this specification, consumer workflow and producer pin.
- Knowledge Lab/NUC: separate runtime, not required for this UI slice.
Do not rebuild this dashboard in apps/commons or create another site. Preserve the Commons/community multi-entry plan; it is a different product slice.

## Agreed direction
A context-preserving project workspace. Understand the shape of the work before reading details.
- Visual means layout and functional components, not decorative imagery.
- Research, concepts, planning and implementation have equal standing; they are types, not mandatory sequential phases.
- Purpose first, stable workstreams in the centre, meaningful time within the rows.
- Side explorations and supporting/meta projects preserve their origin and a route back. No diagnosis or automatic judgment of distraction.
- Overview and a shared detail drawer first; Board over the same records next; local relationships before a whole-project map.
- First view: what are we trying to achieve, what is active, what needs judgment, where can I resume?
- Details, sources, logs and history belong one layer deeper.

The earlier warm-paper/petrol styling and illustrated studio mockup are superseded as visual directions. Do not use their pictures or invented example status as project data.

## Visual system
Apple-like finish, Linear-like density, Observatory's branching structure.
| Token | Initial value | Role |
|---|---|---|
| canvas | #F5F5F7 | cool light grey, never cream |
| surface | #FFFFFF | drawer and elevated controls |
| text | #1D1D1F | primary text |
| separator | #E5E5EA | fine visual divisions |
| focus | #007AFF | selection and active navigation |
| exploration | #8B7BC8 | branch rails and relationship emphasis |
| attention | amber | explicit judgment requests |
| success/error | semantic green/red | verified result or explicit failure, paired with words |

Treat these as starting design tokens. Check text contrast and adjust foreground variants; pale violet and amber are not body-text colours. Keep readable sans-serif/system fonts, monospace only for time/revisions/technical details. Subtle elevation, restrained radii, compact controls, excellent alignment. No giant hero, decorative photos, gradients, excessive translucency, dashboard tile wall or badge clutter. Workstreams share a continuous surface. Motion preserves orientation and respects reduced motion.

## Layout and interaction
Desktop:
1. Compact project mission and next outcome; freshness visible but secondary.
2. Overview / Board navigation; Data sources and existing replay/classic views remain accessible.
3. Wide stable workstream rows: expand control, title, type/status, one short context cue, timeline if dates exist.
4. Narrow Needs you and Resume area; neither competes with the main surface.
5. Selected row gets a light blue wash and opens an anchored detail drawer. Restore focus, scroll and expansion when closing.

Timeline:
- Fixed workstream labels, horizontal time axis, vertical Now line.
- Planned intervals outlined; observed events shown as point marks; milestones diamonds.
- Do not infer duration from first/last commit. No dates means no bar, not no visibility.
- Undated research stays in its workstream with explicit 'No date'.
- Event time, planning time and ingestion time remain distinct.
- Coarse dates stay coarse. Targets are not deadlines.
- Keep events sparse; group dense events with an inspectable count.

Branches:
- Shallow expandable child rows; violet connection to origin.
- Distinguish explores_for, supports, spawned_from and blocks.
- A stopping point and next action support Resume.
- A finding may inform the parent while the branch remains open.
- No relationship inferred solely from folders or branch names.
- Stable ordering survives refresh; new activity never reshuffles the workspace automatically.

Board:
- Same canonical records and selection; grouping by explicit status.
- Type and status separate. Unknown/undeclared has a labelled place.
- Initial board is read-only: no fake drag-and-drop persistence.

Detail:
Context / Material / Resume / History sections. Show why the item exists, relationships, source links, typed timestamps, stopping point and available observed events. Preserve declared/proposed/superseded distinctions.
Mobile around 390px: mission, judgment/resume, then workstreams; row details become a full-screen route with reliable Back. Timeline can scroll inside its own container, not overflow the document. Keyboard and touch equivalents for all actions; no hover-only meaning.

## Data contract and truthful defaults
Reuse snapshot, scene, knowledge and event inputs. Add only the optional source-owned workspace declaration required to model stable workstreams, relationships and resume notes, with a schema and versioned public projection. Suggested source: .observstory/workspace.json; suggested output: data/workspace.json. Inspect existing contracts first and adapt if an equivalent already exists.

Minimal declaration: stable IDs, title, kind, optional explicitly declared lifecycle state, ordered memberships, typed relations, source references, optional planned dates with precision, explicit human-attention requests and resume context. UI state (expanded rows, selected record, zoom) is separate and may persist locally. No credentials, private chats or host paths in public output.

Canonical project data and observed artifacts remain separate. PR merged does not mean deployed or accepted. Recent activity does not mean active, inactivity does not mean blocked. Do not manufacture task ownership, dates, progress percentages, stopping points or approved concepts. Suggested mappings are labelled proposed. Missing declarations show unknown rather than an invented backlog.

Without workspace declarations, use a documented deterministic fallback from existing selected records and area groupings, label it derived, and expose missing context. Missing/stale/invalid sources retain honest failure states. Make mismatched source commits visible where available instead of implying atomic freshness.

For the first consumer declaration, select only deliberately public repository facts and already declared decisions. Use synthetic fixtures for paused/blocked/resume cases that lack real data; never publish fixture content as project state.

## Build sequence
1. Orient and establish ownership. Read AGENTS.md in both repos, inspect latest source/PR state, preserve uncommitted work. Create isolated implementation branches from the correct current frontend base.
2. Introduce one normalized workspace projection and the smallest optional declaration schema. Implement fallback, provenance and deterministic ordering. Reuse existing evidence semantics; do not duplicate the memory reducer.
3. Replace the overview layout with mission, workstream rows, restrained timeline, branch expansion, Needs you/Resume and detail drawer. Use the real consumer data immediately, with gaps visible.
4. Add the simple Board projection, selection persistence and local relationship inspection. No full graph editor or server required.
5. Apply the cool premium design consistently, including empty/loading/error states, mobile and keyboard handling.
6. Package the producer release, prepare the consumer data/workflow integration and pin update against the tested producer commit. Open linked PRs and document the demo path, validation and remaining limitations.

Ship a complete reviewable slice. Do not spend the whole task writing another plan or mockup. Do not expand into agent orchestration, paid indexing, ATProto, a new database or a general project-management backend. Do not silently merge or deploy the redesign; prepare it for review.

## Focused acceptance
- Real project mission, selected context and actual source freshness remain accessible.
- Research/concept/plan records without dates remain on the first surface.
- One record has consistent type/status across Overview, Board and detail.
- User can identify active/unknown work and human judgment requests without interpreting raw PR feeds.
- A synthetic paused supporting branch demonstrates origin → stopping point → next action → parent return.
- Planned dates never look like observed duration; merge never masquerades as deployment.
- Failed/partial/mismatched data stays visibly qualified.
- Selection, focus, row ordering and expansion are stable through drawer use and refresh.
- Inspect 390, 768 and 1440px, keyboard, reduced motion, deep links and reload under the Pages subpath.
- Existing frontend test/typecheck/lint/build checks pass; add meaningful tests for projection semantics and the integrated navigation path, not appearance snapshots of implementation details.
- Run npm run release and the producer's release-packaging tests. Do not hand-edit generated release assets.
- Deliver screenshots and a working local preview plus exact commits and linked producer/consumer PRs.

## Selected repository handoff
Findings: the deployed app presents information clearly but primarily as text panels; the frontend and source consumer are separate repos.
Agreed: research/planning first-class; structured visual UI; branches and resumption; cool white/grey, blue focus, violet explorations; warm paper rejected.
Proposed: component composition, optional workspace schema, phased implementation and read-only first slice.
Open: how explicit status/resume declarations will be authored after the first slice; current NUC availability; whether a broader Map is useful after local relationships work.
Affected: observstory/frontend and optional reusable publication contract; this repo's .observstory declarations, workflow pin and README.
No new project-product decision, human acceptance record or runtime readiness is asserted.

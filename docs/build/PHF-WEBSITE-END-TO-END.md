# .phf website — story, navigation and working experiences

1 November 2026 · ChatGPT / Codex (assistant) · Proposed implementation plan.
Repository inspected at 1e53da9f690d3c4ea192056d858e99cb5403d8cb.
This plan changes no runtime, deployment, accepted decision or human review record.

## Outcome

One public entry point explains .phf and lets someone use its working tools.
Visitors can follow the three-part story or enter any tool directly. Leaving the story
must not lose their place; returning must not reset their work.

Name: **.phf [portable human format]**.
Subtitle: **trust in ai driven webspace**.
Primary promise: **Human context that travels with the answer.**

The website is the umbrella. Commons is the main product demonstration.
PDF Lab opens the question; Observatory shows today's practice. E is an optional guide.
The site must not suggest that .phf is an established file standard or certifies human authorship.

## 1. Hard repository assessment

| Evidence in inspected code | Consequence |
| --- | --- |
| apps/commons/src/components/phf/PhfShell.tsx already provides identity, participant entry, unavailable state and a five-step guide | Reuse it; do not build a second Commons or replace its real service with landing-page mock data |
| apps/commons/src/commons/client/journey.ts defaults presentationUrl to port 8001 | The return link assumes a presentation service that is not delivered in a presentation directory on main |
| sideprojects/pdf-lab/opening.html and opening.js already implement the short PDF demonstration | Reuse this opening; replace inferred return destinations with configured chapter links |
| Workbench is TanStack Start with a server handler; scripts/serve.mjs serves dist/client plus dist/server | Copying dist/client to Pages is not a verified deployment solution |
| Workbench Shell.tsx only connects its cabinet, specimen and legacy cabinet; features/legacy.ts guesses port 8000 | It lacks shared .phf navigation and a story return |
| apps/commons/vite.config.ts proxies /api and /mcp only in development | A Vite production build alone does not provide the service |
| apps/commons/server/http/server.ts runs the Commons service on loopback with prototype auth | Runtime, persistence and a deliberate demo access policy must be included in delivery |
| apps/commons/README.md explicitly warns that inherited Cloudflare examples do not provide Commons; worker/services.ts and worker/api.ts are separate upstream adapters | Do not run npm run deploy and assume the .phf service is hosted; evaluate a port separately if desired |
| .github/workflows/observstory.yml deploys Observatory at the Pages root and E preview under /e/ | Preserve this existing root and its /data/ consumers during the first release |
| EGuide.tsx side missions link to GitHub source folders | Those are source links, not usable app entrances; supply actual destinations through configuration |
| PRs #35 → #36 → #37 contain Cisco phase 0, find/inspect and comparison; #38 is a competing draft phase-0 implementation | The redesign has been implemented on branches, but is not yet on this main. Integrate one lineage after review, not both styles |
| PR #31 live PDF runner remains at 9b68ac7; prior fixture-validation findings remain applicable | Keep live engines outside the first shared-site release |
| No site-level journey test or combined production launcher was found | Individual app checks cannot establish the complete visitor experience |

The hosted knowledge export was read during this inspection: resolved_commit 1e53da9,
complete=true, 15/15 selected sources read, no diagnostics.
The context packet cp_7cdc6f026054f6d6650d202f has an older cutoff; it is historical context.
This assessment is code/configuration review, not a fresh browser walkthrough or runtime test.
Open-PR implementation claims require integration verification before being labelled delivered.

## 2. Landing-page experience

A calm editorial page, using the emerging Cisco-inspired surface hierarchy and a distinctive
.phf identity. Cool white, clear typography, restrained blue selection, generous reading space.
Avoid a dashboard of equal cards: the middle chapter carries most of the visual and narrative weight.

Persistent navigation: **.phf / Story / Commons / PDF Lab / Observatory**.
The brand returns to the website home; each app retains a separately labelled app home.
Mobile navigation remains keyboard accessible and keeps the current destination apparent.

### First screen

- .phf name and subtitle, then: "Human context that travels with the answer."
- Short introduction: "A document carries information. An answer should carry its sources,
  circumstances and the people behind it. Explore what survives the journey."
- Primary action: **Try .phf Commons**.
- Secondary action: **Follow the story**.
- A compact three-chapter index: Past / Future / Now.
- Use a real source passage or actual product capture as the central visual, with provenance.
  Any static capture is labelled as a preview and opens the working experience.

A newcomer must know what they can do before scrolling. Returning users can enter an app immediately.

### Past — What survives the journey?

Short, tangible setup: the familiar promise of a PDF, followed by one picture with two readings.
Use the existing opening demo, not a new simulated PDF parser.
Actions: **Explore the PDF experiment** and **Continue to human signals**.
The full cabinet and Workbench remain optional deeper exploration.

### Future — What stays human?

The largest chapter, explaining Commons with one concrete situation:
"My Mac cannot see my frame."

Show a real account, its exact source passage, applicability limits and how an observation
can become useful to another person. Clearly separate original words from interpretation.
Actions: **Try the example** and **Browse the captured community**.

The usable path is:
enter → choose a clearly labelled demo participant → search → inspect passage →
preview observation → submit to the stated shared demo room → switch participant →
reply → rediscover through another entrance.

Comparison from PR #37 is useful depth, not a mandatory extra step in the short story.
Search, repository navigation, direct links, CLI and MCP remain entrances to the same service.
Do not turn the landing page into a compulsory funnel.

### Now — Where we shape this future

Show one actual Observatory concept/source/status relationship, with snapshot commit and time.
Explain that this is how we make human–AI collaboration inspectable today.
Actions: **Open Observatory** and **See the source**.
Do not describe a generated snapshot as live agent execution or imply the unverified NUC runtime is running.

### Close and supporting material

Return to the promise, with a direct Commons entry and links to the source and limitations.
PDF history, E preview and deeper research sit under optional exploration.
No invented user counts, testimonials, trust scores or public-federation claims.

## 3. Navigation and state contract

Use one small, versioned destination manifest consumed at build time by each app.
Proposed location: site/destinations.json. It contains public URLs, not secrets or backend state.

Keys: storyHome, storyPast, storyFuture, storyNow, commonsHome, commonsExample,
pdfOpening, pdfWorkbench, pdfCabinet, pdfHistory, observatoryHome, ePreview, sourceRepository.
Separate local and hosted build profiles. Validate HTTP(S) URLs and required entries.
A hosted profile must reject localhost, loopback and guessed development ports.

- Preserve Commons hash routes and existing canonical record IDs.
- Preserve Workbench specimen/query parameters; do not overwrite them with story navigation.
- Use explicit chapter return links. No arbitrary external return redirect supplied by a visitor.
- Story location is a URL fragment; app domain state stays in its existing store.
- No participant token, private draft or contribution body in cross-app URLs.
- Navigating back to the story must not reset demo progress or persisted app drafts.
- Unsubmitted-form navigation offers the existing draft protection, or a clear confirmation if missing.
- E gets configured mission destinations; keep a separate secondary source link.
- Use ordinary links across apps, not iframes or a new microfrontend framework.
- An app shell's return link and app home are different destinations.
- New destinations get loading/unavailable states with retry and a working story return.
  A failed service must not silently become a screenshot or local fake success.

## 4. Deployment recommendation

Deliver in two explicit milestones, keeping existing URLs stable.

### Milestone A — connected local production rehearsal

Create a small static story app at apps/story (Vite + React is sufficient).
Reuse E through a narrowly extracted shared component only if needed; do not import Commons App
or its backend into the story bundle. Reuse existing UI assets with attribution.

Create a root script that builds and starts:
story, Commons built frontend + Node API, Workbench production server, and the allowlisted PDF cabinet.
Use a single configuration and readiness report; stop child processes cleanly.
Use a temporary, isolated demo data directory for rehearsal and an explicit reset command.
Do not destroy the user's existing Commons data when resetting presentation state.

Initially distinct local origins are acceptable behind configured URLs. Verify all return paths.
This is a complete rehearsal environment, explicitly not the public release.

### Milestone B — public usable demo

Recommended first hosting topology:
- Existing GitHub Pages: Observatory root remains unchanged; story added under /story/;
  /e/ preserved; published PDF opening/cabinet/history assets copied from an explicit allowlist.
- A Node-capable host: Commons UI and /api + /mcp on the same origin, with durable demo storage.
- Workbench: its existing production Node handler on a separate configured origin.
- Every surface links through the same hosted destination manifest.

This avoids an unverified TanStack subpath migration or porting Commons to the inherited Worker.
A dedicated .phf domain/root can follow after the end-to-end path works. It is not a prerequisite.
If one-origin paths are chosen later, test Vite asset bases, Start router/server base paths,
API ownership and reloads before switching URLs. Preserve old Observatory and /data/ URLs.

Do not add a second independent Pages deploy job: compose the story and PDF assets into the
existing Pages artifact before its upload. A later Observatory rebuild must not erase the story.

Public Commons is a separate release gate:
- Explicitly labelled, isolated demo identities and contributions; never claim verified identity.
- Enforce access and write limits server-side. Review prototype role privileges, moderation,
  contribution limits and reset/retention; do not expose unrestricted curation controls.
- Use persistent storage, verify restart survival, and keep demo writes away from real user data.
- Keep public ATProto publication off unless separately configured and verified.
- Verify the deployed API/MCP and UI operate on the same canonical records.
- If this gate is unfinished, publish the story as a preview with an honest Commons status.
  Do not call that milestone end to end.

Host/account/domain provisioning remains unverified. Select an available Node deployment target
during execution; this plan does not assert that a hosted endpoint already exists.
No new LLM service or framework migration is required for this release.

## 5. Bounded implementation streams

| Stream | Owned work | Depends on | Reviewable completion |
| --- | --- | --- | --- |
| A: story | apps/story, chapter content and responsive design | Destination key names | Landing + three chapters on real content; direct and guided entrances |
| B: bridges | Destination loader and thin app navigation adapters, E links | Stable contract; Commons branch choice | Story → each app → same chapter; deep links and draft handling preserved |
| C: runtime | Combined launcher, production hosting config, storage, Pages composition | Destination contract; target host | Fresh start succeeds; public readiness and persistence gates pass |
| D: verification + video | Site-level browser journey and capture notes | A–C integration | Full journey on phone/desktop; 35/115/30-second capture sequence |

An integration owner establishes destination keys first and owns shared configuration.
A must not edit Commons investigation UI; B must coordinate with #35–#37 rather than overwrite them.
C alone owns Pages workflow edits, preserving the newly merged E build step.
D verifies actual behavior; it must not auto-submit to upstream repositories or publish externally.

Recommended order:
1. Choose/review the Commons #35–#37 lineage versus #38; retain E integration from main.
2. Commit destination contract and one runnable story → Commons → story slice.
3. Complete PDF and Observatory bridges while runtime packaging proceeds in parallel.
4. Verify the local production rehearsal with actual contributions and rediscovery.
5. Finish public demo gates, deploy approved destinations, then verify from a clean browser.
6. Capture the existing three-minute script; refine copy to match what is actually delivered.

Do not hold the shared shell behind completing every Commons UX phase or the live PDF runner.

## 6. Acceptance: when we can say end to end

- From a fresh browser, a visitor understands the purpose and can enter any app.
- Guided story works past → future → now; Commons receives most attention.
- PDF opening fetches its real specimen/evidence; Workbench can generate and download a variant.
  "Not measured" remains correct unless actual live measurement has occurred.
- Commons example opens, survives participant selection, and preserves the question through
  record, source, back, reload and comparison where implemented.
- A preview shows the actual outgoing observation and destination; a second participant can
  discover the submitted observation through search/repository and reply to it.
- CLI or MCP retrieves that same observation, proving the architectural promise.
- Returning to story resumes the correct chapter without silently resetting work.
- Observatory shows a real source/status with snapshot provenance.
- Offline/unavailable runtime produces a truthful explanation and a usable escape route.
- Keyboard, focus restoration, reduced motion, 360px and desktop layouts work.
- No public link points to local ports, a missing presentation folder or a source directory
  labelled as an app. PDF downloads preserve bytes/hashes.
- Pages rebuild preserves /story/, /e/ and existing knowledge endpoints.
- Public contribution survives a runtime restart; configured reset affects only demo data.

Use existing Commons and Workbench checks, then add a small cross-app browser suite covering
these integration boundaries. Do not duplicate all unit tests in the site.
Record exact commit, commands, URLs, screenshots and any skipped public verification.

## 7. Video alignment

Use docs/pitch/PHF-THREE-MINUTE-VIDEO.md:
35 seconds PDF / 115 seconds Commons / 30 seconds Observatory and close.
A manual presentation mode can hide nonessential chrome and pause E's ambient behavior.
It must use real app actions, with no timed auto-submission or fake completion.
The website remains useful outside the film; watching three minutes is never required to enter.

## First implementation assignment

Build the shared destination contract and apps/story first slice against current main.
Implement the real story → Commons example → story return using existing contracts.
Keep public runtime readiness separate from visual completion.
Provide the runnable command, wide/narrow screenshots, actual navigation checks and next gap.
Do not migrate frameworks or implement a second Commons. Do not modify competing UI branches.

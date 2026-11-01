# .phf [portable human format]
**trust in ai driven webspace**

BaselHack 2026 · Updated 1 November 2026

[One-hour parallel UI sprint](docs/build/PHF-ONE-HOUR-SPRINT.md) · [Three-part pitch and demo story](docs/pitch/PHF-STORY.md): **past — PDF / future — .phf / present — Observatory**. The middle is the main concept and working demonstration. [Story/build fit and remaining checks](docs/reports/PHF-STORY-BUILD-FIT-2026-11-01.md).

.phf is the agreed project name. The implementation remains Photo Frame Commons; this naming change does not introduce a .phf file format or certify human authorship.

**Find experience that fits your situation. Understand its limits. Leave something useful for the next person.**

Start with [the current concept](HUMAN-SIGNAL-CONCEPT.md).

[Shared website and end-to-end integration plan](docs/build/PHF-WEBSITE-END-TO-END.md) — proposed landing page, app navigation and public-runtime delivery.

## Start here

| Experience | What it does | Open / run |
| --- | --- | --- |
| **Photo Frame Commons** | Find, inspect, contribute and rediscover through browser, repository navigation, CLI or MCP | [Demo and commands](DEMO.md) · [application](apps/commons/) |
| **Observatory workspace** | Project knowledge, workstreams, board, timeline and source evidence | [Published workspace](https://blackmath88.github.io/baselhack26-open-presence/) · [guide](OBSERVSTORY.md) |
| **PDF Lab** | Real PDFs, alternate readings, layer logic, file identities and transformations | [Cabinet and run instructions](sideprojects/pdf-lab/README.md) |
| **PDF Workbench** | Inspect two readings of one PDF; write and download your own second reading | [Run and demo](sideprojects/pdf-lab/workbench/README.md) |
| **PDF history** | The optional story of a recognisable page travelling between software and people | [Guide](modules/pdf-history/README.md) · [offline HTML](modules/pdf-history/index.html) |
| **Project Memory** | Revision history and reproducible collaborator context | [Knowledge Lab](https://github.com/blackmath88/baselhack26-knowledge-lab) · [handoffs](docs/memory/README.md) |

[Three-minute video script and shot plan](docs/pitch/PHF-THREE-MINUTE-VIDEO.md).

The workspace is a generated static snapshot. Commons and Project Memory run locally; opening the published workspace does not start their services.

## Run Commons locally

Requires Node.js 22 or newer and npm.

```bash
cd apps/commons
npm ci
npm run dev:server   # terminal 1: API and MCP on 127.0.0.1:8787
```

In a second terminal, run `cd apps/commons && npm run dev`, then open http://localhost:5173.
Choose a prototype participant and search **“My Mac cannot see my frame”**. Inspect evidence, preview an observation and submit it to the local room. [DEMO.md](DEMO.md) covers repository, CLI/MCP and passage-reply journeys.

Prototype sign-in is for local use; do not expose this server publicly. ATProto publication/ingestion has been exercised against an isolated development PDS, not public federation.

## What works on main

- A pinned public corpus supplies 18 photo-frame problem records with source references and applicability limits.
- Browser, repository navigation, HTTP, CLI and MCP share one Commons service.
- Contributions retain authorship, assistance declarations, revisions, sources and exact evidence passages. Replies and shared-source links lead back into discovery.
- Shared validation and moderation apply across entrances, including command replay.
- PDF Lab has 27 source specimens, four transformation derivatives and a separate minimal-mapping experiment.
- Observatory's implemented static frontend preserves unknowns, input mismatches and declared status.
- Project Memory's contract and durable host are merged in the producer/host repositories. The installed NUC runtime needs separate verification.

The [current integration review](docs/reports/PHF-INTEGRATION-2026-11-01.md) records checks and limitations. [BUILD-STATUS.md](BUILD-STATUS.md) retains dated execution history, not a current task queue.

## Why this experiment

Three agreed use cases:

1. **Has someone encountered my situation?** Find a relevant account and see why it matches.
2. **Does this advice still apply?** Inspect conditions, disagreement and later corrections.
3. **We learned something others could use.** Leave a small, attributable contribution.

The surrounding conversation matters: questions, failed attempts, versions, screenshots, corrections and follow-ups. Authentic means attributable and inspectable here, not certified true or necessarily written without AI. Community value still requires people discovering and using one another's contributions.

[Value and UX](docs/product/VALUE-AND-UX.md) separates the agreed framing from proposed interface details. The demonstration case is [wesbos/photo-frame-dashboard](https://github.com/wesbos/photo-frame-dashboard); we do not modify that upstream repository.

## Our two repos for these two days

| Repository | Responsibility |
| --- | --- |
| **This repository** | Commons, public-source corpus, PDF Lab and optional Adobe story |
| **[Knowledge Lab](https://github.com/blackmath88/baselhack26-knowledge-lab)** | LightRAG retrieval experiment and durable Project Memory host |

[Observstory](https://github.com/blackmath88/observstory) supplies the reusable workspace and memory contracts. [Postack Underflow](https://github.com/blackmath88/postack-underflow) and [br-ai-nstorm](https://github.com/blackmath88/br-ai-nstorm) supply prior work and reusable mechanisms.

**Build the new pilot here**, superseding the earlier suggestion to put it in Postack.

## Checks and documentation

From `apps/commons`:

```bash
npm ci --prefix tools/local-pds   # enables the real isolated-PDS test suites
npm run typecheck
npm test
npm run index:check
npm run build
bash scripts/smoke/multi-entry.sh
```

The browser smoke additionally needs Chromium. Exact commands and limitations are in [DEMO.md](DEMO.md).

| Document | Use |
| --- | --- |
| [Integration review](docs/reports/REPOSITORY-REVIEW-2026-11-01.md) | Merged behavior, checks and remaining work |
| [Project and time plan](HACKATHON-PLAN.md) | Original work packages, event timetable and scope history |
| [Observatory guide](OBSERVSTORY.md) | Static publication, declarations and memory boundary |
| [Shared-service implementation](docs/architecture/MULTI-ENTRY-IMPLEMENTATION.md) | Contracts, entrances and ATProto limits |
| [Third-party provenance](THIRD_PARTY.md) | Reused sources, revisions and attribution |

Build prompts under `docs/build/` preserve their original intent. Do not rerun completed prompts as if they were current tasks.

## Adobe and PDF

**“PDF helped us preserve a document when it travelled. What should we preserve when an answer travels through AI?”**

The concept and tool must stand without this framing. PDF preserved form, not truth. [PDF history](modules/pdf-history/README.md) is the optional narrative; [PDF Lab](sideprojects/pdf-lab/README.md) is the working format-bending cabinet. The lab remains in this repository; extraction to a separate repository has not been performed.

## Remaining boundaries

Public identity/OAuth, owned ATProto namespace, federation, production Commons authentication and hosting remain separate work. No NUC service state is inferred from a merge or local screenshot. Selected project metadata still needs explicit implementation records if the workspace is to show build progress.

The [earlier business-presence brief](EARLIER-BUSINESS-PRESENCE.md) is preserved for history. Its hotel/booking scenario is not the current build direction. The project name is now .phf; repository renaming remains deferred.

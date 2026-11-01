# Module directory
Updated 1 November 2026 after Commons PRs #35–37 merged.

Start at the [.phf story](https://blackmath88.github.io/baselhack26-open-presence/story/).
The story connects **past → future → now**; Commons is the main demonstration.

| Module | Source | Access and status |
| --- | --- | --- |
| Story / navigation | [apps/story](apps/story/) | [Public story](https://blackmath88.github.io/baselhack26-open-presence/story/) |
| Past: PDF Lab cabinet | [sideprojects/pdf-lab](sideprojects/pdf-lab/) | [Public cabinet](https://blackmath88.github.io/baselhack26-open-presence/pdf-lab/) |
| Past: PDF history | [modules/pdf-history](modules/pdf-history/) | [Public history](https://blackmath88.github.io/baselhack26-open-presence/pdf-history/) |
| PDF Workbench | [sideprojects/pdf-lab/workbench](sideprojects/pdf-lab/workbench/) | Local http://127.0.0.1:3100/; requires Node runtime |
| Future: .phf Commons | [apps/commons](apps/commons/) | Local http://127.0.0.1:5173/; requires API. Cisco find/inspect/compare merged |
| Now: Observatory | [Integration guide](OBSERVSTORY.md); [producer repository](https://github.com/blackmath88/observstory) | [Public workspace snapshot](https://blackmath88.github.io/baselhack26-open-presence/) |
| e companion | [Commons components](apps/commons/src/components/) | [Public preview](https://blackmath88.github.io/baselhack26-open-presence/e/); also in Commons |
| Project Memory / Knowledge Lab | [Separate repository](https://github.com/blackmath88/baselhack26-knowledge-lab) | Supporting local service; no public app URL verified |

## Run the connected demo

From the repository root, with Node.js 22+ and npm:

~~~bash
node scripts/site/rehearse.mjs
~~~

Open http://127.0.0.1:8001/. The launcher connects the story, PDF modules,
Commons UI/API and Workbench. See [hosting and rehearsal](apps/story/README.md).

Public Commons and Workbench hosting is still outstanding. GitHub Pages serves
static material; it does not start their servers. The public story labels this boundary.

## Integration status

- #35, #36 and #37 merged sequentially into main: Cisco foundation, find/inspect and compare.
- Combined verification: Commons build, 225 tests across 24 files, deterministic record index and multi-entry CLI contribution/reply/rediscovery smoke passed.
- #38 remains a competing draft UI implementation; do not merge it wholesale over the selected chain.
- #31 remains blocked: live PDF execution needs stricter fixture validation and verified resource isolation.
- Observatory #17 and Knowledge Lab #6 remain drafts; their proposed capabilities are not claimed as shipped.
- Branch maintenance only targets an explicit list of merged PR heads. It preserves moved heads and branches referenced by open PRs.

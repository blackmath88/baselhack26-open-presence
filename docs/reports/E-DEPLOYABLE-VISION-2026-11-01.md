# Deployable e, selected vision preserved

User selected the appearance from #41 and requested deployability while sticking to that vision.

Changes: `docs/design/DOPE-E.md` records the selected lowercase form, joint/smoke, uneven red eyes, leisure personality and 7.6-second rhythm; root AGENTS.md directs future agents to preserve it. `npm run build:e`, `test:e`, `preview:e` provide explicit commands. `e-preview/README.md` explains static hosting and embedding. A dedicated e-companion Actions workflow builds a downloadable `dope-e-static` artifact with deployment notes and source commit. Existing Pages deployment uses the same build command. Observatory navigation is absolute so independent hosting works.

No renderer, behaviour, timing or component styling changes. Browser visual QA remains required for future intentional art changes; automated success alone is not visual acceptance. Existing preview remains https://blackmath88.github.io/baselhack26-open-presence/e/ . No additional service/account provisioned.

Sources: explicit user selection in the current conversation; #41 at e3cdab0; published knowledge (15/15, no diagnostics) and snapshot. Historical packet cp_7cdc6f026054f6d6650d202f is older than the build. This is an assistant-authored handoff, not a human review record.

Validation: targeted companion tests, independent preview typecheck and production build. Release workflow outcome to be checked after merge. Walking and presentation choreography remain future work.

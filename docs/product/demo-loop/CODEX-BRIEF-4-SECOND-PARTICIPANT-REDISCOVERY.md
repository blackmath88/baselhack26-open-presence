# Codex brief 4 — a second participant's reply, and rediscovery

Repo `blackmath88/baselhack26-open-presence` · base `feat/demo-3-contribute` · new branch `feat/demo-4-second-participant` · own worktree. Read `README.md`, `PHF-EXPERIENCE.md` §5–§6, `CONTEXT-BLOCK.md`, `SELECTION-MODEL.md`.

## Decision switch (set by Achim before this brief starts)

`REDISCOVERY = required | optional`. Required: the CLI rediscovery is rehearsed on screen and gets a Playwright/CLI check and a runbook step. Optional: the UI's „so findest du es wieder“ line and the runbook command are enough; no on-screen terminal. **Default until Achim decides: optional.**

## Goal

Lea replies to Kai's contribution from the canvas; the original stays unchanged and inspectable; both appear in card 3 and card 4 with their context blocks; Kai's contribution is found again through the CLI with author, entrance and cited source.

## Step 0: inspect, report, then build

1. Read `server/auth/participants.ts`, the participant session flow in `src/state/useRoom.ts` and the old `ParticipantSwitcher`, and the reply/correction fields (`parentId`, `contradictsId`) in `queries.ts`.
2. Read `scripts/commons/cli.ts` (`search`, `thread`, `inspect`) and `server/mcp` tool names.
3. Report: how a session switch affects open drafts, and what `npm run commons -- search` prints for a contribution that cites `issue/12`.

## Build

1. **Participant switch in Aurora.** Topbar avatar menu: current name, „Als Lea fortfahren“ / „Als Kai fortfahren“, note „Prototyp-Anmeldung, keine echte Identität.“ Switching keeps the route and the investigation.
2. **Reply from card 3.** Each room contribution row has „Antworten“ and „Korrigieren“; both open card 5's composer with relation preset (`parentId` or `contradictsId` = that contribution) and a header „Antwort auf Kai · 14:02“ / „Korrektur zu Kai · 14:02 (das Original bleibt)“. The path through Prüfungen is the same as Brief 3.
3. **Thread view.** In card 3, replies nest one level under their parent with the context block; `?beitrag=<id>` highlights and scrolls. In card 4, Antworten lists replies and corrections with their relation.
4. **Rediscovery, UI side.** After Lea's reply, the read-back shows the same three ways to find it again. The canvas head's „Teilen“ copies `/canvas/bilderrahmen-mac?beitrag=<id>`.
5. **Rediscovery, CLI side** (both switches): document in `docs/product/demo-loop/RUNBOOK.md` (create it): server start, participant env, the exact `search` and `thread` commands, expected output excerpt. If `required`: add a script `scripts/smoke/demo-rediscovery.sh` that submits as Kai, replies as Lea, searches as Lea and asserts author, entrance and `issue/12` in the output; wire it into CI next to the multi-entry smoke.
6. **MCP**: not demonstrated. The runbook names the MCP tools and states that a live agent session is rehearsed separately or not shown.

## Constraints

German UI; Kai's contribution bytes unchanged after Lea's reply (assert revision unchanged); no token changes; no new endpoints; the switch never leaks a token into URL or DOM.

## Acceptance

1. Kai submits (Brief 3 path) → switch to Lea → „Antworten“ on Kai's row → question text from PHF-EXPERIENCE §5 → Prüfung → submit → card 3 shows Lea's question nested under Kai's entry, both with context blocks; card 4 Antworten lists both; Kai's entry unchanged.
2. `BRAINSTORM_PARTICIPANT=Lea npm run commons -- search "USB-A Kabel Hub"` shows Kai's contribution with author Kai, entrance browser, source `issue/12`; `thread <id>` shows both voices.
3. If `required`: `scripts/smoke/demo-rediscovery.sh` passes locally and in CI.
4. Typecheck, build, tests, smokes; captures `docs/reports/demo-loop/04-*.png`; zero axe A/AA violations on the thread state.

## Out of scope

ATProto publication, moderation UI, Observatory, any LLM-driven agent.

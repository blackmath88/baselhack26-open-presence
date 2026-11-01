# NUC evening build window — 31 October 2026

Author: ChatGPT (assistant). Status: execution handoff; scheduling implementation and packet ordering are proposed. The user explicitly requested ChatGPT on NUC to orchestrate Claude Code during the allowance window and to include Commons, PDF Lab and the new Observatory UI. No local trigger or runtime is armed by this document.

## Contract

- Coordinator: ChatGPT app on NUC, using its actual terminal/Orca capabilities. Claude Code is the main implementation coordinator/runtime; ChatGPT owns preparation, launch, supervision and recovery. One Claude coordinator plus at most two delegated workers across all repos. Do not start a second Claude coordinator on a potentially-live session.
- Window: **2026-10-31 20:10–23:00 Europe/Zurich** (19:10–22:00 UTC). Begin preparation immediately. If armed late but before 23:00, begin immediately with the remaining time; after 23:00, do not backfill or start this expired window.
- At 22:45 local, stop opening new packets and checkpoint. At 23:00 all workers must be settled/stopped by the supervisor. Weekly refresh is a usage signal, not authorization for an overnight run.
- Aim: useful working increments in Commons, PDF Lab and Observatory UI, with memory integration as enabling work. Incomplete experiments are acceptable. Do not spend the window redesigning architecture, setting up new infrastructure or repeatedly reviewing finished work.
- Allowed: local preparation, isolated worktrees, implementation, focused checks, private local previews, commits, pushes and draft PRs in these three repositories. Local user-service setup for this bounded run is authorized by the requested timed orchestration. Preserve existing services and data; do not restart unrelated services.
- No paid API spend, public ATProto account writes, public exposure of prototype authentication, merge or deployment under this handoff. Do not grant assistants human-review authority.
- User's screenshot at planning time: session 100% used, reset 20:10; weekly 86% used, reset 23:00. These are observed screenshot values, not current telemetry. Do not infer a token count or promise uninterrupted access.

## Read once, verify mutable facts

Read repository AGENTS.md and any local parent instructions. Read current hosted knowledge.json and snapshot.json first; verify resolved commit, completeness and diagnostics. These hosted URLs were inaccessible from the planning environment, so no current artifact completeness claim is made here. Fall back to direct Git/PR state.

The checked-in context cp_7cdc6f026054f6d6650d202f is complete **for its cutoff 93a5445150d05b3626507f8ef5868d13d62d57ef**, not for today's latest branches. Refresh from the NUC memory host if available; otherwise explicitly retain the stale-cutoff caveat and inspect current Git objects.

Planning observed Open Presence main at 77b1845be84a788355b2b87dc6e3a3283f962d09, Observstory main at f91e9eb9bdc867c6481b23b3043b614e0571f57c and Knowledge Lab main at 985c9f960d050f1270892d89bf025a0ccdb486d1. Re-fetch before dispatch. Open Presence had no open PRs at that observation; PR #11 is no longer an open implementation target. Use current main for Commons unless fresh inspection says otherwise.

## Arm the local start NOW

This section is a required operation for the NUC assistant, not a claim that a timer exists.

1. Check the NUC clock/timezone. Inventory existing Orca runs, active Claude processes, worktrees and dirty files with deterministic tools. Preserve work and existing claims.
2. Load orchestrate-work and route-orca-work when installed. Resolve the Orca executable according to the installed skill: ORCA_CLI_COMMAND if set; otherwise orca-dev when ORCA_DEV_REPO_ROOT applies; otherwise orca-ide on Linux outside an Orca-managed terminal; otherwise orca. Run its supported skills get orchestration command. Read actual CLI help/runtime contract; never invent dispatch/resume/timer commands. Read weavr/docs/CHATGPT-OPERATING-CONTRACT.md. If these tasks are already Weavr-governed, inspect live Mission/Run/Need state and preserve that scope.
3. Determine the actual supported noninteractive or persistent Claude launch/resume path. Reuse a relevant settled session where supported. Check authentication without printing secrets. A browser subscription is not proof the CLI is authenticated. Avoid a pre-window model call while allowance is exhausted.
4. Prepare a compact launch prompt from this plan and an isolated session directory outside versioned source for logs, PID/dispatch IDs and state. Store no secrets in repo or logs. Verify daemon child credential boundaries, not just the invoking shell.
5. Create a durable **local** one-shot start using available systemd user timer/service or documented Orca scheduling. The start must survive this ChatGPT response ending. Use absolute date/time with timezone or verified UTC conversion. Enforce the 23:00 absolute cutoff over the entire worker tree, not only a launcher that exits after dispatch. Refuse duplicate launch through a lock and actual runtime-state reconciliation. Protect against service restart after cutoff. A normal chat reminder or an in-chat sleep is insufficient.
6. Set an automatic 22:45 checkpoint signal/message through a supported control path. Set deadline/stop coverage for every daemon-launched worker as well as the Claude process. Verify the launch user's PATH, working directory, CLI path, provider session access and logging in the service environment.
7. Verify without consuming Claude allowance: service/timer loaded, next trigger date and timezone, executable/config validity, log destination, end-time enforcement, duplicate guard and cancel command. If scheduling access is unavailable, attempt the verified documented alternative; if no route exists, report the exact blocker immediately. Do not label the run armed.
8. Return **ARMED** only with timer/job identity, next trigger in Zurich and UTC, command/session target, log path and stop mechanism. This is readiness evidence, not proof of launch.
9. After actual launch, record **STARTED** only with observed process/dispatch identity and live log/run state. Use a durable runtime supervisor for progress/checkpoint/stop; ChatGPT staying open is not the enforcement mechanism.

If provider allowance still blocks at 20:10, perform one bounded retry at 20:15 while continuing independent Codex/deterministic work. Then mark Claude blocked and proceed through eligible already-authorized routes. Never switch to paid API access. If a launch might still be alive, settle it before retry/fallback.

## Packet queue

Dispatch at most two independent workers while Claude coordinates. First pair should cover **PDF Lab and Observatory UI**, so neither is dropped behind Commons. Claude can work on Commons integration concurrently in its own non-overlapping worktree. Pick one achievable increment per packet, then iterate if time permits; these are candidates, not obligations to build every bullet.

### C — Commons / main application
Repository: blackmath88/baselhack26-open-presence.
Write scope: apps/commons/**, DEMO.md, BUILD-STATUS.md and directly related evidence/docs. No sideprojects/pdf-lab or Observatory producer edits.
Input: current main; read merged PR #11, DEMO.md, BUILD-STATUS.md, docs/architecture/MULTI-ENTRY-IMPLEMENTATION.md and existing evidence. The earlier launch prompt has already been implemented; don't re-run M0–M5 from scratch.
Produce: improve the weakest actual point of repository → problem → evidence → contribution → reply → rediscovery across browser/search/CLI/MCP.
Candidates: clearer navigation, intelligible match explanations, attributable reply/correction/publication states, cross-room relationship visibility where the current implementation supports it.
Accept: one demonstrated cross-entrance contribution survives/reappears with author and source refs. Preserve isolated-PDS checks and source immutability. Distinguish isolated protocol roundtrip from public federation.
Checks: repository-defined typecheck/tests/index check/build plus relevant smoke for changed behavior. Reuse existing evidence; avoid broad repetitions without a concrete change.

### P — PDF LAB / real strange artefacts
Repository: blackmath88/baselhack26-open-presence.
Write scope: sideprojects/pdf-lab/** only, including its tests and generated exhibit artifacts. No shared root lockfile/manifest changes without coordinator ownership.
Input: current main; read PLAN.md, FORMAT-BENDING.md, RUNNING.md, ALTERNATE-READINGS.md and WEIRD-MACHINES.md in that folder.
Latest plan already reports cabinet 003: nine exhibit families / 23 PDFs. Do not rebuild earlier cabinet milestones.
Produce: first extend the glyph bench into the **two-poem font-mapping artwork**, with same visible shapes and demonstrably different text readings if technically achievable. Bring the workbench closer to encounter → play → reveal → bend → inspect. If the first mechanism blocks, take one bounded repair then switch to the single-coordinate Type 4 stack trace or minimise the already observed OCMD discrepancy.
Accept: at least one concrete new or improved artefact/control, source recipe, reproducible command and measured outputs; negative outcomes remain useful. Never fabricate reader support or divergence.
Use original content, offline toy programs and bounded rendering processes. Keep executable PDF behavior inside its named viewer; no external calls or host execution. Preview images are labelled renders. Use the existing generator/checks; no new general framework.

### O — Observatory visual workspace / implementation
Repository: blackmath88/observstory.
Input: PR #24 at planning head 84c3c0a4e1d870f0aa56e47db9ee59fcfd1ee844, base feat/frontend-tanstack-start at af5b2d725301f46ee1796b3d215fd90694fb8c12. Verify both; preserve stacked dependency.
Read frontend/docs/visual-workspace/REVIEW.md, frontend implementation and source workspace projection. Consumer PR #12 has merged and pinned that producer; an updated producer requires a coherent consumer pin change in a separate coordinator-owned commit.
Write scope: frontend/** and only directly necessary workspace projection/schema/tests. Do not edit the memory reducer or unrelated System Map PR #17. Consumer workflow/.observstory changes belong to coordinator, serialized after producer output.
Produce: make the actual cool-clean workspace more useful at a glance—research/concepts/planning/implementation workstreams, truthful timeline, useful board and shared detail drawer. Continue existing design; do not build a second dashboard.
Accept: a visible working improvement using real Open Presence data, no invented owners/progress/dates, evidence links still work, phone and desktop usable, keyboard access preserved. Prior tests/screenshots establish a baseline, not a demand for a full new browser matrix.
Check the consumer actually consumes the new build locally; no deployment implied.

### M — Memory / enabling integration
Repositories: blackmath88/observstory and blackmath88/baselhack26-knowledge-lab.
Input: Observstory #20 c63091613c206dc50dac06a85cc608a88596e0e3; fix #23 c23c35ac8447d2f84bec89e5a9b9e4ee68efb61d; Knowledge Lab #1 c24573132d4671e85d3e2ef02716dff284226ec2. Verify branch heads and the host's producer pin; do not silently drop the replay fix.
Write scope: the existing memory branches, relevant host/deploy/runbook/tests, not Observatory frontend files concurrently.
Produce: reconcile dependency and get durable history/context plus a real read-only Claude MCP read on NUC. Preserve existing indexes and data; back up before local persistent service changes.
Accept: exact revision/cutoff in context, history survives restart, actual consumer read recorded. Paid LightRAG indexing and hosted remote MCP are outside this window.
Start this when a worker slot frees or it unblocks a product packet; avoid sacrificing all three product tracks to runtime setup.

## Supervision and integration

- Record exact trusted base, worker ID, worktree, write scope, deadline, route and check commands before dispatch. Workers do not recursively delegate.
- Prefer the user's requested eligible subscription Claude route; use Codex/local routes for suitable bounded work without new spend. Known-offline routes do not deserve repeated probes. Read actual effective model where available; otherwise unknown.
- Each packet has at most one focused repair before coordinator triage; switch to independent useful work rather than looping.
- Keep worker contexts compact. Current files plus exact task are sufficient; don't forward full conversations.
- Inspect diffs, preserve attribution and run required coherent checks. Independent review where available; otherwise label self-review and leave draft.
- Push coherent checkpoints around 21:00, 22:00 and 22:45 when useful, not empty commits. Keep a resumable ledger with running/possibly-live ownership. No conflicting retry until settlement.
- At 22:45 request final commits, logs and remaining task notes. At cutoff enforce worker termination and observe settlement, including daemon children; don't report an abandoned session as stopped.
- Save results to docs/build/NUC-WINDOW-2026-10-31-RESULTS.md on an implementation branch: actual launch/stop times, route identities, exact heads/PRs, implemented vs tested vs live-observed, limitations, workers still owned and next action.
- Return findings/proposals through .observstory/proposals/ with assistant authorship, evidence and packet basis. No human review records.

## Selected repository handoff

Findings: Commons #11 is no longer open; earlier target prompts are stale. PDF Lab has progressed to cabinet 003. Observatory's consumer already pins the new visual producer while producer PR #24 remains open. Memory integration has separate replay-fix and host dependency branches.
Explicit user instructions: include Commons, PDF Lab and new Observatory UI; accept partial experiments; have ChatGPT on NUC orchestrate Claude in this window.
Proposals: two parallel independent packets P/O while Claude advances C; M as slot/enabler; durable local trigger with enforced cutoff.
Open questions requiring runtime evidence: NUC tool/Orca capability, authenticated Claude noninteractive route, scheduler/credential environment, active workers, current allowance.
Affected documents: this handoff and the matching NUC window pointers in Observstory/Knowledge Lab; no accepted ADR or canonical decision changed.

Sources:
- https://github.com/blackmath88/baselhack26-open-presence/pull/11
- https://github.com/blackmath88/baselhack26-open-presence/pull/12
- https://github.com/blackmath88/baselhack26-open-presence/blob/main/sideprojects/pdf-lab/PLAN.md
- https://github.com/blackmath88/observstory/pull/24
- https://github.com/blackmath88/observstory/pull/20
- https://github.com/blackmath88/observstory/pull/23
- https://github.com/blackmath88/baselhack26-knowledge-lab/pull/1
- https://github.com/blackmath88/weavr/blob/main/docs/CHATGPT-OPERATING-CONTRACT.md

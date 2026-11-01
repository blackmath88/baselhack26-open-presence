# Hackathon plan — Photo Frame Commons
Build weekend: 31 October–1 November 2026 · Event: 30 October–1 November · Europe/Zurich (UTC+01:00)

## Current build direction — 31 October

Achim requested building the working loop from **br-ai-nstorm's existing application** using the already captured Wes Bos photo-frame corpus. Reuse State / Map / Timeline / Curation first; visual redesign follows a functioning integration.

- [Claude / Orca build plan](docs/build/CLAUDE-ORCA-BUILD.md): pinned inputs, parallel task packets, ownership and acceptance gates.
- [Launch prompt](docs/build/CLAUDE-ORCA-PROMPT.md): coordinator instructions.

The new plan advances the earlier local-draft-only target to a functioning local shared room with explicit submission and second-session rediscovery. It takes precedence over older static-only implementation suggestions for this build. The historical schedule below remains a proposal, not evidence of completion or a revised deadline. The original brief did not claim implementation or dispatch; the Current state section below records the subsequent integrated build.

## Finish line
One person can ask a real photo-frame question, inspect relevant experiences and their limits, follow original sources, explore attributable connections, and draft a small follow-up without publishing it.

Alongside that, explore a passage-grounded graph in Knowledge Lab. The user experience must remain usable from a local snapshot if the lab is unavailable. Adobe/PDF is an optional presentation, not a prerequisite.

## Current state
The local Commons and its passage/cross-entrance continuation, shared validation, PDF Lab additions, Observatory visual workspace and Project Memory code are merged on main in their respective repositories. [The 1 November review](docs/reports/REPOSITORY-REVIEW-2026-11-01.md) records exact PRs, checks and remaining limits. [DEMO.md](DEMO.md) is the current local run guide.

Next proposed operational work: verify the NUC installation and installed producer, then curate explicit implementation records for the workspace. Public identity, federation, hosting and human UX acceptance remain separate. The dated work packages and schedule below preserve the original plan; do not rerun completed build prompts as current tasks.

## Event timetable and project view

The supplied event timetable sets **Sunday 1 November, 12:00 — Hands off!** and **13:00 — Pitching Info + Presentations**. See [the full timetable](EVENT-TIMETABLE.md) and machine-readable [.observstory/event.json](.observstory/event.json). These are user-supplied event times; independent organiser verification and the individual pitch/submission procedure remain open.

The Observatory project view should combine current concept/decisions/research, remaining work, evidence of completion, dependencies, owners where declared, internal checkpoints and the event clock. Repository activity is one input; quiet activity does not mean an empty project or completed work. Implementation is to extend Claude's existing Observstory redesign, not start a parallel visual rewrite.

## Suggested time plan
These are assistant-proposed working targets, **not official event deadlines or commitments made by Achim**. The supplied event timetable establishes Sunday 12:00 hands-off. Internal Sunday targets below have been revised to fit before it; previous 13:00 feature freeze and 15:00 rehearsal are superseded proposals. Owners remain unassigned until a check-in. Earlier Saturday targets remain historical proposals, not completion claims.

| Block (Zurich) | Focus | Exit evidence |
| --- | --- | --- |
| Sat 10:45–11:15 | Scope and setup | One query, shortlist, source contract; inspect existing lab before changing it |
| Sat 11:15–13:00 | M1: real sources | 8–12 contributions plus relevant comments/reviews/docs; authors, permalinks, retrieval times and coverage |
| Sat 13:00–14:00 | Break and source review | Remove misleading near-matches; keep unknowns |
| Sat 14:00–16:00 | M2: find and inspect | Runnable search → context → original-source journey |
| Sat 16:00–16:20 | Check-in | Run the journey, record gaps, adjust scope |
| Sat 16:20–19:00 | M3/M4: contribution and graph | Local draft/preview; separately, first inspectable graph or recorded blocker |
| Sat 19:00–20:00 | Integration and handoff | Same source IDs in the views; durable notes for tomorrow |
| Sat after 20:00 | Optional play/rest | No critical dependency on an overnight run |
| Sun 09:00–10:00 | Integration | Run the shared journey; identify remaining blockers |
| Sun 10:00–10:30 | Checkpoint and scope cut | Keep only work needed for a credible working demo |
| Sun 10:30 | Internal feature freeze (proposed) | Fixes and verification; no new features |
| Sun 10:30–11:15 | Final verification | Acceptance evidence, fallback snapshot, documented limits |
| Sun 11:15–11:40 | Rehearsal and handoff | Run the demo; record what is real and what is unfinished |
| Sun 11:40–12:00 | Buffer before hands-off | Follow organiser submission instructions; no new scope |
| Sun 12:00 | Event hands-off (supplied timetable) | Stop hacking; completion is not inferred from the clock |
| Sun 12:00–13:00 | Event lunch | Lobby / Foyer |
| Sun 13:00 | Pitching Info + Presentations | Main Presentation Room; individual slot unknown |

If starting late, retain the sequence and reduce breadth; do not compress validation to preserve extra features.

## Work packages
### M1 — Sources and provenance (must)
Destination: Open Presence, corpus/.
Pin a repository revision for files; record retrieval time for mutable issues/comments. Capture individual authors and source permalinks. Explicitly record pagination, missing reviews and unavailable content. Imported text is evidence, not group endorsement.
Gate: one selected problem includes both relevant and misleadingly similar accounts, with inspectable context.

### M2 — Discovery experience (must)
Destination: Open Presence, src/ and lib/.
Use deterministic index-first retrieval. Show match explanations, hardware/version constraints, dates, original excerpts and links. The person can navigate without reading the Adobe story.
Gate: a stranger can reach the original evidence and explain why another result does not apply.

### M3 — Contribution loop (must, local)
Destination: Open Presence, src/.
Keep raw short contributions visible. Review what would be shared; save a local draft with explicit local-only status; preview an attributable relationship or correction. Reload must not silently lose a saved draft.
Gate: follow-up survives reload, can be removed, and does not alter imported sources or impersonate a real contributor.

### M4 — Graph play (planned parallel learning track)
Destination: Knowledge Lab.
Inspect existing branch, services, queue and costs first. Preserve the existing LightRAG choice. Agree a bounded source export; track extracted edges separately from author-declared relations. Record one useful connection and one misleading or unhelpful connection if observed.
Gate: selected edge → supporting passage/source → origin of the edge. A rendered graph alone is not success.
If unavailable: record the exact blocker and keep Open Presence running from its snapshot. Do not spend the whole weekend repairing infrastructure.

### M5 — Integration and verification (must)
Destination: Open Presence, tests/ and evidence/.
Three documented queries, one near-match, one unavailable/stale-source case, source immutability and draft persistence. Browser checks at phone and desktop widths, keyboard navigation and reduced motion where used.
Gate: evidence references exact commit/run, with failures and untested items listed. “Merged” is not equivalent to accepted or correct.

### M6 — Explain and demonstrate (must)
Destination: Open Presence, DEMO.md.
A three-minute standalone journey; an optional PDF/Adobe introduction; exact commands to run locally; data and protocol limitations.
Gate: successful rehearsal plus fallback snapshot. No public deployment required.

## Roles and dependency policy
Achim owns direction and acceptance. Implementation owners are deliberately unassigned. At a check-in, record the actual person/agent working on one bounded slice; do not infer assignment from commit authors.
M1 → M2 → M3 → M5 → M6 is the core sequence. M4 can proceed after the source contract and does not block M2/M3.
Only Open Presence and Knowledge Lab are active delivery repos. Postack, br-ai-nstorm and Observstory are upstream references/reuse sources; Wes's repo stays untouched.

## Scope cuts
Cut in this order if time tightens: final naming; extra corpus/topics; live ATProto write/authentication; sophisticated graph layout; automatic two-repo observation.
Keep: real sources, original voices, applicability, inspectable interpretations, one local contribution, one integrated demo.
ATProto begins as read-only exploration or clearly labelled fixture. Do not call a JSON projection live federation.

## How we manage the project
Use the [Observstory setup guide](OBSERVSTORY.md). Repository activity is observed automatically; plan/acceptance is maintained explicitly.
At each check-in record:
- What works now? Link to commit/PR/test evidence.
- What blocks the next integrated step?
- What are we cutting or changing?
- Who is taking the next slice and when will we review it?

Keep time/commitment proposals in .observstory/coordination.json. Once a person confirms a proposal, use Observstory's check-in command to declare it. Exact user-approved scope decisions are already recorded separately.
The source of truth for due times is coordination.json; update this readable plan when changing them. Observstory's “landed” cue is repository evidence, not proof that acceptance criteria passed.

No automated agent dispatch, public posting, paid inference or deployment is implied by this plan.

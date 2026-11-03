# Codex brief 5 — Observatory finale item

Repo `blackmath88/baselhack26-open-presence` · base `feat/demo-2-photo-frame-canvas` or later · new branch `feat/demo-5-observatory-finale` · own worktree. Read `README.md`, `BRIDGE.md` §3–§4, `OBSERVSTORY.md`, `AGENTS.md` §4–§6.

## Goal

The demo ends on one Prüfung, „Was diese Arbeit selbst hinterlässt“, built from committed Observstory files, and the topbar's „Observatory“ stays inside the app. The build files its own proposal.

## Step 0: inspect, report, then build

1. Read `.observstory/knowledge.json`, `.observstory/coordination.json` (decisions D1–D4), `.observstory/proposals/README.md` and one existing proposal (`pdf-lab-werkbank-20261103.json`).
2. Read `components/aurora/Actions.tsx`, `TopBar.tsx`, `AppShell.tsx` (the `Observatory` label branch).
3. Report: which records and decisions have a declared status and a `declared_in` quote, and which would read „nicht erfasst“.

## Build

1. **Data at build time.** A small loader (`src/data/observatory.ts`) imports the three JSON files with Vite JSON imports; no runtime fetch, no GitHub API. Keep only `id`, `type`, `path`, `status`, `title`/`text`, `confirmed_by`, `confirmed_at`, `author`, `submitted_at`.
2. **Prüfung `/actions/observatory-nachlass`** per BRIDGE §3: Einschätzung text, Zugehörige Signale rows (Konzept, Entscheidungen, Vorschläge), Prüfplan line, link „Observatory öffnen“ (`import.meta.env.VITE_OBSERVSTORY_URL` or the Actions workflow link). No progress numbers, no lane status, no stale warnings, no „Plan freigeben“ button.
3. **Topbar.** „Observatory“ navigates to `/actions/observatory-nachlass`. The launcher's Werkzeuge entry does the same.
4. **The build's own proposal.** Add `.observstory/proposals/demo-loop-<date>.json` (kind `finding`): the demo loop shows real captured accounts and a shared-room contribution path; rediscovery and ATProto remain as declared in the runbook. `author.kind: assistant`. Never write a review file.
5. **`/actions` list.** The Observatory item appears last under Offen with source chip „Observatory“ and no severity badge.

## Constraints

German labels, English quotes verbatim; no token changes; the JSON files are read-only inputs (AGENTS.md); mobile 390 px without horizontal scroll.

## Acceptance

1. `/actions/observatory-nachlass` lists concept `concept-human-signal` (current), decisions D1–D4 with who confirmed them and when, proposals `pdf-lab-werkbank-20261103` and the new demo-loop proposal, both „unreviewed“.
2. Topbar „Observatory“ stays in the app; browser back returns to the previous Prüfung.
3. Typecheck, build, tests, Aurora smoke; captures `docs/reports/demo-loop/05-*.png`; zero axe A/AA violations.
4. PR description names the proposal file and states that no review was written.

## Out of scope

Rendering the Observstory snapshot or scene, lanes, timing, any write to coordination.json.

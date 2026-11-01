# Claude — build PDF Workbench, Batch A
1 November 2026 · Prepared by ChatGPT / Codex (assistant) for Achim.
This is an implementation brief, not evidence that a worker has started.

## Task
Implement [WORKBENCH-BUILD.md](WORKBENCH-BUILD.md), Batch A: phases 0–2, with stored reading comparison. Deliver a polished, working local TanStack Start application around the existing PDF LAB specimens and evidence.

Read AGENTS.md, current project memory and the blueprint first. The blueprint's inspected main is 4c998e90408100de4b04c8af83b0024d9f3c0162; fetch current main and reconcile changes before starting. Hosted knowledge/snapshot were inaccessible during planning; retry and record actual commit/completeness/diagnostics, otherwise explicitly use source files. Historical packets are dated context.
Read research/2026-11-01-workbench-direction.md and the pinned PR #26 reference in the blueprint. Do not wait for research PRs to merge to implement an independent additive workbench.

## Execution
1. Create an isolated feature branch/worktree from current main. If the blueprint PR is unmerged, bring its documentation into the branch without overwriting unrelated work. Inspect current PDF files and other workers' changes.
2. Work inside sideprojects/pdf-lab/workbench. Keep the legacy cabinet and PDF opening usable. No root toolchain migration or generated-PDF/evidence rewrites.
3. Inventory and validate existing manifests/reports; deduplicate by path/hash, preserve source commit and evidence pointers. Build deterministic read-only asset ingestion; no broad filesystem serving.
4. Scaffold TanStack Start + React + strict TypeScript + Vite from current official docs. Pin compatible versions and lockfile. This is the app shell; retain existing PDF generators.
5. Build a calm, cool-white cabinet and dominant document stage, with stable navigation, breadcrumbs and contextual inspector. Cisco Cloud Control is a navigation/material reference, not branding to copy. No floating windows, dashboard metrics, warm cream or decorative terminal.
6. Implement the two-poem journey using real PDFs, recorded renders and actual MuPDF/Poppler text. Support original/alternate/control choice, authored meaningful selection, mapping reveal, evidence and original download. Label authored selection separately from native PDF selection. Use explicit unknowns where correspondence is unavailable.
7. Include a stored page/text comparison and correct run/engine/version labels. New authoring can link to the real legacy authoring section in this batch; never show fake execution. Do not add public uploads or a local command runner yet.
8. Verify the acceptance walkthrough and inspect desktop/tablet/phone screenshots. Fix the experience, not just test failures.
9. Commit, push and open an implementation PR with run instructions, checks, screenshots, exact capability limits and next packet. Add an assistant-authored .observstory/proposals record following AGENTS.md; do not create a human review.

Use routine engineering judgment and continue through implementation and verification. Do not stop at scaffolding, a design proposal, or mock data. If an external dependency is blocked, preserve completed work and report the precise blocker; never claim unrun checks passed.

## Success
A newcomer can open a real specimen, select a meaningful authored region, understand that appearance and extraction differ, identify the named recorded evidence, and download the original without losing their place.

Checks: strict typecheck/build, adapter/hash/error tests, production deep-link/asset smoke, keyboard/focus/reduced motion, 1440/768/390 walkthrough, relevant existing Node tests. Use temporary outputs for any new engine work; don't regenerate historical fixtures to test a frontend.
Record commands and results. Run no paid AI calls and deploy nothing for this batch.

## Stop boundary and handoff
Finish Batch A. Phases 3–7 are the roadmap, not an instruction to expand this run indefinitely. Report what works, what is recorded vs live, what remains unknown, and a concrete Batch B (narrow real authoring) implementation packet. Preserve the brief's modular contracts without filling the project with empty abstractions.

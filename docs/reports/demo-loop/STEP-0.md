# Demo brief 1 — Step 0

Inspected before code changes on 3 November 2026. PR #60 was open, so this worktree starts from
`docs/demo-loop-specs` at `df9bec5f5c081ed23501a3b7d2496a7a4b5b91e7` and its PR targets that branch.
Read README, PDF-ENCOUNTER, BRIDGE, SELECTION-MODEL, brief 1, then root AGENTS in the requested order.

- Fresh Chromium context at `/lab`: `01-poem-visible.pdf`, Seite, Zeile 1, Durchsicht 0,
  dock open after 500 ms. This equals P1. Actual dock copy is “Dann zeige ich dir, was ein Programm
  an derselben Stelle liest.”, slightly different from PDF-ENCOUNTER's quoted paraphrase; this brief leaves it intact.
- `useWorkbench.ts` stores `sessionStorage["pdf-lab.dock-seen"] = "1"` when the introduction opens.
- Single `0` stops reveal/pulse, closes dock, bridge and Rohdaten, and replaces the lab search with `{}`.
  Defaults are A, Seite, line 1, Durchsicht 0, no comparison/focus, pdftotext, zoom 100, no generated recipe.
  It does not clear the dock session flag or local drafts. Browser verification confirmed the closed dock and retained `"1"` flag.
- The canvas route currently validates only optional `query`. `Canvas.tsx` resolves the reference title,
  then mock thread/action titles, then “Untersuchung”. An unknown ID renders that title, Geteilt, mock
  participant initials AI/JB/KG, Teilen, “Noch keine Belege für diese Untersuchung.”, an empty evidence grid
  and the existing empty conversation input. No unknown-ID evidence cards are rendered.
- The bridge currently links to `/canvas`, whose separate fallback page is retained by this brief.
- Existing reveal from P1 produces `/lab?probe=b&ansicht=seite&durchsicht=100`.
  For the requested presenter URL, avoid adding a redundant default `ansicht` when the current view is already implicit;
  retain explicit view parameters and switching back from other views. Existing lab validation and defaults remain unchanged.
- Private drafts are a JSON array in `localStorage["commons.drafts.v1"]`, keyed by `problemId` plus optional
  `parentId`. Presenter reset must remove both root and reply drafts for `usb-c-no-data` while preserving other problems.

Memory checked: `cp_7cdc6f026054f6d6650d202f`, cutoff `93a5445150d0`, older than this base; the current
knowledge manifest and current concept were read. This report is an observation, not an Observstory review.

# PHF sprint — stream B: PDF Lab opening
1 November 2026 · assistant-authored (Claude Code, `kind: assistant`) · self-verified, not reviewed.
Plan: [PHF-ONE-HOUR-SPRINT.md](../build/PHF-ONE-HOUR-SPRINT.md) stream B.

## Base and branch
- Base: `docs/phf-three-part-story` at `9b37df773e258900aa67750fb07251a97fdcdb55` (main `4c998e9` does not contain the plan).
- Branch: `feat/phf-pdf-opening`, separate worktree. Session started 09:56 CET; handoff ~10:05 CET.

## What the presenter gets
Direct URL (local contract, PDF Lab served on :8000 from `sideprojects/pdf-lab`):

```sh
cd sideprojects/pdf-lab && python3 -m http.server 8000 --bind 127.0.0.1
```

**http://127.0.0.1:8000/opening.html** — six scenes, about 60 seconds:

1. **What survives when a document travels?** — question first.
2. **Read with your eyes** — the actual recorded MuPDF render of `output/pdf/01-poem-other.pdf`, with a link to the real PDF.
3. **The one reveal: Same file. Same pixels. Another poem.** — render beside the recorded extraction; each visible line pairs with the line the reader actually returned (staggered flip; instant under reduced motion). Engine switch shows Poppler's raw output too, including that it joins/reorders lines.
4. **Mechanism** — `LIVE`: the page fetches the real PDF bytes, reads the Type 3 CharProcs (what each glyph *draws*) and `/ToUnicode` (what it *means*), and checks the SHA-256 against the recorded specimen hash. Falls back to an `OFFLINE` label if the file can't be fetched.
5. **Let the file travel** — measured Ghostscript 10.08.0 pdfwrite result: Poppler 0 of 484,704 pixels changed, MuPDF 3,043, extraction becomes “A B C D”.
6. **Bridge** — “What should survive when an answer travels through AI?” → *Back to the presentation*, *Explore the full cabinet*, *Replay*.

Controls: → / Space / PageDown next, ← / PageUp back, Home/End, `C` cabinet; on-screen ←/→ buttons and step dots (no hover dependency). Deep links `#step-1`…`#step-6`.
Return target: `?return=<http(s) or relative url>`; else same host `:8001` when served on `:8000`; else `../presentation/` under a staged `/pdf-lab/` path; else `../../presentation/` from the repo root. A `?return=` with another scheme (e.g. `javascript:`) is ignored.

A “What this opening does and does not claim” drawer keeps RECORDED vs LIVE distinctions and the not-run list beside the comparison.

## Files changed
- New: `sideprojects/pdf-lab/opening.html`, `opening.css`, `opening.js`, `test-opening-browser.js`, `evidence/phf-sprint/*.png` (12 screenshots).
- Edited: `sideprojects/pdf-lab/index.html` (one “Guided 60-second opening” button in the intro), `sideprojects/pdf-lab/README.md` (presenter note), `modules/pdf-history/index.html` (one link in chapter 06), `modules/pdf-history/README.md` (“Into the lab”).
- Not touched: `output/**`, existing `evidence/**`, `research/**`, generators, measured results.

## Checks run
| Command | Result |
| --- | --- |
| `NODE_PATH=<existing playwright> node test-opening-browser.js --shots` (Chromium, 1440×900 and 390×844, plus reduced-motion) | passed: keyboard walk 1→6, extraction pairs, Poppler view, live parse + hash match, rewrite facts, return link default and `?return=`, deep link, buttons/dots, no horizontal scroll, specimen links 200, zero console/page errors and failed requests |
| `node test-poems.js` | passed |
| `node test-cabinet.js`, `node test-machine.js` | passed |
| Node unit check of `readPoemMap` on visible and alternate fixtures, `returnTarget` cases | passed |
| Smoke load of cabinet `index.html` and `modules/pdf-history/index.html` | links resolve; history page no errors; cabinet logs one 404 (no favicon; pre-existing, not changed) |

Not run: `test-poems-browser.js` (needs PyMuPDF/Poppler Python env; poem files and `poems.js` untouched), any regeneration, native PDF viewer copy/paste, screen reader pass.

## Evidence
Screenshots: `sideprojects/pdf-lab/evidence/phf-sprint/opening-{1..6}-*-{desktop,phone}.png`.

## Limitations / for D
- The return default assumes the documented :8000/:8001 contract; D should pass `?return=` from the shell for any other host.
- When staged on Pages under `/pdf-lab/`, the pdf-history link (`../../sideprojects/pdf-lab/opening.html`) is repo-root relative; adjust if history is staged elsewhere.
- Live hash check needs a secure context (https or localhost); on a LAN IP it says so instead of claiming a match.
- No universal viewer or forgery claim is made; numbers are the committed bounded runs.

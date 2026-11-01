# E v2 integration and live preview

User requested conflict resolution, merge and a live page on 1 November 2026.

Resolved the two conflicts with main: preserve the current Commons hub, actor attribution and workbench gating; mount E once before the journey. Drop unused legacy E CSS, retaining the v2 component stylesheet.

The standalone `apps/commons/e-preview/` renders the same production EGuide and seven EPixelSprite poses, with a mission selector. It needs no backend. The Observatory Pages workflow builds it into `/e/` alongside the existing dashboard. Source-link missions remain source links. Walking, multi-frame animation and three-minute choreography are not implemented.

## Validation

- Commons typecheck: pass.
- Vitest: 205/205 tests, 21 files pass.
- Record index: byte-identical.
- Commons production build: pass (existing bundle-size advisory).
- CLI multi-entry smoke: pass, including contribution/reply/rediscovery, moderation and restart.
- Preview standalone TypeScript check and Vite build: pass.
- Local browser check: unavailable; Chromium download returned an invalid archive. No screenshot or interactive browser verification claimed.

## Evidence and handoff

Published knowledge resolved to `9e864a5f012856546f10ce8303487390c93d5fcb`, 15/15 selected sources read, no diagnostics. Published snapshot was also read. Memory packet `cp_7cdc6f026054f6d6650d202f` is older (cutoff `93a5445`) and is not current state.

PR: https://github.com/blackmath88/baselhack26-open-presence/pull/34

Expected preview after successful Pages deployment: https://blackmath88.github.io/baselhack26-open-presence/e/

Open work: verify deployed rendering and controls in a browser; animation and spatial navigation remain separate future work. PR #28 is included in #34 and should be closed as superseded after #34 merges.

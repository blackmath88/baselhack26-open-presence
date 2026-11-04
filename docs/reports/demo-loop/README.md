# Demo loop — brief 1 verification

The [pre-code Step 0 audit](STEP-0.md) records the original dock, reset, unknown-canvas and fresh-profile behaviour.
Base: `docs/demo-loop-specs` at `df9bec5f5c081ed23501a3b7d2496a7a4b5b91e7`; PR #60 was open when work started.
Implementation branch: `feat/demo-1-pdf-transition`.

## Delivered

- The investigation registry maps `bilderrahmen-mac` to problem `usb-c-no-data` and the specified German title/question.
- The bridge now pushes `/canvas/bilderrahmen-mac?von=lab`. The canvas shows the title, exact arrival copy and existing
  “Noch keine Belege für diese Untersuchung.” state. The `/canvas` fallback is unchanged.
- The arrival link goes back through the actual bridge history entry, including after reload; a direct arrival falls back
  to `/lab`. Mode/tool navigation drops `von`. The route accepts only `von=lab` and replaces invalid values out of the address.
- Two separate `0` presses within two seconds or **Werkzeuge → Demo zurücksetzen** restore lab defaults, clear the dock
  flag and remove root/reply drafts for `usb-c-no-data`. Other drafts/storage remain intact. The existing live toast says
  “Demo zurückgesetzt”. The normal introduction marks the cleared flag as seen again when it reopens.
- One `0`, a held key and presses outside the two-second window retain ordinary reset behaviour. Inputs ignore the shortcut.
- Lab parameter validation/defaults are unchanged. Reveal from an implicit Seite view no longer inserts redundant
  `ansicht=seite`, yielding the exact presenter URL. Explicit view parameters still switch to and retain `ansicht=seite`.
  Reveal animation, pulses and reduced motion are unchanged.

## Verification on 3 November 2026

Commands run in `apps/commons`:

| Command | Actual result |
| --- | --- |
| `npm run typecheck` | Passed all three TypeScript projects |
| `npm run build` | Passed typecheck, Vite client/server build and SPA prerender |
| `npm run test:aurora` | Passed existing 1440px/390px shell, navigation and local API/fallback browser checks |
| `npm test` | 243 tests passed across 28 files; includes four storage-boundary cases and the local PDS suite |
| `DEMO_CAPTURE=1 DEMO_REPORT_DIR=../../docs/reports/demo-loop npm run test:lab` | Passed existing lab suite plus ten new desktop/mobile transition checks |

[Browser results](01-verification.json) record the exact rehearsed flow on desktop and mobile:
reset → P1 → R → ↓↓ → F → F → bridge. Browser back restores **`/lab?probe=b&durchsicht=100&zeile=3`**.
The arrival return link also restores this URL after a canvas reload. The tests cover a fresh context, single/double/held
reset and the two-second timeout, selective draft removal, launcher reset, direct arrivals, `von=x` removal while preserving
`query`, same-canvas and other-route navigation, and the unchanged `/canvas` fallback. No write request occurred in the
new transition checks. Both arrival states had zero axe WCAG 2 A/AA and 2.1 AA violations and no horizontal page overflow.

Captures at device scale 2:

- [Desktop, 1440×900](01-arrival-desktop.png)
- [Mobile, 390×844](01-arrival-mobile.png)

To reproduce the captures, run `npm run build`, install Chromium with `npx playwright install chromium`, then the
capture command above. `npm run test:lab` includes the transition checks in CI and writes temporary reports by default.

The token files, dependency manifests/lock, lab search validator, canvas index and standalone Workbench have no diff
against the starting branch. No new colour was needed. The AGENTS-required finding is unreviewed; no review was written.

## Unverified and scope

Only Chromium was exercised; Safari/Firefox and a manual screen-reader pass were not run. No actual frame connection,
new PDF reader run, server-room cleanup, contribution submission or later demo brief is claimed. Existing shared/header
avatars and the empty conversation input are inherited from the canvas; photo-frame cards and composer belong to later
briefs. Reset touches browser-local state, not server room records. No merge or deployment was performed.

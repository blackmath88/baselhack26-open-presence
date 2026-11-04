# Commons Aurora verification

3 November 2026 · Codex (assistant)

The supplied Aurora mock was ported into `apps/commons` on `feat/commons-aurora`. [Step 0](STEP-0.md) records the baseline inspection before implementation. The six PNG captures in this directory are taken from the production preview with Playwright at the requested 1440×900 and 390×844 CSS viewports, device scale factor 2.

## Implementation

- React 19 and TypeScript, migrated from the Vite/hash shell to TanStack Start v1 using the [official basic starter structure](https://github.com/TanStack/router/tree/main/examples/react/start-basic). The optional Tailwind/devtools layers are omitted. The current Start release requires Vite 8.
- [Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode) keeps the existing API ownership intact. The prerendered entry is `dist/client/index.html`. The existing Worker asset binding now targets `dist/client`; the API routes and Worker implementation are unchanged. Local hosting and builds were verified; no deployment was performed.
- `tokens.css` matches the supplied file byte-for-byte and is imported once at the root. `styles/supplemental/tokens.css` names values that were already in the reference CSS/SVG but absent from the base file. Aurora component CSS/SVG contains no literal colours. Geist and Geist Mono are served locally through Fontsource.
- The `/`, `/canvas/$investigationId`, `/actions`, `/actions/$actionId` views use German mock content from `src/mock/commons.ts`. Canvas uses a typed body registry: table, stat tiles, line chart, chain graph and stacked bar. No chart/state/styling framework was added.
- The mode switch derives its active state from the route. Selected reviews, their canvas links and subsequent composer submissions reuse the investigation ID. Other investigation IDs show an empty evidence state rather than reusing unrelated mock evidence.
- `/find` reuses the original reader, match explanations, comparison function and API client. API reads reuse the existing prototype session; absent/unavailable service access falls back to the real committed corpus. Original source text stays verbatim even when it is English; UI labels are German. Existing search/problem/compare hash links redirect to the new read route.
- The old application entry point and `cloud-control.css` are removed. Prior standalone components, data modules and the independent e companion/preview remain available; the new shell follows the approved mock without adding the companion to it.

## Checks

- `npm run typecheck`: pass (browser, Node server and Worker).
- `npm test`: 234 tests in 26 files pass.
- `npm run build`: pass, including SPA prerendering.
- `npm run build:e` and `npm run build:companion`: pass after the Vite update; the separate e outputs remain buildable.
- `npm run index:check`: committed record index reproduced byte-for-byte.
- `bash scripts/smoke/multi-entry.sh`: pass; contribution/reply, replay protection, passage citation, rediscovery, moderation and persistence still work through the existing API/CLI service.
- `npm run test:aurora`: pass. This replaces the retired hash-UI browser tour in CI and checks both requested viewport sizes, direct routes, composer/action identity, highlights and scroll, launcher search/Escape/shortcut/focus trap, real API reads, compare context, legacy read links, service-outage fallback, reduced motion, local fonts and JavaScript errors. Detailed results: [interactions.json](interactions.json).
- Production-preview accessibility scan: no automated WCAG A/AA violations in the six captured states. No horizontal page scroll at 390 px. [accessibility.json](accessibility.json).
- `git diff 1077ce9 -- apps/commons/src/commons apps/commons/src/lib apps/commons/server apps/commons/worker apps/commons/corpus`: empty. No data/API/backend modules were changed.

## Visual comparison

[visual-comparison.json](visual-comparison.json) reports pixelmatch differences from the supplied PNGs, with threshold 0.15 and antialiasing excluded. These numbers describe changed pixels, not a perceptual fidelity score.

| Capture | Changed pixels |
| --- | ---: |
| Desktop assistant | 2.33% |
| Desktop canvas | 3.24% |
| Desktop actions | 4.06% |
| Desktop launcher | 0.72% |
| Mobile assistant | 5.94% |
| Mobile canvas | 5.12% |

The layout, colors, spacing, content and SVG geometry follow the reference. Remaining differences include locally packaged font metrics/rasterization, brighter metadata text to meet 4.5:1, real input/select semantics, and the mobile table now scrolling inside its card instead of overflowing the page. Conversation references are keyboard-accessible links and retain inline wrapping; the follow-up composer is a real textarea.

## Scope and limits

The quote investigation, charts and reviews are supplied prototype data, not claims about the real corpus. Review approval/discard and follow-up messages are local preview state; approval explicitly confirms that source records remain unchanged. Other review items have no invented detailed plans. Auth, collaboration, backend writes from the new mock review flow, and new endpoints are outside this port. The former browser contribution workflow is retired; write operations remain covered and available through API/CLI/MCP.

The preserved corpus makes the lazy-loaded Find bundle about 530 kB before gzip; the build reports the existing-data chunk size warning. It is not loaded with the assistant shell. Automated accessibility checks do not substitute for a full assistive-technology review.

## Reproduce

From `apps/commons` on Node 22.12+:

```sh
npm ci
npx playwright install chromium
npm run test:aurora
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In a second terminal:
AURORA_URL=http://127.0.0.1:4173 npm run capture:aurora
```

The browser smoke starts isolated API/UI processes and temp data itself, then stops them. The screenshot command writes the six captures and accessibility/visual comparison reports into this directory.

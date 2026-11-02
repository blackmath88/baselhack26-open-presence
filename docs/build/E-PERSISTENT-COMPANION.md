# Persistent e — authored place, user movement, no hiding

Explicit user direction, 2 November 2026: “e has an orchestrated place, wherever it makes sense, and user can move it but not hide it.” Also requested earlier: quicker wording, slower smoke.

## Implemented slice

- Shared React/TypeScript portal, mounted once per document. A fixed layer captures pointer events only on e and its conversation, preserving the underlying page.
- Curated page contexts: character preview, Commons (including comparison), .phf story, PDF Lab, PDF history and Observatory. Contexts select safe authored anchors and a preferred docking side. On narrow screens e docks within the viewport.
- e repositions near visible anchors after scrolling settles or a hash/route changes. User dragging overrides authored placement until “Return to e’s place” or Home while e is focused.
- Drag e directly; focus the character and use keyboard arrows to move, Shift+arrows to move farther. There is no visible grip or text below e. Positions are clamped and stored as fractions in localStorage; unavailable/corrupt storage falls back safely.
- No Hide, Dismiss or Restore action in the persistent companion. Close/Escape closes only the conversation and returns focus to e. Position reset and Pause/Resume remain available.
- Small authored panel: Explain this, Show me around, Side quest and a bounded page-question response. It is labelled an authored guide. No LLM/backend or external submission is connected. Messages live only in memory for this document; Commons hash navigation keeps the component and messages alive. Full-page navigation remounts it, restoring position and pause state only.
- A quiet 24-second cycle: double blink, short two-jolt cough with a tiny puff, slow 5.2-second exhale, sideways glance and rest. Sparse cue boundaries drive SVG expressions and CSS body/smoke animation. Paused, reduced-motion and hidden-document states cancel pending cues. Dragging writes the compositor transform directly; native Web Animations API handles authored movement. No perpetual per-frame React loop for the companion.
- Shared IIFE/CSS bundle embeds the same React character into the hosted static story, PDF pages and Observatory. Commons and the e preview import it directly; no duplicated character artwork.
- Wordmark film shortened to 14.2 seconds. Its white-smoke window remains 6.1 seconds. The compact historical opening remains 7.6 seconds, but the persistent companion starts as the approved settled e.

## Integration

`EGuide` is a compatibility wrapper for `ECompanion`. The React app shell keeps its existing mount. The preview always mounts it outside collapsed controls. `npm run build:companion` produces `dist-companion/companion.js` and `companion.css`. The public packaging script injects relative script/style links additively; JSON, PDF bytes and existing app code remain intact. The Pages workflow builds the bundle before composition. Independent e release artifacts include the embed bundle.

For another static page, load the built stylesheet and deferred script once. For React, mount `<ECompanion />` once in the app shell. `baseUrl` controls side-quest link resolution, and `surface="commons"` declares the local app's context. Authored page contexts are in `src/companion/model.ts`; no arbitrary page crawling or autonomous navigation.

## Verification and limits

Meaningful checks cover invalid stored positions, small viewports, anchor placement, context selection, authored-response limits, additive/idempotent injection and existing suite regressions. Browser checks must cover dragging, keyboard movement, closing the panel without hiding e, reset, reduced motion, resize and route changes. Safe placement is based on curated anchors and bounded docking, not general DOM collision/pathfinding. Hosted public pages receive the bundle; independent local servers require serving the same companion assets or mounting the React component.

Next stages: richer authored waypoints, explicit presentation cueing, and a separately configured agent connection if requested. None is implied by a conversation bubble.

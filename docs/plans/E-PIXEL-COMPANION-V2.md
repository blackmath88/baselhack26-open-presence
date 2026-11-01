# e — lowercase, logo-derived companion for Commons

**Status: v2 merged in #39; lowercase art and opening updated following the explicit user brief below. Later wandering and presentation stages remain proposed.**
**Date:** 2026-11-01
**Starting point:** draft [PR #28](https://github.com/blackmath88/baselhack26-open-presence/pull/28), branch `vibe/e-guide-mascot-992977`.
**Core concept remains:** [HUMAN-SIGNAL-CONCEPT.md](../../HUMAN-SIGNAL-CONCEPT.md). E and the PDF framing are optional. The Commons must work without them.

## Experience / editorial vision

**Adobe → “a dope e”.** The user explicitly requested a joint and a more fucked-up expression, then supplied the Adobe wordmark and clarified: derive the character from its lowercase **e**. Open with a smoke exhale, change colour and shape, finish red-eyed and at leisure. Towelie is the personality reference (spaced-out and distractible); the actual character remains the lowercase e.

The previous clean capital pixel E missed that art direction and is superseded. The new SVG uses a broad bowl, enclosed counter, horizontal crossbar and right-side opening. Over 7.6 seconds it goes crisp → joint/inhale → exhale → slouch/colour shift → leisure. Eyes emerge with uneven heavy lids, red/pink whites and mismatched pupils. The e stays readable throughout and is never horizontally mirrored.

Pause/Resume freezes the opening clock and smoke; hidden documents suspend it. Replay restarts the opening. Reduced motion shows the settled character without animated smoke. This is an authored visual gag, not an autonomous text loop.

## Stack decision for this *draft build*

- Existing React + TypeScript + Vite; original grid-aligned SVG pixel art to start.
- Pure reducer for behaviour; short cancellable timeouts for nonessential ambient poses.
- CSS for layout; future character movement may use Web Animations API and safe DOM anchors.
- No Phaser, Pixi, GSAP, XState, external mascot sprite, runtime LLM or heavyweight new dependency initially.
- Original sprite atlas can replace SVG poses after an approved art contact sheet.
- Concepts adapted from [oneko.js](https://github.com/adryd325/oneko.js) (tiny pose cycles), [VS Code Pets](https://github.com/tonybaloney/vscode-pets) (character/runtime separation), [Webmeji](https://github.com/lars-rooij/webmeji) (interruption and cleanup), and Motte (accessibility and optional content). **No third-party code/assets vendored.** Audit licensing before any future direct copying.

## Slice A — Alive (implemented in draft, pending verification)

- Lowercase logo-derived vector e with red eyes, uneven lids, joint and continuous SVG transform; previous 32×32 capital art superseded.
- `EPixelSprite` with idle, blink, look-left, look-right, sleep, surprised, excited poses.
- `reduceE` pure transition model; no unbounded speech loop.
- EGuide retained as compatibility entry point; mission metadata remains typed.
- User-initiated side mission; Pause/Resume, Hide/Restore; reduced-motion and document visibility handling.
- Tests for state transitions and bad mission indices.
- **Not yet a production sprite-sheet animation**: poses are simple, static SVG states. No route-aware wandering yet.

**Accept when:** typecheck, tests and build pass; human approves expression at 32/64px; mobile and keyboard sanity check; no timer leak or focus shift; Commons without E still makes sense. These checks are not asserted complete here.

## Slice B — Wander to safe anchors (proposed, not built)

- Three authored positions: greeting dock, PDF Lab invitation, return-to-main dock.
- DOM-ref registry + viewport-coordinate measurement; no arbitrary page crawling.
- Movement only on explicit navigation or demonstration events, not pointer chasing.
- Exclusion zones for inputs, primary actions, dialogs and text.
- CSS/WAAPI transform on outer wrapper; sprite pose independent.
- Clamp, cancel on resize/scroll or unmount; stationary dock on narrow screens.
- One verified runnable demo route. Source directories remain **source links**, not mislabeled live demos.

**Accept when:** 390/768/1440px and zoom testing confirms E cannot obscure controls, fallback works for missing anchors, and no keyboard/focus disruption occurs.

## Slice C — Three-minute story choreography (proposed, not built)

- Three-act cue sheet for `.phf`: problem → working system (longest) → possibility.
- Explicit script clock with start/pause/reset/seek; cues are reproducible and never auto-open external links.
- Scripted joke: E notices a PDF side mission, pauses, returns to the main product.
- Live presentation mode can hold for readiness; distinguish it from deterministic recording.
- Trace and replay one complete three-minute fixture.

**Accept when:** recording replay is deterministic, seeking does not duplicate side effects, failed demos fall back, and the Commons narrative works when E is hidden.

## Follow-on character lab

Create a small dev-only pose/state preview (32/48/64px, light/dark, reduced-motion, force event, pause, viewport). Use it before investing in a PNG sprite atlas.

## Boundaries, evidence and decision status

- Source-level research supplied by user on 2026-11-01; primary external references above. Source reports must not be promoted to run-time verification.
- E belongs in Commons initially. **Do not** extract a shared E/Motte package until both integrations prove common contracts.
- No accepted change to canonical product concept, publishing status or selected memory records is implied by this plan.
- Feature branch should be merged only after review and checks.
- Published `data/knowledge.json` and `data/snapshot.json` were inaccessible at preparation time. Repository `.observstory/knowledge.json` and AGENTS.md were consulted instead; this does not prove current published snapshot completeness.

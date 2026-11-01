# Lowercase e: smoke and leisure opening

User brief: derive from the supplied Adobe wordmark’s lowercase e; joint or exhale; colour/shape shift into a fucked-up, red-eyed, leisurely character. Earlier joint request had been missed by the clean v2 build.

Implemented with the existing SVG/React components, no new runtime dependencies. `EPixelSprite` keeps its compatibility export but now draws the lowercase e. `EOpening` owns a cancellable 7.6-second clock and Replay: crisp, inhale, exhale, melt, leisure. Smoke animates only during the exhale/melt window. Pause and document visibility suspend the clock and smoke; reduced motion shows a static final state. Updated the shared Commons component and existing `/e/` preview. Source-link side missions remain unchanged.

Validation: 207 tests pass; Commons typecheck/build and standalone preview build pass. Rendered and visually inspected three static SVG stages at 220px; confirmed readable lowercase e, joint, eyelids and colour/shape shift. Static rendering does not verify motion timing in a browser. Full interactive browser QA remains unverified locally.

Knowledge feed read at `1e53da9f690d3c4ea192056d858e99cb5403d8cb`, 15/15 sources, no diagnostics; snapshot read (generated 2026-11-01T14:33:55Z). Historical memory packet `cp_7cdc6f026054f6d6650d202f` remains older than current code.

Affected: EPixelSprite, EOpening, EGuide, component CSS, standalone preview, art-direction plan. Open: walking and three-minute choreography remain future work. Current preview: https://blackmath88.github.io/baselhack26-open-presence/e/

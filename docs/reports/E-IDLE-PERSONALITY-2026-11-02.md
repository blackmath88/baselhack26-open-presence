# e idle personality, without a label

User selected the persistent companion and requested no “move e” text underneath it, plus cycling eye blinks, coughing and smoke blowing.

Removed the visible grip/button and tooltip. The character itself retains direct dragging and now owns keyboard arrows/Home, with movement instructions only in accessibility metadata. Added cough/exhale SVG poses and a sparse 24-second cue schedule: double blink, brief two-jolt cough/tiny puff, slow 5.2-second bubbly exhale, glance and rest. CSS owns body/puff frames. Pause, reduced motion and hidden tabs cancel pending cues; scheduler cleanup prevents timer accumulation. Closing the conversation continues to leave e visible.

Checks: 234 tests pass (including fake-clock cue timing, inactive/cancel and repeat/cleanup cases), companion/preview builds and typechecks pass, six packaging checks pass. Browser smoke updated for keyboard movement on e itself and no text beneath it. Selected final art, wordmark movie, authored positions and page guide remain intact.

Sources: explicit current user brief; docs/design/DOPE-E.md; persistent companion from #51/#52. Published knowledge resolves f49ad1c5535a19edc5f675810334b4eeabbe9a22, 15/15 selected sources read, no diagnostics; snapshot generated 2026-11-02T12:07:18Z. Historical packet cp_7cdc6f026054f6d6650d202f is older. No human review record authored.

Affected: ECompanion, idle scheduler, EPixelSprite poses, companion CSS, tests/smoke and docs. Actual agent connection remains separate.

# Persistent e delivery

Explicit user direction: e has an orchestrated place where it makes sense; users can move it but cannot hide it. The implementation plan is docs/build/E-PERSISTENT-COMPANION.md.

Built the shared React portal, curated page contexts, safe-anchor/side docking, native drag plus keyboard movement, viewport clamping, remembered user placement and reset-to-authored-place. No Hide/Dismiss control: Close/Escape affects only the bubble. Sparse pose changes and CSS/native animations keep the persistent companion out of a per-frame React render loop. The panel provides authored page explanations and side quests; it does not pretend to call an LLM. Commons keeps e mounted over hash-route changes; static pages restore position/pause on each load.

A production IIFE/CSS build embeds the same component into the hosted Observatory, story, PDF Lab and PDF history. Public packaging injects links additively, preserving the root application and data. The e preview mounts the overlay directly. The wordmark film is 14.2 seconds; its smoke still lasts 6.1 seconds. Selected final art is unchanged.

Checks: 231 tests pass, companion and preview production builds/typechecks pass, six site packaging tests pass. Added CI browser smoke for one mounted e, panel open, no Hide, keyboard movement/clamping on a phone viewport, and panel closure preserving the character. PR #51 CI passed, including the phone-viewport browser checks. Live cloud-browser checks confirmed direct dragging, remembered placement after reload, return to authored placement and Close preserving e. Found and fixed Escape handling when focus remains on the trigger; added a browser regression. Verified the static PDF Lab embed and its page-specific guidance. Its side quest now points to PDF history rather than looping to the current Lab.

Sources: current user direction; docs/design/DOPE-E.md; development-practice website-companion case on PR #1 (proposed research, not authority). Published knowledge resolves c027ef82938bf8827c68751f75e991bade367a4b, 15/15 sources, no diagnostics; snapshot generated 2026-11-02T10:54:33Z. Historical packet cp_7cdc6f026054f6d6650d202f is older than this build. No human review authored.

Limits: authored anchors/docks are not arbitrary collision/pathfinding; independent local static servers need the matching companion assets; messages are document-local; free walking, three-minute choreography and a real agent connection remain future work.

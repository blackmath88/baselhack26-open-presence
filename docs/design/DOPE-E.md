# a dope e — character contract

**User-selected visual baseline, 1 November 2026:** [e3cdab0 / PR #41](https://github.com/blackmath88/baselhack26-open-presence/pull/41). The user responded “i love it, is really good” and asked to make it deployable and stick to this vision. This records that explicit selection; it is not an assistant-authored human review record.

[Live character](https://blackmath88.github.io/baselhack26-open-presence/e/) · [build and deployment](../../apps/commons/e-preview/README.md)

## Keep this character

- A **lowercase e**, derived from the supplied Adobe wordmark: broad bowl, enclosed counter, horizontal crossbar, open right side. Never change it back to a capital E or generic square mascot.
- Starts crisp and red. The joint appears; e exhales; the silhouette slouches/skews, colour darkens and the face emerges. Settles into leisure mode, with uneven heavy lids, red/pink eyes and wonky pupils.
- Spaced-out, dishevelled, easily distracted, quietly funny. Towelie informs the personality; the visible figure remains this e.
- Joint at the corner of the mouth and soft drifting smoke are intentional character elements. Do not clean them away during polish or a redesign.
- Keep the clean surrounding interface. The character carries the mischief.

## Opening rhythm (7.6 seconds)

| Time | Beat |
| --- | --- |
| 0–1.3 s | Crisp red e |
| 1.3–2.9 s | Joint / inhale |
| 2.9–4.7 s | Exhale; shape and colour begin changing |
| 4.7–7.6 s | Slouch and melt into the final expression |
| After 7.6 s | Leisure; opening does not loop |

Replay explicitly restarts it. Pause freezes clock and smoke. Hidden documents suspend both. Reduced motion shows the settled e without moving smoke. E never steals focus or opens a side mission automatically; The current persistent companion has no Hide/Dismiss action; closing its conversation keeps the character visible.

## Wordplay and absorption film (14.2 seconds)

User extension, 2 November 2026: make the word joke clearer through widening spacing and **Adobe → A dobe e → A dope e → a dope e**, with a visible b-to-p transition. Add large white bubbly smoke/dust; backgrounds may change for visibility. The other letters should fold into e, so e carries the whole phrase's meaning.

| Time | Beat |
| --- | --- |
| 0–0.7 s | Adobe-like wordmark |
| 0.7–1.7 s | Spacing widens; an e echo makes **A dobe e** |
| 1.7–2.5 s | Hold **A dobe e** |
| 2.5–3.3 s | b’s upper stem slides down into the p descender |
| 3.3–4.1 s | Hold **A dope e** |
| 4.1–4.7 s | Capital A becomes lowercase a |
| 4.7–5.4 s | Hold **a dope e** |
| 5.4–6.8 s | e turns, then joint/inhale |
| 6.8–10 s | Broad white bubbly exhale rolls left across the words |
| 10–12.9 s | Letters rotate, fold and shrink into e’s bowl |
| 12.9–14.2 s | e centres and grows slightly; the background clears to light |

The public preview leads with this film (`EOpening variant="wordmark"`). A dark blue stage makes the white smoke readable; the settled character retains its selected red-eyed/slouched appearance on light. Smoke puffs, tracking, morph and letter absorption use the same clock, so Pause freezes all of them and Replay restarts the whole sequence. Reduced motion skips directly to e alone without smoke. The compact Commons opening remains 7.6 seconds.

The inserted letter e uses the canonical `E_GLYPH_PATH`, and the surviving e uses the existing EPixelSprite; this does not introduce a competing character drawing. The earlier films from #49/#50 are superseded by the user-requested quicker word transitions. The full 6.1-second smoke window is preserved.

## Implementation boundary

`EGuide` is the Commons integration. `EOpening` owns the opening clock. `EPixelSprite` is the SVG renderer (legacy export name retained for compatibility; the selected art is smooth vector). `e-preview` uses these same components; never fork a separate character just for deployment.

Deployment/refactoring changes preserve the selected shape, colours, expression, props and timing. Intentional future changes to those features should show a before/after visual checkpoint and cite this contract. Build/test success alone does not establish visual fidelity or motion quality.

Persistent placement and user dragging are implemented in the shared companion. Free walking and three-minute presentation choreography remain future work. See [the persistent companion plan](../build/E-PERSISTENT-COMPANION.md).

## Small companion idle cycle

User request, 2 November 2026: remove the “move e” text underneath the character and animate blinking, coughing and smoke blowing. The character is now the visible control: no label, grip or tooltip underneath it. Drag directly, or focus e and use arrows/Home; movement instructions remain available to assistive technology.

A quiet 24-second cycle uses two brief blinks, an 850ms two-jolt cough, a slow 5.2-second bubbly exhale and a glance. Rest separates actions. Expressions and body motion extend the selected e; its silhouette, colours and settled personality remain intact. Pause, reduced motion and hidden tabs stop the cycle. No sound or continuous React animation-frame loop is added.

## Backwards baseball cap

User-approved extension, 3 November 2026: a small, crooked navy baseball cap worn backwards, with a visible front adjustment strap and a brim behind the head. The cap emerges with transformation progress; the initial clean logo stays bare. It shares the character’s body transform and preserves the lowercase silhouette, visible eyes, joint and idle cues.

Handoff: shared EPixelSprite updated; 19 companion tests, preview build and companion build/typechecking passed. No animation timing changes. Browser motion QA remains open. Source: explicit user approval in this conversation; character contract above. Existing idle cycle and no-label behaviour are already on main.

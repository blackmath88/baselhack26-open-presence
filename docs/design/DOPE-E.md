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

Replay explicitly restarts it. Pause freezes clock and smoke. Hidden documents suspend both. Reduced motion shows the settled e without moving smoke. E never steals focus or opens a side mission automatically; Hide/Restore stays available.

## Wordplay and absorption film (21.2 seconds)

User extension, 2 November 2026: make the word joke clearer through widening spacing and **Adobe → A dobe e → A dope e → a dope e**, with a visible b-to-p transition. Add large white bubbly smoke/dust; backgrounds may change for visibility. The other letters should fold into e, so e carries the whole phrase's meaning.

| Time | Beat |
| --- | --- |
| 0–1.5 s | Adobe-like wordmark |
| 1.5–3.4 s | Spacing widens; an e echo makes **A dobe e** |
| 3.4–4.8 s | Hold **A dobe e** |
| 4.8–6.5 s | b’s upper stem slides down into the p descender |
| 6.5–8 s | Hold **A dope e** |
| 8–9.3 s | Capital A becomes lowercase a |
| 9.3–10.6 s | Hold **a dope e** |
| 10.6–13.3 s | e turns, then joint/inhale |
| 13.3–15.9 s | Broad white bubbly exhale rolls left across the words |
| 15.9–19.4 s | Letters rotate, fold and shrink into e’s bowl |
| 19.4–21.2 s | e centres and grows slightly; the background clears to light |

The public preview leads with this film (`EOpening variant="wordmark"`). A dark blue stage makes the white smoke readable; the settled character retains its selected red-eyed/slouched appearance on light. Smoke puffs, tracking, morph and letter absorption use the same clock, so Pause freezes all of them and Replay restarts the whole sequence. Reduced motion skips directly to e alone without smoke. The compact Commons opening remains 7.6 seconds.

The inserted letter e uses the canonical `E_GLYPH_PATH`, and the surviving e uses the existing EPixelSprite; this does not introduce a competing character drawing. The earlier 11.6-second film from PR #49 is superseded by this explicit user-requested choreography.

## Implementation boundary

`EGuide` is the Commons integration. `EOpening` owns the opening clock. `EPixelSprite` is the SVG renderer (legacy export name retained for compatibility; the selected art is smooth vector). `e-preview` uses these same components; never fork a separate character just for deployment.

Deployment/refactoring changes preserve the selected shape, colours, expression, props and timing. Intentional future changes to those features should show a before/after visual checkpoint and cite this contract. Build/test success alone does not establish visual fidelity or motion quality.

Walking, spatial navigation and three-minute presentation choreography remain future work. They should extend this character, not replace it.

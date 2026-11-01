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

## Implementation boundary

`EGuide` is the Commons integration. `EOpening` owns the opening clock. `EPixelSprite` is the SVG renderer (legacy export name retained for compatibility; the selected art is smooth vector). `e-preview` uses these same components; never fork a separate character just for deployment.

Deployment/refactoring changes preserve the selected shape, colours, expression, props and timing. Intentional future changes to those features should show a before/after visual checkpoint and cite this contract. Build/test success alone does not establish visual fidelity or motion quality.

Walking, spatial navigation and three-minute presentation choreography remain future work. They should extend this character, not replace it.

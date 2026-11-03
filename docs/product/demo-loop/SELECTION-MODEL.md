# Selection model — what the URL carries

3 November 2026 · Claude (assistant) · Proposal. Extends what PR 57 and PR 59 already do; changes nothing existing.

## 1. Principle

Visible cards and the current selection live in the URL so the presenter can reset, link and reload any state. Private text never does. Every parameter is validated the way `validateLabSearch` does it: unknown values fall back to defaults silently.

## 2. Per route

### `/lab` (exists, unchanged)

`probe=a|b|meine` · `ansicht=seite|text|zeichen|struktur` · `zeile=1–4` · `durchsicht=0–100` · `vergleich=1` · `fokus=1` · `leser=mupdf|pdftotext` · `zoom=60–160` · `rezept=[4 strings]`. `0` resets. Presenter reset additionally clears the dock flag in `sessionStorage` (PDF-ENCOUNTER §what is missing).

### `/canvas/bilderrahmen-mac` (new parameters)

| Param | Values | Default | Meaning |
| --- | --- | --- | --- |
| `von` | `lab` | none | shows the arrival line from the bridge; cleared on the next in-app navigation |
| `karten` | comma list of `erfahrung,passt,ergaenzt,aufbau,beitrag` | all five | which cards are visible, in this fixed order; unknown names dropped |
| `beleg` | `e1`–`e5` | `e3` | the passage card 1 shows and card 5 responds to |
| `beitrag` | contribution id | none | highlights one room contribution in cards 3 and 4 and scrolls to it (same mechanism as chat references) |
| `q` | free text | none | the situation words for card 2's match explanation; comes from `/find?query=` when arriving through search |
| `fokus` | `1` | none | collapses the aside; full-width grid (the canvas counterpart of the lab's focus) |

Example of the rehearsed arrival: `/canvas/bilderrahmen-mac?von=lab`. Example of a shared link to Lea's question: `/canvas/bilderrahmen-mac?karten=ergaenzt,aufbau&beitrag=<id>`.

### `/` (Assistent)

`untersuchung=bilderrahmen-mac` selects the thread (exists as route-driven selection; the param name is the only addition so a reload keeps the thread).

### `/actions/…` (Prüfungen)

Path only: `/actions/beitrag-<draftId>`, `/actions/beitrag-<contributionId>`, `/actions/observatory-nachlass`. Tab (`Offen` …) stays local state as today.

### `/find` (exists)

`query`, `selected`, `compare` unchanged. A result that maps to an investigation (today only `usb-c-no-data` → `bilderrahmen-mac`) shows „Im Canvas öffnen“ → `/canvas/bilderrahmen-mac?q=<query>`.

## 3. Never in the URL

Draft text, circumstances, participant identity, tokens, the dock flag, the Prüfungen tab, recipe inputs that were not generated. Drafts stay in `localStorage["commons.drafts.v1"]`; the participant in memory on the server.

## 4. Presenter reset

One control, „Demo zurücksetzen“, in the launcher under Werkzeuge (and `0` on `/lab`). It:

1. navigates to the route's default state (`/lab` or `/canvas/bilderrahmen-mac`),
2. clears the dock flag,
3. deletes drafts for `usb-c-no-data` from `localStorage`,
4. does **not** touch the server room. Contributions made in rehearsal are removed by restarting the server with a fresh `BRAINSTORM_DATA_FILE`, documented in the runbook.

A confirm step is not needed; the action is local and reversible by re-running the path.

## 5. Keyboard

Canvas: `1`–`5` scroll to card 1–5 and set `beleg`/`beitrag` focus; `F` toggles `fokus`; `Escape` closes the composer and returns focus to card 5's button. Letters never fire inside inputs (same guard as the lab).

## 6. Back and reload

Browser back from the canvas returns to the exact lab state. Reload of any URL above restores the same visible cards and selection. Mode switches (Assistent / Canvas / Prüfungen) keep `bilderrahmen-mac` and drop route-specific params that do not apply.

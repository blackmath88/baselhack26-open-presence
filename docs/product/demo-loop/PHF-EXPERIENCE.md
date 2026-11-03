# .phf experience — the photo-frame investigation in Aurora

3 November 2026 · Claude (assistant) · Proposal. Real identifiers from `apps/commons/corpus` and the Node server; UI strings in German.

## 1. One investigation, three modes

Investigation ID `bilderrahmen-mac` ↔ problem record `usb-c-no-data`. The mapping lives in one small module (`src/data/investigations.ts`): `{ id, title, problemId, question }`. It is the only new indirection; everything else reads the existing `commonsReader` (committed corpus) and, when `npm run dev:server` runs, the existing API for room contributions.

- **Canvas** `/canvas/bilderrahmen-mac`: the five cards below, in this order, in the existing evidence grid.
- **Assistent** `/?untersuchung=bilderrahmen-mac` (existing route, selected thread): the conversation of §4, references highlight cards.
- **Prüfungen** `/actions/…`: the contribution preview and the Observatory finale.

Title: „Mein Mac erkennt meinen Bilderrahmen nicht.“ Subtitle chip: „Geteilt“ only when the room has at least one contribution; otherwise „Nur erfasste Quellen“. Avatars: participants who contributed in the room (Kai, Lea), not the mock trio.

## 2. The five cards

Each card is an `EvidenceCard` with a new `kind`. Each shows the CONTEXT-BLOCK in its footer where the object has one. Data sources are named per field; anything not in the data reads „nicht erfasst“.

### Card 1 · „Die Erfahrung“ (kind `experience`)

The original passage, its contributor, and the outcome.

| Field | Source |
| --- | --- |
| Originalworte | `e3.quote`: "Update: it was the cable." (verbatim, English, quotation marks) |
| Davor | issue/12 title from the snapshot manifest: "PF1007 "Portrait" … report: no USB data seen, likely C-to-C cable" |
| Beitrag von | `SourceRef.author` of e3 → **jethrojones** · „Originalquelle“ link = permalink |
| Ergebnis | `approaches[a1].reports` where `evidence = e3` → „hat funktioniert“ (result `worked`) with the approach label "USB-A to USB-C cable known to carry data, into a USB-A port" |
| Interpretation | `e3.interpretation` under the label „Lesart des Datensatzes · Agent · ungeprüft“ (provenance `authoredBy`, `review`) |
| Context block | Wer: jethrojones · Bedingungen: nicht erfasst (the passage has none) · Wann: 2026-10-11 21:10 UTC · Quelle: issue/12 #6113789229 · Unterstützung: nicht erfasst · Ergänzt: 1 (links to card 3) |

### Card 2 · „Passt das zu meiner Situation?“ (kind `fit`)

Five rows, each with „bekannt“ / „unbekannt“ wording from the record, never inferred:

| Row | Source | Shown |
| --- | --- | --- |
| Gerät | `device` | PF1007L · DPF ZC002 (Frameo) · other USB-C-only frames |
| Verbindung | `approaches[a1].label`, `e1.quote` | USB-A → USB-C Datenkabel in einen USB-A-Port; C-zu-C gab „no power and no data“ |
| Strom | `symptoms[1]` | „frame does not power on from a USB-C hub“ |
| Unterschiede | `e2.interpretation` | ein Mac-Bericht vom Mai sah C-zu-C-Daten über einen Hub; CC-Verdrahtung nicht gemessen |
| Unbekannt | `openQuestions[0]` | "Do these boards really lack CC pull-down resistors? Nobody has measured it." |

Below the rows: „Deine Situation“ = the search words if `q` is in the URL (SELECTION-MODEL), with the existing `matchBasis` explanation „Deine Wörter im Datensatz: … · Nicht gefunden: …“. No scoring, no percentage.

### Card 3 · „Was später ergänzt wurde“ (kind `additions`)

A time-ordered list. Sources, merged and sorted by time:

1. Record corrections for this problem: `c-cable-qualified` (2026-10-23 snapshot, `by: repo:wesbos/photo-frame-dashboard`, `absorbed: true`) → „Im Dokument übernommen“.
2. The same author's later qualification in the same thread: `c-71-january` (2026-10-13 02:51 UTC, jethrojones, `absorbed: false`) → „Noch nicht in der Dokumentation übernommen“. It belongs to problem `gadget-error-71`; the row says so: „zu einem anderen Problem: U-Boot-Gadget meldet Fehler -71“ and links to `/find?selected=gadget-error-71`.
3. Room contributions in `commons:usb-c-no-data` from the API (kind `question`, `correction`, `observation`), with their context block. Without a server: „Dienst nicht verbunden · keine Beiträge aus dem Raum“.

Each row: date · who · kind badge (Korrektur / Frage / Beobachtung / Einschränkung) · one line of the text · „übernommen“ / „nicht übernommen“ / „im Raum“.

### Card 4 · „Worauf dieser Beitrag aufbaut“ (kind `lineage`)

Three stages, text, no diagram-only content. Built from fields the Commons holds (the logic of PR 46's `lineage.ts`, ported):

- **Quelle**: `wesbos/photo-frame-dashboard` @ `0bff55ef3fb2`, captured `snapshotAt`, licence note „Thread-Text bleibt bei den Autor:innen; hier nur Auszüge“.
- **Beobachtung**: record `usb-c-no-data`, `authoredBy: agent:claude-opus-5-5`, `review: unreviewed`, ported from Postack commit `originCommit`.
- **Antworten**: the room contributions that cite e3 (`evidenceIds` contains `e3`), with entrance (browser / cli / mcp) and the reply/correction relation.

Each stage says „erfasst“, „teilweise erfasst“ or „nicht erfasst“, with what is not known here.

### Card 5 · „Eigene Beobachtung ergänzen“ (kind `compose`)

The composer, inline in the card. Fields, all existing contract fields:

- Beziehung: „Antwort auf diese Passage“ (`parentId` = `commons:usb-c-no-data:e3`, `evidenceIds: ["e3"]`) · „Korrektur“ (`contradictsId`) · „Eigene Erfahrung“ (root)
- Art (`kind`): Beobachtung · Frage · Versuch · Ergebnis · Korrektur
- Text (`text`), Bedingungen (`circumstances`), Wann beobachtet (`observedAt`, optional)
- Unterstützung (`assistance`): „Ohne KI geschrieben“ (`none`) · „Mit KI-Hilfe“ (`ai-assisted`) · „KI-Entwurf, von mir eingereicht“ (`ai-drafted`)
- Button „Vorschau und teilen“ → Prüfungen. Drafts stay in `localStorage["commons.drafts.v1"]` (existing). Nothing in the URL.

Staged demo text (Kai, labelled as staged in the runbook, never claimed as a new hardware finding): „Bei mir ging es erst mit einem USB-A-zu-C-Kabel direkt am Mac; über den USB-C-Hub kam kein Strom an.“ Bedingungen: „PF1007L, macOS, Hub ohne eigenes Netzteil“. Unterstützung: Ohne KI.

## 3. Prüfungen: preview, attribution, destination, share

Route `/actions/beitrag-<draftId>` while the draft exists; after submit `/actions/beitrag-<contributionId>`.

The page is built from the server's `prepareContribution` result, never echoed from the form (PR 45 rule: the request is the preview).

- Header: „Beitrag teilen“ · chip „Commons“ · time
- Einschätzung → **Genau das verlässt deinen Browser**: `command.text` in a quote block, `circumstances`, `kind`, `assistance`.
- Zugehörige Signale → **Zuschreibung**: context block of the outgoing contribution (CONTEXT-BLOCK §3): Wer = the signed-in participant (Kai), Quelle = e3 → issue/12 permalink, Unterstützung = declaration.
- Vorgeschlagener Prüfplan → **Ziel**: `destination.visibility` and `destination.publication` translated: „Lokaler geteilter Raum auf diesem Server · nicht GitHub · nicht ATProto · Veröffentlichung wäre ein eigener Schritt.“ Plus „Bleibt hier: deine Suchwörter, andere Entwürfe.“
- Footer: „Nichts wird ohne deine Freigabe geteilt.“ · [Zurück zum Entwurf] [**In den geteilten Raum stellen**]. Edited draft → preview stale, button disabled until re-prepared. Network failure keeps the text and offers „Erneut versuchen“ with the same `commandId`.
- After submit: read back from the room: „Im Raum seit 14:02 · als Kai · Browser“ and three ways to find it again: „Im Canvas“, „Suche: …“, `npm run commons -- inspect <id>`.

The local review actions of the mock (Plan freigeben) are not reused here; this Prüfung has one real action.

## 4. The aside (Assistent mode and canvas aside)

No language model. The aside shows a **deterministic reading aid** built from record fields, labelled at the top: „Lesehilfe aus dem Datensatz · kein Sprachmodell“. Three messages:

1. Du: „Mein Mac erkennt meinen Bilderrahmen nicht.“
2. Lesehilfe: „Ein Bericht passt am ehesten: [Die Erfahrung]. Er gilt für [PF1007L und andere USB-C-Rahmen]; ob dein Hub Strom liefert, steht dort nicht. Zwei Tage später hat dieselbe Person [etwas ergänzt].“ (brackets = references that highlight cards 1, 2, 3)
3. Lesehilfe: „Wenn du etwas ausprobiert hast: [Eigene Beobachtung ergänzen].“

If Achim prefers an empty aside for this investigation, the brief has a flag; the mock suggestions („Erstelle eine .phf-Datei …“) are hidden for this investigation either way.

## 5. The second participant

Participant switch is the existing prototype gate (`ParticipantSwitcher`, in-memory tokens). In Aurora it sits in the topbar avatar menu: „Als Lea fortfahren“. The gate text says plainly: „Prototyp-Anmeldung, keine echte Identität.“

Lea's reply (staged): kind `question`, parent = Kai's contribution: „Welches macOS? Bei mir half der Hub nur mit eigenem Netzteil.“ Unterstützung: Ohne KI. It appears in card 3 under Kai's entry and in card 4 under Antworten. Kai's contribution does not change.

## 6. Rediscovery (open decision)

Two scopes, Achim picks one:

- **A · required step**: a second terminal, `BRAINSTORM_PARTICIPANT=Lea npm run commons -- search "USB-A Kabel Hub"`, shows Kai's contribution with author, entrance and cited `issue/12`. Rehearsed; the terminal is on screen. 20 seconds.
- **B · optional**: same command in the runbook, shown only if asked. The UI's „so findest du es wieder“ line after submit already names the command.

MCP through a real agent is not part of either scope unless rehearsed separately (pitch story rule).

## 7. Statistics rule

Stat tiles appear only where a count comes from records: „5 Passagen · 2 Quellen-Threads · 1 Korrektur im Dokument · n Beiträge im Raum“. No percentages, no charts for this investigation. The mock's line chart and stacked bar stay with `schwamm-zitat` only.

## 8. What stays mock

`schwamm-zitat`, `zuschreibung-14` and the other mock threads remain as they are, reachable, and are not shown in the demo. The launcher's „Sammlungen“ stay. The mock `pendingReviews: 12` on the start page becomes the real count of open Prüfungen (the Observatory item plus any draft), or is hidden when zero.

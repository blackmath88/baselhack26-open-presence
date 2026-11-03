# Bridge — from the PDF to the human experience, and where Observatory ends the demo

3 November 2026 · Claude (assistant) · Proposal.

## 1. The PDF → .phf bridge

**Placement:** the end of the PDF investigation. Trigger: the „Zur menschlichen Erfahrung“ button in the Belegleiste of `/lab`, after P3 (one line inspected). Never earlier in the path; the audience must have seen the discrepancy first.

**Overlay (exists, copy stays):**

> VOM DOKUMENT ZUR ERFAHRUNG
> **Was muss mitreisen, wenn eine KI für uns liest?**
> Eine Seite kann gleich aussehen und anders gelesen werden. Bei menschlicher Erfahrung zählt, wer etwas sagt, unter welchen Bedingungen und was später ergänzt wurde.
> [Zurück zur Werkbank] [Zur menschlichen Erfahrung →]

The second sentence names the six context fields in plain words: *wer* (Wer), *unter welchen Bedingungen* (Bedingungen, Wann), *was später ergänzt wurde* (Ergänzt). This is the sentence the canvas cards then prove.

**Target (change):** `/canvas/bilderrahmen-mac?von=lab`. The `/canvas` fallback page stays for direct hits but is no longer the bridge target.

**What travels:** only `von=lab`. The lab's own state (`probe`, `zeile` …) stays in the lab URL; the browser's back button returns to it exactly. Nothing from the lab is written into Commons records.

**Arrival:** the canvas head shows one line under the title while `von=lab` is set: „Aus dem PDF Lab: gleiche Seite, andere Lesart. Hier zählt, was bei Erfahrung mitreisen muss.“ with a link „Zurück zur Werkbank“ (history back if the previous entry is `/lab`, else `/lab`). The line disappears on any navigation inside Commons. It is not a toast; it is static text so the presenter can leave it on screen.

**Mode:** the canvas opens in Canvas mode, not Assistent. The aside shows the conversation for the investigation (PHF-EXPERIENCE §4).

## 2. The second bridge: Canvas → Prüfungen (inside .phf)

Not an overlay. The card „Eigene Beobachtung ergänzen“ opens the composer in the canvas; „Vorschau und teilen“ moves to `/actions/beitrag-<draftId>` in Prüfungen with the same investigation selected in the mode switch. Mode switching keeps the investigation ID (existing Aurora behaviour).

## 3. The Observatory finale

**Decision proposed:** the finale is the **last Prüfung**, not a canvas card. Reason: the demo ends in Prüfungen after sharing, so the presenter is already there; a canvas card would require going back.

**Item:** `/actions/observatory-nachlass`, title „Was diese Arbeit selbst hinterlässt“, source chip „Observatory“, severity none (a plain Prüfung, no „Hoch“ badge).

**Content, all read from committed repo files at build time** (`.observstory/knowledge.json`, `.observstory/coordination.json`, `.observstory/proposals/*.json`), German labels, English quotes as they are:

- Einschätzung: „Observatory beobachtet, wie Menschen und Agenten in diesem Repository zusammenarbeiten. Es weist keine Arbeit zu und bewertet niemanden.“
- Zugehörige Signale (one row per record):
  - Konzept · `concept-human-signal` · Status „current“ · declared in README.md
  - Entscheidung · D1–D4 from coordination.json with `confirmed_by` and date
  - Vorschlag · `pdf-lab-werkbank-20261103` · „Aurora PDF Lab uses recorded evidence and whole-line Type 3 glyphs“ · Status „unreviewed“ · author Codex (assistant)
  - Vorschlag · the proposal the demo-loop build itself files (CODEX-BRIEF-5) · Status „unreviewed“
- Vorgeschlagener Prüfplan: one line: „Ein Mensch prüft die Vorschläge; erst eine Review-Datei in `.observstory/reviews/` nimmt sie an.“
- Link: „Observatory öffnen“ → the published Observstory page if `OBSERVSTORY_URL` is set at build time, else the GitHub Actions artefact link from OBSERVSTORY.md.

**What the item must not do:** show build-progress percentages, lane status or stale warnings. The selected manifest has no implementation records; the pitch story says not to promise a progress view.

**Closing line for the presenter** (not in the UI): „We looked back at what a document carries. We explored what an answer should carry. And we keep our own collaboration inspectable while we build it.“

## 4. Order on the topbar

Topbar tabs stay: Start · Finden · PDF Lab · Observatory. „PDF Lab“ goes to `/lab`, „Observatory“ goes to `/actions/observatory-nachlass` (today it leaves the app). No new tab.

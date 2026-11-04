# Context block — Wer · Bedingungen · Wann · Quelle · Unterstützung · Ergänzt

3 November 2026 · Claude (assistant) · Proposal. One component, three data shapes, no new contract fields.

## 1. Why one block

The bridge sentence promises it: who said something, under which conditions, and what was added later. The same six labels appear on every contribution, on every source passage, in the sharing preview and after submit. The audience learns the block once.

## 2. Rendering

`<ContextBlock>` is a definition list in the card footer (or the Prüfung body), Geist Mono for identifiers, existing `Badge` for status words. Six rows, always all six, in this order. A value the data does not hold reads „nicht erfasst“ in the muted text token, never an empty cell and never a guess. Each value that has a link gets exactly one.

| Label | Meaning |
| --- | --- |
| Wer | the attributable actor and how they arrived |
| Bedingungen | reported conditions, in the actor's words |
| Wann | when it was said or observed |
| Quelle | what it cites or where it was captured |
| Unterstützung | the declared preparation, never detected |
| Ergänzt | what came after it |

## 3. Field mapping

### Source passage (`EvidenceQuote` + `SourceRef`, from the committed corpus)

| Label | Fields | Example for `e3` |
| --- | --- | --- |
| Wer | `source.author`; `'unknown'` → „nicht erfasst“; `authorType` from manifest if present | jethrojones · Originalautor:in |
| Bedingungen | none on a passage → „nicht erfasst“; the record's `environment` is shown on card 2, not here | nicht erfasst |
| Wann | `source.sourceTime` (UTC, shown as `11.10.2026 21:10 UTC`); `null` → „nicht erfasst“ | 11.10.2026 21:10 UTC |
| Quelle | `source.objectId` + `locator`, link `permalink`; snapshot `snapshotId` in mono | issue/12 · Kommentar 6113789229 · Snapshot commons-001@0bff55ef3fb2 |
| Unterstützung | not declared by source authors → „nicht erfasst“ | nicht erfasst |
| Ergänzt | count of room contributions whose `evidenceIds` contains this passage + record corrections that `qualifies` this passage; link to card 3 | 1 Korrektur · 0 Beiträge |

### Room contribution (`CommonsContribution`, from the API)

| Label | Fields | Example for Kai's demo contribution |
| --- | --- | --- |
| Wer | `actor.displayName` (fallback `actor.id`), `actor.kind` → „Teilnehmer:in“ / „ATProto“ / „Import“, `entrance` → „über Browser / CLI / MCP / HTTP / ATProto“, `'unknown'` → „Zugang nicht erfasst“ | Kai · Teilnehmer:in · über Browser |
| Bedingungen | `circumstances`; absent → „nicht erfasst“ | PF1007L, macOS, Hub ohne eigenes Netzteil |
| Wann | `observedAt` if set („beobachtet“), else `createdAt` („eingereicht“) | eingereicht 03.11.2026 14:02 |
| Quelle | `sourceRefs[].objectId` with permalinks; `evidenceIds` → „genaue Passage e3“; `parent` → „Antwort auf …“; `contradicts` → „korrigiert …“ | genaue Passage e3 · issue/12 |
| Unterstützung | `assistance.declared`: `none` → „ohne KI geschrieben“, `ai-assisted` → „mit KI-Hilfe“, `ai-drafted` → „KI-Entwurf, selbst eingereicht“; always suffixed „(Erklärung der Person)“ | ohne KI geschrieben (Erklärung der Person) |
| Ergänzt | replies and corrections whose `parent`/`contradicts` point here, with count and the latest date; `publication.status` if not `null`/`local`: „veröffentlicht“, „in Warteschlange (nicht veröffentlicht)“, „fehlgeschlagen“ | 1 Frage von Lea · 03.11.2026 14:05 |

### Ingested record (`origin.kind === 'atproto'`)

Same as a room contribution, plus in Quelle: `origin.uri` and `cid` in mono, `availability` as badge („verfügbar“, „veraltet“, „nicht erreichbar“, „gelöscht“, „ungültig“). Only shown if the isolated PDS was configured; otherwise this shape never appears.

### Outgoing contribution (sharing preview, `PreparedContribution`)

Built from `command` and the signed-in actor, labelled „So wird es im Raum stehen“. Wer = the participant the server resolved (never a client-side name). Ergänzt = „noch nichts“. Quelle and Unterstützung exactly as they will be recorded; if the preview is stale, the block is greyed with „Entwurf geändert · Vorschau erneuern“.

## 4. Rules

- German labels; values in the language they were written in. Quotes stay verbatim with quotation marks.
- Never derive Unterstützung from text or metadata. It is a declaration or „nicht erfasst“.
- Never show a time without saying what it is (gesagt, beobachtet, eingereicht, erfasst).
- The block has no truth, trust or confidence word anywhere.
- On narrow screens the list stacks; labels keep their order.
- Accessibility: `<dl>` with `<dt>`/`<dd>`, status words as text plus badge colour, links with the full target in `aria-label` when the visible text is an identifier.

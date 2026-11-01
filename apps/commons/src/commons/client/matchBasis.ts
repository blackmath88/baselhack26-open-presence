/**
 * A readable projection of a search hit's actual match basis. It only regroups what the
 * retrieval returned (`SearchHit.matches`) against the words the person typed; it never
 * infers a reason the ranking did not use.
 */
import type { SearchHit } from '../contracts'
import { stem, tokenize } from '../retrieval/bm25'

type Field = SearchHit['matches'][number]['field']

export const FIELD_LABEL: Record<Field, string> = {
  title: 'title',
  symptoms: 'symptoms',
  device: 'device',
  environment: 'reported conditions',
  quote: 'quoted source words',
  aliases: 'record writer’s vocabulary',
}

/** `term` is the indexed (plural-folded) form; `word` is how it is written where it was found. */
export interface TermMatch { term: string; word: string; fields: Field[] }

export interface MatchBasis {
  /** Words from the situation found in the record's own fields. */
  yourWords: TermMatch[]
  /** Words from the situation found only in vocabulary the record writer added. */
  onlyWriterVocabulary: TermMatch[]
  /** Words the search added to the situation, with where they matched. */
  addedBySearch: TermMatch[]
  /** Words from the situation that matched nothing in this record (stopwords excluded), as typed. */
  unmatched: string[]
}

/** The first written word in `texts` whose indexed form is `term`, so "maco" reads as "macOS". */
function wordFor(term: string, texts: string[]): string {
  for (const text of texts) for (const raw of text.split(/[^A-Za-z0-9]+/)) if (raw.length >= 2 && stem(raw.toLowerCase()) === term) return raw
  return term
}

const FIELD_ORDER: Field[] = ['title', 'symptoms', 'device', 'environment', 'quote', 'aliases']

export function matchBasis(query: string, hit: SearchHit): MatchBasis {
  const typed = [...new Set(tokenize(query))]
  const byTerm = new Map<string, Set<Field>>()
  for (const m of hit.matches) {
    const fields = byTerm.get(m.term) ?? new Set<Field>()
    fields.add(m.field)
    byTerm.set(m.term, fields)
  }
  const ordered = (fields: Set<Field>) => FIELD_ORDER.filter((f) => fields.has(f))
  const basis: MatchBasis = { yourWords: [], onlyWriterVocabulary: [], addedBySearch: [], unmatched: [] }
  for (const term of typed) {
    const fields = byTerm.get(term)
    const word = wordFor(term, [query])
    if (!fields) basis.unmatched.push(word)
    else if (fields.size === 1 && fields.has('aliases')) basis.onlyWriterVocabulary.push({ term, word, fields: ['aliases'] })
    else basis.yourWords.push({ term, word, fields: ordered(fields) })
  }
  for (const [term, fields] of byTerm) {
    if (!typed.includes(term)) basis.addedBySearch.push({ term, word: wordFor(term, hit.matches.filter((m) => m.term === term).map((m) => m.text)), fields: ordered(fields) })
  }
  return basis
}

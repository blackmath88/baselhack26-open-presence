/**
 * A readable projection of a search hit's actual match basis. It only regroups what the
 * retrieval returned (`SearchHit.matches`) against the words the person typed; it never
 * infers a reason the ranking did not use.
 */
import type { SearchHit } from '../contracts'
import { tokenize } from '../retrieval/bm25'

type Field = SearchHit['matches'][number]['field']

export const FIELD_LABEL: Record<Field, string> = {
  title: 'title',
  symptoms: 'symptoms',
  device: 'device',
  environment: 'reported conditions',
  quote: 'quoted source words',
  aliases: 'record writer’s vocabulary',
}

export interface TermMatch { term: string; fields: Field[] }

export interface MatchBasis {
  /** Words from the situation found in the record's own fields. */
  yourWords: TermMatch[]
  /** Words from the situation found only in vocabulary the record writer added. */
  onlyWriterVocabulary: TermMatch[]
  /** Words the search added to the situation, with where they matched. */
  addedBySearch: TermMatch[]
  /** Words from the situation that matched nothing in this record (stopwords excluded). */
  unmatched: string[]
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
    if (!fields) basis.unmatched.push(term)
    else if (fields.size === 1 && fields.has('aliases')) basis.onlyWriterVocabulary.push({ term, fields: ['aliases'] })
    else basis.yourWords.push({ term, fields: ordered(fields) })
  }
  for (const [term, fields] of byTerm) {
    if (!typed.includes(term)) basis.addedBySearch.push({ term, fields: ordered(fields) })
  }
  return basis
}

/**
 * Discovery over new contributions. The pinned record index covers imported
 * problems; this index covers what participants and external authors added,
 * so a distinctive new observation is findable from any entrance. Rebuilt
 * from the event log whenever it changes; nothing is persisted.
 */
import type { CommonsContribution } from '../../src/commons/contracts.js'
import { buildIndex, search as bm25Search, tokenize, type Index } from '../../src/commons/retrieval/bm25.js'

export interface ContributionHit {
  contributionId: string
  problemId: string
  rank: number
  matches: Array<{ field: 'text' | 'circumstances' | 'kind' | 'author'; term: string }>
  explanation: string
}

const WEIGHTS = { text: 3, circumstances: 1, kind: 1, author: 1 }

export function buildContributionIndex(contributions: CommonsContribution[]): Index {
  return buildIndex('structured', 'BM25F over local and ingested contributions', contributions.map(c => ({
    id: c.id,
    fields: { text: c.text, circumstances: c.circumstances ?? '', kind: c.kind, author: `${c.actor.id} ${c.actor.displayName ?? ''}` },
  })), WEIGHTS)
}

export function searchContributions(index: Index, contributions: Map<string, CommonsContribution>, query: string, limit: number): ContributionHit[] {
  if (!query.trim() || index.docIds.length === 0) return []
  const result = bm25Search(index, query)
  return result.hits.slice(0, limit).map((hit, i) => {
    const c = contributions.get(hit.id)!
    const matches = hit.matches.flatMap(m => Object.keys(m.fields).map(field => ({ field: field as ContributionHit['matches'][number]['field'], term: m.term })))
    return {
      contributionId: hit.id, problemId: c.problemId, rank: i + 1, matches,
      explanation: `Matched ${[...new Set(matches.map(m => `${m.field}: ${m.term}`))].join('; ')} in a ${c.kind} by ${c.actor.id}${c.origin.kind === 'atproto' ? ' (ingested from ATProto)' : ''}. Lexical rank only; not a confidence score and not a review.`,
    }
  })
}

export const queryTerms = (query: string) => tokenize(query)

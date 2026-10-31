// Ported from postack-underflow 9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:src/lib/retrieval.ts.
// Deterministic retrieval shared by the offline indexer, the evaluation script
// and the browser. No network, no model, no randomness: the same query over
// the same index always returns the same ranking and the same explanation.
//
// Two systems are compared:
//   baseline   — BM25 over the raw text of each source document
//   structured — BM25F over the fields of a problem–solution record
// Both use exactly the same tokenizer, so differences come from what was
// indexed, not from how words are split.
//
// Kept to erasable TypeScript so Node can run it without a build step.

export const BM25_K1 = 1.2
export const BM25_B = 0.75

// Deliberately small and generic; it is applied identically to both systems.
const STOPWORDS = new Set(
  (
    'a an and are as at be but by can do does for from has have how i if in into is it its ' +
    'my no not of on or so that the their then there these this to was we what when where ' +
    'which while who why will with you your'
  ).split(' '),
)

/** Plural folding only: transparent, and applied equally to both systems. */
export function stem(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) {
    return token.slice(0, -1)
  }
  return token
}

export function tokenize(text: string): string[] {
  const out: string[] = []
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue
    out.push(stem(raw))
  }
  return out
}

export interface FieldIndex {
  /** Token count per document for this field. */
  lengths: Record<string, number>
  avgLength: number
  /** term → document id → term frequency */
  postings: Record<string, Record<string, number>>
}

export interface Index {
  system: 'baseline' | 'structured'
  description: string
  docIds: string[]
  /** Field weights; the baseline has a single `text` field with weight 1. */
  weights: Record<string, number>
  fields: Record<string, FieldIndex>
}

/** Build an index from per-document field texts. Output is key-sorted. */
export function buildIndex(
  system: Index['system'],
  description: string,
  docs: Array<{ id: string; fields: Record<string, string> }>,
  weights: Record<string, number>,
): Index {
  const ids = docs.map((d) => d.id).sort()
  const byId = new Map(docs.map((d) => [d.id, d]))
  const fields: Record<string, FieldIndex> = {}
  for (const field of Object.keys(weights).sort()) {
    const lengths: Record<string, number> = {}
    const postings: Record<string, Record<string, number>> = {}
    let total = 0
    for (const id of ids) {
      const tokens = tokenize(byId.get(id)?.fields[field] ?? '')
      lengths[id] = tokens.length
      total += tokens.length
      for (const t of tokens) {
        const row = (postings[t] ??= {})
        row[id] = (row[id] ?? 0) + 1
      }
    }
    const sorted: Record<string, Record<string, number>> = {}
    for (const term of Object.keys(postings).sort()) sorted[term] = postings[term]!
    fields[field] = { lengths, avgLength: ids.length ? total / ids.length : 0, postings: sorted }
  }
  return { system, description, docIds: ids, weights, fields }
}

export interface TermMatch {
  term: string
  /** Contribution of this term to the score. */
  contribution: number
  /** field → term frequency in this document */
  fields: Record<string, number>
}

export interface Hit {
  id: string
  score: number
  matches: TermMatch[]
}

export interface SearchResult {
  queryTerms: string[]
  /** Query terms that occur in no document of this index. */
  unknownTerms: string[]
  hits: Hit[]
  /** Documents with no matching term, in id order — kept, not discarded. */
  unmatched: string[]
}

function documentFrequency(index: Index, term: string): number {
  const docs = new Set<string>()
  for (const field of Object.values(index.fields)) {
    for (const id of Object.keys(field.postings[term] ?? {})) docs.add(id)
  }
  return docs.size
}

/**
 * BM25F (Robertson & Zaragoza's simple variant): per-field length-normalised
 * term frequencies are weighted and summed before saturation. With a single
 * field of weight 1 this is ordinary BM25.
 */
export function search(index: Index, query: string): SearchResult {
  const queryTerms = [...new Set(tokenize(query))]
  const n = index.docIds.length
  const scores = new Map<string, Hit>()
  const unknownTerms: string[] = []

  for (const term of queryTerms) {
    const df = documentFrequency(index, term)
    if (df === 0) {
      unknownTerms.push(term)
      continue
    }
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
    const candidates = new Set<string>()
    for (const field of Object.values(index.fields)) {
      for (const id of Object.keys(field.postings[term] ?? {})) candidates.add(id)
    }
    for (const id of candidates) {
      let weighted = 0
      const fieldTf: Record<string, number> = {}
      for (const [name, field] of Object.entries(index.fields)) {
        const tf = field.postings[term]?.[id] ?? 0
        if (!tf) continue
        fieldTf[name] = tf
        const norm = 1 - BM25_B + BM25_B * ((field.lengths[id] ?? 0) / (field.avgLength || 1))
        weighted += ((index.weights[name] ?? 0) * tf) / norm
      }
      const contribution = (idf * weighted) / (BM25_K1 + weighted)
      const hit = scores.get(id) ?? { id, score: 0, matches: [] }
      hit.score += contribution
      hit.matches.push({ term, contribution, fields: fieldTf })
      scores.set(id, hit)
    }
  }

  // Ties break on id so the ranking is fully deterministic.
  const hits = [...scores.values()].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  for (const hit of hits) hit.matches.sort((a, b) => b.contribution - a.contribution)
  const matched = new Set(hits.map((h) => h.id))
  return {
    queryTerms,
    unknownTerms,
    hits,
    unmatched: index.docIds.filter((id) => !matched.has(id)),
  }
}

/**
 * Compares the words a reader typed with a record's reported device and
 * conditions. This is a word comparison, not a compatibility judgement: it says
 * which recorded conditions your words mention, and which ones you did not
 * state. It uses the same tokenizer and explicit query expansion as search, and
 * reports which words came from that expansion.
 */
import type { ImportedProblem } from '../contracts'
import { tokenize } from '../retrieval/bm25'
import { queryVocabulary } from '../retrieval/index'

export interface ConditionCheck {
  kind: 'device' | 'condition'
  label: string
  /** Your own words (as typed) that this entry shares; empty when you did not state it. */
  yourWords: string[]
  /** Words search added to your query (e.g. macos for mac) that this entry shares. */
  expandedWords: string[]
}

export function compareSituation(query: string, problem: Pick<ImportedProblem, 'device' | 'environment'>): ConditionCheck[] {
  // Matching is on stems (as in search); what is shown is the word as typed or as added by search.
  const typed = asWritten(query.split(/\s+/))
  const added = asWritten(queryVocabulary(query).added)
  const check = (kind: ConditionCheck['kind'], label: string): ConditionCheck => {
    const stems = [...new Set(tokenize(label))]
    return {
      kind,
      label,
      yourWords: unique(stems.flatMap((w) => typed.get(w) ?? [])),
      expandedWords: unique(stems.filter((w) => !typed.has(w)).flatMap((w) => added.get(w) ?? [])),
    }
  }
  return [...problem.device.map((d) => check('device', d)), ...problem.environment.map((e) => check('condition', e))]
}

/** Evidence ids named inside a record-writer sentence (e.g. "reports: e3: worked"), restricted to ids the record has. */
export function evidenceRefs(text: string, evidenceIds: string[]): Array<{ text: string; evidenceId?: string }> {
  const known = new Set(evidenceIds)
  const parts: Array<{ text: string; evidenceId?: string }> = []
  let last = 0
  for (const m of text.matchAll(/\b[a-z][a-z0-9-]*\d[a-z0-9:-]*\b/gi)) {
    if (!known.has(m[0])) continue
    if (m.index! > last) parts.push({ text: text.slice(last, m.index) })
    parts.push({ text: m[0], evidenceId: m[0] })
    last = m.index! + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

const unique = (xs: string[]) => [...new Set(xs)]
/** Stem → the words that produced it, as written. */
export function asWritten(words: string[]): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const w of words.flatMap((x) => x.split(/[\s,;()]+/))) for (const stem of tokenize(w)) out.set(stem, unique([...(out.get(stem) ?? []), w.replace(/[^\p{L}\p{N}-]/gu, '')]))
  return out
}

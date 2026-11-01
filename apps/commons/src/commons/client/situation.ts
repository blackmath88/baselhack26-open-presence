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
  /** Stemmed words shared with your situation; empty when you did not state it. */
  yourWords: string[]
  /** Shared words that exist only because search expanded your query (e.g. mac → macos). */
  expandedWords: string[]
}

export function compareSituation(query: string, problem: Pick<ImportedProblem, 'device' | 'environment'>): ConditionCheck[] {
  const typed = new Set(tokenize(query))
  const expanded = new Set(tokenize(queryVocabulary(query).text))
  const check = (kind: ConditionCheck['kind'], label: string): ConditionCheck => {
    const words = [...new Set(tokenize(label))]
    return {
      kind,
      label,
      yourWords: words.filter((w) => typed.has(w)),
      expandedWords: words.filter((w) => !typed.has(w) && expanded.has(w)),
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

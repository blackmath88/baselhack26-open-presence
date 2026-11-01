/**
 * A two-account comparison projection over imported records. It aligns what
 * each record reports and names what is shared, what differs and what is
 * not recorded. Everything is derived from the records' own fields with
 * exact or word-level matching; it never infers a shared cause, compatibility
 * or which fix applies.
 */
import type { ImportedProblem } from '../contracts'
import { tokenize } from '../retrieval/bm25'
import { asWritten } from './situation'

export type CompareField = 'device' | 'environment' | 'symptoms' | 'outcomes'

export const COMPARE_FIELDS: Array<{ field: CompareField; label: string }> = [
  { field: 'device', label: 'Applies to' },
  { field: 'environment', label: 'Reported conditions' },
  { field: 'symptoms', label: 'Symptoms' },
  { field: 'outcomes', label: 'Reported outcomes' },
]

export interface FieldComparison {
  field: CompareField
  label: string
  /** Entries recorded word-for-word in both records. */
  identical: string[]
  /**
   * Words both records use in this field beyond identical entries, as A writes them (matched on
   * stems). Only for device, conditions and symptoms: outcome entries share their own boilerplate.
   */
  sharedWords: string[]
  onlyA: string[]
  onlyB: string[]
  /** Which side has nothing recorded for this field. */
  missing: Array<'a' | 'b'>
}

export interface AccountComparison {
  fields: FieldComparison[]
  /** Source objects (issue, comment, doc) cited by both records' evidence. */
  sharedSources: string[]
}

const words = (entries: string[]) => new Set(entries.flatMap((e) => tokenize(e)))

export function compareAccounts(a: ImportedProblem, b: ImportedProblem): AccountComparison {
  const fields = COMPARE_FIELDS.map(({ field, label }) => {
    const left = a[field]
    const right = b[field]
    const identical = left.filter((x) => right.includes(x))
    const onlyA = left.filter((x) => !right.includes(x))
    const onlyB = right.filter((x) => !left.includes(x))
    const wb = words(onlyB)
    const writtenA = asWritten(onlyA)
    const sharedWords = field === 'outcomes' ? [] : [...new Set([...words(onlyA)].filter((w) => wb.has(w)).map((w) => writtenA.get(w)?.[0] ?? w))]
    const missing = [...(left.length ? [] : ['a' as const]), ...(right.length ? [] : ['b' as const])]
    return { field, label, identical, sharedWords, onlyA, onlyB, missing }
  })
  const objectsB = new Set(b.evidence.map((e) => e.source.objectId))
  const sharedSources = [...new Set(a.evidence.map((e) => e.source.objectId))].filter((o) => objectsB.has(o))
  return { fields, sharedSources }
}

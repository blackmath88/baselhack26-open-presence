/**
 * Two imported records aligned field by field. Pure and deterministic: it only reads what each
 * record states. "In common" means the same wording appears in both (one item equal to, or
 * contained in, an item of the other); it never infers a shared cause or compatibility.
 */
import type { ImportedProblem } from '../contracts'

export type CompareField = 'device' | 'environment' | 'symptoms' | 'outcomes' | 'status' | 'corrections'

export const COMPARE_LABEL: Record<CompareField, string> = {
  device: 'Applies to',
  environment: 'Reported conditions',
  symptoms: 'Symptoms',
  outcomes: 'Reported outcomes',
  status: 'Status and limit',
  corrections: 'Corrections',
}

export interface CompareRow {
  field: CompareField
  a: string[]
  b: string[]
  /** Items stated in both, as worded in A and as worded in B. */
  common: string[]
  commonB: string[]
  /** Not stated in A, not stated in B. */
  missing: { a: boolean; b: boolean }
}

export interface Comparison {
  rows: CompareRow[]
  /** Fields both records state, with no item in common. */
  differs: CompareField[]
  /** Fields with at least one item in common. */
  shared: CompareField[]
  /** A relationship one record itself declares with the other, with its origin. */
  declared: Array<{ from: 'a' | 'b'; relation: string; origin: 'postack-agent' | 'source' }>
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
const overlaps = (x: string, y: string) => { const a = norm(x), b = norm(y); return a === b || (a.length >= 3 && b.includes(a)) || (b.length >= 3 && a.includes(b)) }

const values = (p: ImportedProblem, field: CompareField): string[] => {
  if (field === 'status') return [p.status, ...(p.statusNote ? [p.statusNote] : [])]
  if (field === 'corrections') return p.corrections.map((c) => c.note)
  return p[field]
}

/** Status and corrections are each record's own account; they are listed, not matched. */
const MATCHED: CompareField[] = ['device', 'environment', 'symptoms', 'outcomes']

export function compareRecords(a: ImportedProblem, b: ImportedProblem): Comparison {
  const rows = (Object.keys(COMPARE_LABEL) as CompareField[]).map((field): CompareRow => {
    const va = values(a, field), vb = values(b, field)
    const matched = MATCHED.includes(field)
    const common = matched ? va.filter((x) => vb.some((y) => overlaps(x, y))) : []
    const commonB = matched ? vb.filter((y) => va.some((x) => overlaps(x, y))) : []
    return { field, a: va, b: vb, common, commonB, missing: { a: va.length === 0, b: vb.length === 0 } }
  })
  const declared = [
    ...a.related.filter((r) => r.problemId === b.postackId).map((r) => ({ from: 'a' as const, relation: r.relation, origin: r.origin })),
    ...b.related.filter((r) => r.problemId === a.postackId).map((r) => ({ from: 'b' as const, relation: r.relation, origin: r.origin })),
  ]
  return {
    rows,
    shared: rows.filter((r) => r.common.length > 0).map((r) => r.field),
    differs: rows.filter((r) => MATCHED.includes(r.field) && !r.missing.a && !r.missing.b && r.common.length === 0).map((r) => r.field),
    declared,
  }
}

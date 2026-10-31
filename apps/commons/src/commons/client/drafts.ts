/**
 * Private drafts live only in this browser. They are never part of canonical
 * room state and are never sent until the participant explicitly submits one.
 * A failed submission leaves the draft in place. A reply draft is keyed by the
 * problem and the contribution it answers, so each conversation keeps its own.
 */
import type { AssistanceDeclaration, CommonsContributionKind, Draft } from '../contracts'

const KEY = 'commons.drafts.v1'

export interface DraftV2 extends Draft {
  kind?: CommonsContributionKind
  assistance?: AssistanceDeclaration
  /** Reply target (a contribution id or evidence object id) and how the draft relates to it. */
  parentId?: string
  relation?: 'reply' | 'correction' | 'supersedes'
}

function readAll(): DraftV2[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as DraftV2[]) : []
  } catch {
    return []
  }
}

function writeAll(drafts: DraftV2[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts))
    return true
  } catch {
    return false
  }
}

const sameSlot = (a: { problemId: string; parentId?: string }, b: { problemId: string; parentId?: string }) =>
  a.problemId === b.problemId && (a.parentId ?? '') === (b.parentId ?? '')

export const drafts = {
  list: readAll,
  forProblem: (problemId: string, parentId?: string) => readAll().find((d) => sameSlot(d, { problemId, ...(parentId ? { parentId } : {}) })),
  save(draft: Omit<DraftV2, 'id' | 'savedAt'> & { id?: string }): { draft: DraftV2; persisted: boolean } {
    const all = readAll().filter((d) => !sameSlot(d, draft))
    const saved: DraftV2 = { ...draft, id: draft.id ?? crypto.randomUUID(), savedAt: new Date().toISOString() }
    return { draft: saved, persisted: writeAll([...all, saved]) }
  },
  remove(problemId: string, parentId?: string) {
    writeAll(readAll().filter((d) => !sameSlot(d, { problemId, ...(parentId ? { parentId } : {}) })))
  },
}

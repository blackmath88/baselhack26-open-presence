/**
 * Private drafts live only in this browser. They are never part of canonical
 * room state and are never sent until the participant explicitly submits one.
 * A failed submission leaves the draft in place.
 */
import type { Draft } from '../contracts'

const KEY = 'commons.drafts.v1'

function readAll(): Draft[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Draft[]) : []
  } catch {
    return []
  }
}

function writeAll(drafts: Draft[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts))
    return true
  } catch {
    return false
  }
}

export const drafts = {
  list: readAll,
  forProblem: (problemId: string) => readAll().find((d) => d.problemId === problemId),
  save(draft: Omit<Draft, 'id' | 'savedAt'> & { id?: string }): { draft: Draft; persisted: boolean } {
    const all = readAll().filter((d) => d.problemId !== draft.problemId)
    const saved: Draft = { ...draft, id: draft.id ?? crypto.randomUUID(), savedAt: new Date().toISOString() }
    return { draft: saved, persisted: writeAll([...all, saved]) }
  },
  remove(problemId: string) {
    writeAll(readAll().filter((d) => d.problemId !== problemId))
  },
}

/**
 * Repository navigation over the bounded, pinned source snapshot. This is not a
 * live GitHub browser: it lists what the manifest captured (paths, threads,
 * hashes, authors, times) and links each node to the problem records whose
 * evidence cites it. Coverage and exclusions are disclosed on every response.
 */
import { manifest } from '../../src/commons/source/index.js'
import type { ImportedProblem } from '../../src/commons/contracts.js'
import { appLinks } from '../../src/commons/contracts.js'

type Thread = (typeof manifest.threads)[number]
type Doc = (typeof manifest.docs)[number]

export interface LinkedProblem { problemId: string; title: string; evidenceIds: string[]; locators: string[]; link: string }

export interface RepoCoverage {
  repository: string; url: string; revision: string; revisionDate: string; snapshotAt: string
  method: string; coverage: string[]; exclusions: string[]; license: string; licenseNote: string
  note: string
}

export const coverage = (): RepoCoverage => ({
  repository: manifest.repository, url: manifest.url, revision: manifest.revision, revisionDate: manifest.revisionDate,
  snapshotAt: manifest.snapshotAt, method: manifest.method, coverage: [...manifest.coverage], exclusions: [...manifest.exclusions],
  license: manifest.license, licenseNote: manifest.licenseNote,
  note: 'Pinned snapshot metadata only: paths, hashes, authors and times. Full text is not stored here; follow the permalink. Absence from this snapshot is not evidence of absence upstream.',
})

const threadKey = (t: Thread) => `${t.type}/${t.number}`

/** objectId → problems citing it (threads also collect their comments' citations). */
export function citationIndex(problems: ImportedProblem[]): Map<string, LinkedProblem[]> {
  const index = new Map<string, LinkedProblem[]>()
  const commentThread = new Map<string, string>()
  for (const t of manifest.threads) for (const c of t.comments) commentThread.set(`comment/${c.id}`, threadKey(t))
  const add = (key: string, p: ImportedProblem, evidenceId: string, locator: string | null) => {
    const list = index.get(key) ?? []
    let entry = list.find(l => l.problemId === p.postackId)
    if (!entry) { entry = { problemId: p.postackId, title: p.title, evidenceIds: [], locators: [], link: appLinks.problem(p.postackId) }; list.push(entry) }
    if (!entry.evidenceIds.includes(evidenceId)) entry.evidenceIds.push(evidenceId)
    if (locator && !entry.locators.includes(locator)) entry.locators.push(locator)
    index.set(key, list)
  }
  const docPaths = new Set(manifest.docs.map(d => d.path))
  for (const p of problems) {
    for (const e of p.evidence) {
      const id = e.source.objectId
      // Doc citations arrive as `doc/<path>[#L..]` (this app) or as the bare manifest path (Postack's own syntax).
      const bare = id.split('#')[0]
      if (id.startsWith('doc/')) add(bare, p, e.id, e.source.locator)
      else if (docPaths.has(bare)) add(`doc/${bare}`, p, e.id, e.source.locator)
      else {
        add(id, p, e.id, null)
        const thread = commentThread.get(id)
        if (thread) add(thread, p, e.id, id)
      }
    }
  }
  return index
}

export interface RepoNode {
  kind: 'dir' | 'doc'
  path: string
  name: string
  url?: string
  bytes?: number
  sha256?: string
  /** Direct children count for directories. */
  children?: number
  problems: LinkedProblem[]
}

export interface ThreadSummary {
  object: string; type: Thread['type']; number: number; title: string; url: string
  author: string | null; createdAt: string; updatedAt: string; comments: number; commentAuthors: string[]
  problems: LinkedProblem[]
}

const docNode = (d: Doc, citations: Map<string, LinkedProblem[]>): RepoNode => ({
  kind: 'doc', path: d.path, name: d.path.split('/').pop() ?? d.path, url: d.url, bytes: d.bytes, sha256: d.sha256,
  problems: citations.get(`doc/${d.path}`) ?? [],
})

export function listPath(path: string, problems: ImportedProblem[]): { path: string; entries: RepoNode[]; doc?: RepoNode } | undefined {
  const citations = citationIndex(problems)
  const clean = path.replace(/^\/+|\/+$/g, '')
  const exact = manifest.docs.find(d => d.path === clean)
  if (exact) return { path: clean, entries: [], doc: docNode(exact, citations) }
  const prefix = clean ? `${clean}/` : ''
  const inside = manifest.docs.filter(d => d.path.startsWith(prefix))
  if (clean && inside.length === 0) return undefined
  const dirs = new Map<string, number>()
  const entries: RepoNode[] = []
  for (const d of inside) {
    const rest = d.path.slice(prefix.length)
    const slash = rest.indexOf('/')
    if (slash === -1) entries.push(docNode(d, citations))
    else dirs.set(rest.slice(0, slash), (dirs.get(rest.slice(0, slash)) ?? 0) + 1)
  }
  for (const [name, count] of dirs) {
    const dirPath = `${prefix}${name}`
    const linked = new Map<string, LinkedProblem>()
    for (const d of inside.filter(d => d.path.startsWith(`${dirPath}/`))) for (const l of citations.get(`doc/${d.path}`) ?? []) linked.set(l.problemId, l)
    entries.push({ kind: 'dir', path: dirPath, name, children: count, problems: [...linked.values()] })
  }
  entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'dir' ? -1 : 1))
  return { path: clean, entries }
}

export function threadSummary(t: Thread, citations: Map<string, LinkedProblem[]>): ThreadSummary {
  return {
    object: threadKey(t), type: t.type, number: t.number, title: t.title, url: t.url, author: t.author ?? null,
    createdAt: t.createdAt, updatedAt: t.updatedAt, comments: t.comments.length,
    commentAuthors: [...new Set(t.comments.map(c => c.author ?? 'unknown'))],
    problems: citations.get(threadKey(t)) ?? [],
  }
}

export function listThreads(problems: ImportedProblem[], options: { type?: Thread['type']; cursor?: string; limit?: number; linkedOnly?: boolean } = {}) {
  const citations = citationIndex(problems)
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200)
  let threads = manifest.threads.filter(t => !options.type || t.type === options.type)
  if (options.linkedOnly) threads = threads.filter(t => citations.has(threadKey(t)))
  threads = [...threads].sort((a, b) => b.number - a.number)
  const start = options.cursor ? Math.max(0, threads.findIndex(t => threadKey(t) === options.cursor) + 1) : 0
  const page = threads.slice(start, start + limit)
  const last = page[page.length - 1]
  return {
    total: threads.length,
    threads: page.map(t => threadSummary(t, citations)),
    ...(start + limit < threads.length && last ? { cursor: threadKey(last) } : {}),
  }
}

export function getThreadObject(object: string, problems: ImportedProblem[]) {
  const citations = citationIndex(problems)
  const t = manifest.threads.find(t => threadKey(t) === object)
  if (!t) return undefined
  return {
    ...threadSummary(t, citations),
    commentList: t.comments.map(c => ({ object: `comment/${c.id}`, author: c.author ?? 'unknown', createdAt: c.createdAt, url: c.url, bytes: c.bytes, sha256: c.sha256, problems: citations.get(`comment/${c.id}`) ?? [] })),
  }
}

export const totals = () => ({ ...manifest.totals, problems: undefined as number | undefined })

/**
 * Repository navigation over the bounded, pinned source snapshot. This is not a
 * live GitHub browser: it lists what the manifest captured (paths, threads,
 * hashes, authors, times) and links each node to the problem records whose
 * evidence cites it. Coverage and exclusions are disclosed on every response.
 */
import { manifest } from '../../src/commons/source/index.js'
import type { CommonsContribution, CommonsEntrance, ImportedProblem } from '../../src/commons/contracts.js'
import { appLinks } from '../../src/commons/contracts.js'
import type { ReplyStats } from './projection.js'

type Thread = (typeof manifest.threads)[number]
type Doc = (typeof manifest.docs)[number]

export interface LinkedProblem { problemId: string; title: string; evidenceIds: string[]; locators: string[]; link: string }
/** A visible participant or ingested contribution whose own source references cite this object. */
export interface CitingContribution {
  contributionId: string; problemId: string; kind: string; actor: CommonsContribution['actor']; entrance: CommonsEntrance
  /** The exact objectIds the contribution cited (a comment cited inside a thread is listed under the thread too). */
  cited: string[]; excerpt: string; createdAt: string; link: string
  /** Visible replies and corrections below it (any depth), who took part, when it last moved. */
  replies: number; participants: string[]; lastActivityAt: string
  /** Exact evidence passages of its own problem record it cites, when the contributor named them. */
  evidenceIds?: string[]
}

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

const commentThread = new Map<string, string>()
for (const t of manifest.threads) for (const c of t.comments) commentThread.set(`comment/${c.id}`, threadKey(t))
const docPaths = new Set(manifest.docs.map(d => d.path))

/** Navigator keys an evidence objectId resolves to: the doc or object itself, plus the enclosing thread of a comment. */
export function citationKeys(objectId: string): string[] {
  // Doc citations arrive as `doc/<path>[#L..]` (this app) or as the bare manifest path (Postack's own syntax).
  const bare = objectId.split('#')[0]
  if (objectId.startsWith('doc/')) return [bare]
  if (docPaths.has(bare)) return [`doc/${bare}`]
  const thread = commentThread.get(objectId)
  return thread ? [objectId, thread] : [objectId]
}

/** objectId → visible contributions whose source references cite it, oldest first. */
export function contributionCitationIndex(contributions: CommonsContribution[], stats: Map<string, ReplyStats> = new Map()): Map<string, CitingContribution[]> {
  const index = new Map<string, CitingContribution[]>()
  for (const c of [...contributions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    for (const ref of c.sourceRefs) {
      for (const key of citationKeys(ref.objectId)) {
        const list = index.get(key) ?? []
        let entry = list.find(l => l.contributionId === c.id)
        if (!entry) {
          entry = {
            contributionId: c.id, problemId: c.problemId, kind: c.kind, actor: c.actor, entrance: c.entrance, cited: [],
            excerpt: c.text.length > 160 ? `${c.text.slice(0, 157)}…` : c.text, createdAt: c.createdAt, link: c.links.app,
            ...(c.evidenceIds ? { evidenceIds: c.evidenceIds } : {}),
            replies: stats.get(c.id)?.replies ?? 0, participants: stats.get(c.id)?.participants ?? [c.actor.id], lastActivityAt: stats.get(c.id)?.lastActivityAt ?? c.createdAt,
          }
          list.push(entry)
        }
        if (!entry.cited.includes(ref.objectId)) entry.cited.push(ref.objectId)
        index.set(key, list)
      }
    }
  }
  return index
}

/** objectId → problems citing it (threads also collect their comments' citations). */
export function citationIndex(problems: ImportedProblem[]): Map<string, LinkedProblem[]> {
  const index = new Map<string, LinkedProblem[]>()
  const add = (key: string, p: ImportedProblem, evidenceId: string, locator: string | null) => {
    const list = index.get(key) ?? []
    let entry = list.find(l => l.problemId === p.postackId)
    if (!entry) { entry = { problemId: p.postackId, title: p.title, evidenceIds: [], locators: [], link: appLinks.problem(p.postackId) }; list.push(entry) }
    if (!entry.evidenceIds.includes(evidenceId)) entry.evidenceIds.push(evidenceId)
    if (locator && !entry.locators.includes(locator)) entry.locators.push(locator)
    index.set(key, list)
  }
  for (const p of problems) {
    for (const e of p.evidence) {
      const id = e.source.objectId
      const [key, thread] = citationKeys(id)
      if (key!.startsWith('doc/')) add(key!, p, e.id, e.source.locator)
      else {
        add(key!, p, e.id, null)
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
  contributions: CitingContribution[]
}

export interface ThreadSummary {
  object: string; type: Thread['type']; number: number; title: string; url: string
  author: string | null; createdAt: string; updatedAt: string; comments: number; commentAuthors: string[]
  problems: LinkedProblem[]
  contributions: CitingContribution[]
}

type Community = Map<string, CitingContribution[]>
const none: Community = new Map()

const docNode = (d: Doc, citations: Map<string, LinkedProblem[]>, community: Community): RepoNode => ({
  kind: 'doc', path: d.path, name: d.path.split('/').pop() ?? d.path, url: d.url, bytes: d.bytes, sha256: d.sha256,
  problems: citations.get(`doc/${d.path}`) ?? [], contributions: community.get(`doc/${d.path}`) ?? [],
})

export function listPath(path: string, problems: ImportedProblem[], community: Community = none): { path: string; entries: RepoNode[]; doc?: RepoNode } | undefined {
  const citations = citationIndex(problems)
  const clean = path.replace(/^\/+|\/+$/g, '')
  const exact = manifest.docs.find(d => d.path === clean)
  if (exact) return { path: clean, entries: [], doc: docNode(exact, citations, community) }
  const prefix = clean ? `${clean}/` : ''
  const inside = manifest.docs.filter(d => d.path.startsWith(prefix))
  if (clean && inside.length === 0) return undefined
  const dirs = new Map<string, number>()
  const entries: RepoNode[] = []
  for (const d of inside) {
    const rest = d.path.slice(prefix.length)
    const slash = rest.indexOf('/')
    if (slash === -1) entries.push(docNode(d, citations, community))
    else dirs.set(rest.slice(0, slash), (dirs.get(rest.slice(0, slash)) ?? 0) + 1)
  }
  for (const [name, count] of dirs) {
    const dirPath = `${prefix}${name}`
    const linked = new Map<string, LinkedProblem>()
    const citing = new Map<string, CitingContribution>()
    for (const d of inside.filter(d => d.path.startsWith(`${dirPath}/`))) {
      for (const l of citations.get(`doc/${d.path}`) ?? []) linked.set(l.problemId, l)
      for (const c of community.get(`doc/${d.path}`) ?? []) citing.set(c.contributionId, c)
    }
    entries.push({ kind: 'dir', path: dirPath, name, children: count, problems: [...linked.values()], contributions: [...citing.values()] })
  }
  entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'dir' ? -1 : 1))
  return { path: clean, entries }
}

export function threadSummary(t: Thread, citations: Map<string, LinkedProblem[]>, community: Community = none): ThreadSummary {
  return {
    object: threadKey(t), type: t.type, number: t.number, title: t.title, url: t.url, author: t.author ?? null,
    createdAt: t.createdAt, updatedAt: t.updatedAt, comments: t.comments.length,
    commentAuthors: [...new Set(t.comments.map(c => c.author ?? 'unknown'))],
    problems: citations.get(threadKey(t)) ?? [], contributions: community.get(threadKey(t)) ?? [],
  }
}

export function listThreads(problems: ImportedProblem[], options: { type?: Thread['type']; cursor?: string; limit?: number; linkedOnly?: boolean } = {}, community: Community = none) {
  const citations = citationIndex(problems)
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200)
  let threads = manifest.threads.filter(t => !options.type || t.type === options.type)
  // "Linked" means cited by a problem record or by a visible community contribution.
  if (options.linkedOnly) threads = threads.filter(t => citations.has(threadKey(t)) || community.has(threadKey(t)))
  threads = [...threads].sort((a, b) => b.number - a.number)
  const start = options.cursor ? Math.max(0, threads.findIndex(t => threadKey(t) === options.cursor) + 1) : 0
  const page = threads.slice(start, start + limit)
  const last = page[page.length - 1]
  return {
    total: threads.length,
    threads: page.map(t => threadSummary(t, citations, community)),
    ...(start + limit < threads.length && last ? { cursor: threadKey(last) } : {}),
  }
}

export function getThreadObject(object: string, problems: ImportedProblem[], community: Community = none) {
  const citations = citationIndex(problems)
  const t = manifest.threads.find(t => threadKey(t) === object)
  if (!t) return undefined
  return {
    ...threadSummary(t, citations, community),
    commentList: t.comments.map(c => ({ object: `comment/${c.id}`, author: c.author ?? 'unknown', createdAt: c.createdAt, url: c.url, bytes: c.bytes, sha256: c.sha256, problems: citations.get(`comment/${c.id}`) ?? [], contributions: community.get(`comment/${c.id}`) ?? [] })),
  }
}

export const totals = () => ({ ...manifest.totals, problems: undefined as number | undefined })

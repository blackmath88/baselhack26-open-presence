/**
 * Read side shared by every entrance. Pure over `(events, metadata)`; the
 * service wraps these in a transaction so a read never sees a half-applied
 * command. Nothing here invents an answer: context packets list sources,
 * revisions, omissions and the fact that record interpretations are unreviewed.
 */
import type {
  AssistanceDeclaration, CommonsContribution, CommonsContributionKind, ImportedProblem, ModeratedContribution, SearchHit, SourceRef, SubmitContributionCommandV2,
} from '../../src/commons/contracts.js'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS, appLinks, importedProblemSpaceId, isModerated } from '../../src/commons/contracts.js'
import { createCommonsReader } from '../../src/commons/retrieval/index.js'
import { manifest } from '../../src/commons/source/index.js'
import type { MemoryEvent } from '../domain/events.js'
import { project } from '../domain/projections.js'
import type { ProblemState } from '../domain/types.js'
import { invalid, notFound } from '../domain/errors.js'
import type { CommonsMetadata } from './import.js'
import { stableHash } from './import.js'
import { buildThread, isImportedEvidence, revisionsFrom, roomToProblemId, threadParticipants, toCommonsContribution, type ThreadNode } from './projection.js'
import { buildContributionIndex, searchContributions, type ContributionHit } from './search.js'
import { contributionCitationIndex, coverage, getThreadObject, listPath, listThreads } from './repository-view.js'
import { MAX_CONTRIBUTION_LENGTH } from '../domain/policies.js'

export const recordReader = createCommonsReader()

export interface LoadedCommons {
  events: MemoryEvent[]
  rooms: Map<string, { state: ProblemState; events: MemoryEvent[] }>
  contributions: Map<string, CommonsContribution | ModeratedContribution>
  byRoom: Map<string, string[]>
  displayNames: Record<string, string>
}

/** Folds every commons:* room once. Logs are small; clarity beats caching here. */
export function loadCommons(events: MemoryEvent[], metadata: CommonsMetadata): LoadedCommons {
  const rooms = new Map<string, { state: ProblemState; events: MemoryEvent[] }>()
  const grouped = new Map<string, MemoryEvent[]>()
  for (const e of events) {
    if (!e.problemId.startsWith('commons:')) continue
    const list = grouped.get(e.problemId) ?? []
    list.push(e)
    grouped.set(e.problemId, list)
  }
  const displayNames: Record<string, string> = {}
  for (const o of Object.values(metadata.external)) if (o.handle) displayNames[o.did] = o.handle
  const contributions = new Map<string, CommonsContribution | ModeratedContribution>()
  const byRoom = new Map<string, string[]>()
  for (const [roomId, list] of grouped) {
    const state = project(list)
    if (!state) continue
    rooms.set(roomId, { state, events: list })
    const ctx = { metadata, source: metadata.sources[roomToProblemId(roomId)], revisions: revisionsFrom(list), displayNames }
    const ids: string[] = []
    for (const c of state.contributions) {
      if (isImportedEvidence(c)) continue
      contributions.set(c.id, toCommonsContribution(ctx, c))
      ids.push(c.id)
    }
    byRoom.set(roomId, ids)
  }
  return { events, rooms, contributions, byRoom, displayNames }
}

export const visible = (loaded: LoadedCommons): CommonsContribution[] =>
  [...loaded.contributions.values()].filter((c): c is CommonsContribution => !isModerated(c))

export function findContribution(loaded: LoadedCommons, id: string) {
  const found = loaded.contributions.get(id)
  if (!found) throw notFound('Contribution', id)
  return found
}

// --- search ------------------------------------------------------------------

export interface SearchResponse {
  query: string
  problems: Array<SearchHit & { title: string; link: string; roomId: string }>
  contributions: Array<ContributionHit & { summary: ContributionSummary }>
  coverage: { records: number; contributions: number; snapshotAt: string; recordsAuthoredBy: string; lastSync: Array<{ did: string; status: string; completedAt?: string }> }
  note: string
}

export interface ContributionSummary {
  id: string; problemId: string; kind: string; actor: CommonsContribution['actor']; revision: number
  excerpt: string; createdAt: string; origin: CommonsContribution['origin']['kind']; entrance: CommonsContribution['entrance']; publication: string; link: string
  /** What the contribution cites in the pinned snapshot, with the source's own author (never the contributor). */
  sourceRefs: Array<{ objectId: string; permalink: string; author: string }>
}

export const summarize = (c: CommonsContribution): ContributionSummary => ({
  id: c.id, problemId: c.problemId, kind: c.kind, actor: c.actor, revision: c.revision,
  excerpt: c.text.length > 240 ? `${c.text.slice(0, 237)}…` : c.text, createdAt: c.createdAt,
  origin: c.origin.kind, entrance: c.entrance, publication: c.publication?.status ?? 'local', link: c.links.app,
  sourceRefs: c.sourceRefs.map(r => ({ objectId: r.objectId, permalink: r.permalink, author: r.author })),
})

export function searchAll(loaded: LoadedCommons, metadata: CommonsMetadata, input: { query: string; limit?: number; include?: Array<'problems' | 'contributions'> }): SearchResponse {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50)
  const include = input.include?.length ? input.include : ['problems', 'contributions'] as const
  const problems = include.includes('problems')
    ? recordReader.search(input.query, limit).map(h => ({ ...h, title: recordReader.problem(h.problemId)?.title ?? h.problemId, link: appLinks.problem(h.problemId), roomId: importedProblemSpaceId(h.problemId) }))
    : []
  const all = visible(loaded)
  const contributions = include.includes('contributions')
    ? searchContributions(buildContributionIndex(all), new Map(all.map(c => [c.id, c])), input.query, limit)
      .map(hit => ({ ...hit, summary: summarize(loaded.contributions.get(hit.contributionId) as CommonsContribution) }))
    : []
  return {
    query: input.query, problems, contributions,
    coverage: {
      records: recordReader.problems().length, contributions: all.length, snapshotAt: manifest.snapshotAt,
      recordsAuthoredBy: recordReader.problems()[0]?.provenance.authoredBy ?? 'unknown',
      lastSync: Object.values(metadata.sync).map(s => ({ did: s.did, status: s.status, ...(s.completedAt ? { completedAt: s.completedAt } : {}) })),
    },
    note: 'Ranking is lexical (BM25F) over committed records and local/ingested contributions. It is not a confidence score, not a review, and does not cover anything outside this snapshot and the opted-in authors above.',
  }
}

// --- problem / contribution / thread ------------------------------------------

export interface ProblemView {
  problem: ImportedProblem
  roomId: string
  version: number
  links: { app: string; thread: string }
  evidence: ImportedProblem['evidence']
  contributions: Array<CommonsContribution | ModeratedContribution>
  related: Array<{ problemId: string; title?: string; relation: string; origin: string; link: string }>
  moderatedCount: number
  publication: { published: number; queued: number; failed: number }
}

export function problemView(loaded: LoadedCommons, metadata: CommonsMetadata, id: string): ProblemView {
  const problemId = roomToProblemId(id)
  const problem = metadata.sources[problemId]
  const roomId = importedProblemSpaceId(problemId)
  const room = loaded.rooms.get(roomId)
  if (!problem || !room) throw notFound('Problem', problemId)
  const contributions = (loaded.byRoom.get(roomId) ?? []).map(cid => loaded.contributions.get(cid)!)
  const receipts = contributions.flatMap(c => (isModerated(c) || !c.publication ? [] : [c.publication]))
  return {
    problem, roomId, version: room.events.length,
    links: { app: appLinks.problem(problemId), thread: appLinks.thread(roomId) },
    evidence: problem.evidence,
    contributions,
    related: problem.related.map(r => ({ problemId: r.problemId, ...(metadata.sources[r.problemId] ? { title: metadata.sources[r.problemId].title } : {}), relation: r.relation, origin: r.origin, link: appLinks.problem(r.problemId) })),
    moderatedCount: contributions.filter(isModerated).length,
    publication: {
      published: receipts.filter(r => r.status === 'published').length,
      queued: receipts.filter(r => r.status === 'queued' || r.status === 'publishing').length,
      failed: receipts.filter(r => r.status === 'failed' || r.status === 'conflict').length,
    },
  }
}

export interface ThreadView { root: ThreadNode; participants: string[]; problemId: string; roomId: string; links: { app: string } }

export function threadView(loaded: LoadedCommons, metadata: CommonsMetadata, id: string): ThreadView {
  const c = findContribution(loaded, id)
  const all = (loaded.byRoom.get(c.roomId) ?? []).map(cid => loaded.contributions.get(cid)!)
  // Walk up to the thread root so a deep link to a reply still shows the conversation.
  let rootId = id
  const seen = new Set<string>()
  for (;;) {
    seen.add(rootId)
    const node = loaded.contributions.get(rootId)
    if (!node || isModerated(node) || !node.parent) break
    const parentId = node.parent.kind === 'local' ? node.parent.id : node.parent.kind === 'atproto' ? metadata.external[node.parent.uri]?.contributionId : undefined
    if (!parentId || seen.has(parentId) || !loaded.contributions.has(parentId)) break
    rootId = parentId
  }
  const root = buildThread(rootId, all, metadata.external)
  if (!root) throw notFound('Thread', id)
  return { root, participants: threadParticipants(root), problemId: c.problemId, roomId: c.roomId, links: { app: appLinks.thread(rootId) } }
}

// --- context -------------------------------------------------------------------

export interface ContextPacket {
  target: { problemId: string; contributionId?: string }
  generatedAt: string
  budget: { chars: number; used: number }
  freshness: { snapshotAt: string; snapshotRevision: string; recordsOriginCommit: string; roomVersion: number; lastSync: Array<{ did: string; status: string; completedAt?: string }> }
  problem: Pick<ImportedProblem, 'postackId' | 'title' | 'device' | 'environment' | 'symptoms' | 'status' | 'statusNote' | 'outcomes' | 'provenance'>
  sources: SourceRef[]
  evidence: Array<{ id: string; role: string; quote: string | null; interpretation: string | null; objectId: string; permalink: string }>
  contributions: Array<Omit<ContributionSummary, 'sourceRefs'> & { text: string; truncated: boolean; sourceRefs: string[]; parent?: string; assistance: CommonsContribution['assistance'] }>
  corrections: ImportedProblem['corrections']
  related: ProblemView['related']
  omissions: string[]
  limitations: string[]
  links: { app: string }
}

export function contextPacket(loaded: LoadedCommons, metadata: CommonsMetadata, input: { problemId?: string; contributionId?: string; budget?: number }, now: string): ContextPacket {
  let problemId = input.problemId
  if (!problemId && input.contributionId) problemId = findContribution(loaded, input.contributionId).problemId
  if (!problemId) throw invalid('Provide problemId or contributionId.')
  const view = problemView(loaded, metadata, problemId)
  const budget = Math.min(Math.max(input.budget ?? 12000, 1000), 60000)
  const omissions: string[] = []
  const sources = [...new Map(view.evidence.map(e => [e.source.objectId, e.source])).values()]
  const evidence = view.evidence.map(e => ({ id: e.id, role: e.role, quote: e.quote, interpretation: e.interpretation, objectId: e.source.objectId, permalink: e.source.permalink }))
  const ordered = view.contributions.filter((c): c is CommonsContribution => !isModerated(c)).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
  if (input.contributionId) {
    const target = ordered.findIndex(c => c.id === input.contributionId)
    if (target > 0) ordered.unshift(...ordered.splice(target, 1))
  }
  const { problem } = view
  const fixed = { problem: { postackId: problem.postackId, title: problem.title, device: problem.device, environment: problem.environment, symptoms: problem.symptoms, status: problem.status, statusNote: problem.statusNote, outcomes: problem.outcomes, provenance: problem.provenance }, sources, evidence, corrections: problem.corrections, related: view.related }
  let used = JSON.stringify(fixed).length
  const contributions: ContextPacket['contributions'] = []
  let omitted = 0
  for (const [index, c] of ordered.entries()) {
    // The targeted (or first) contribution is always present, even under a budget the fixed part already fills.
    const room = index === 0 ? Math.max(budget - used, 800) : budget - used
    if (room < 200) { omitted++; continue }
    const truncated = c.text.length > room - 150
    const text = truncated ? `${c.text.slice(0, Math.max(0, room - 153))}…` : c.text
    const entry = { ...summarize(c), text, truncated, sourceRefs: c.sourceRefs.map(s => s.objectId), assistance: c.assistance,
      ...(c.parent ? { parent: c.parent.kind === 'local' ? c.parent.id : c.parent.kind === 'atproto' ? c.parent.uri : c.parent.objectId } : {}) }
    used += JSON.stringify(entry).length
    contributions.push(entry)
    if (truncated) omissions.push(`Contribution ${c.id} truncated to fit the budget; fetch it by id for the full text.`)
  }
  if (omitted) omissions.push(`${omitted} contribution(s) omitted for budget; use getProblem for the full list.`)
  if (view.moderatedCount) omissions.push(`${view.moderatedCount} contribution(s) withheld by local moderation or remote deletion.`)
  omissions.push('Full source text is not stored here; only short verbatim excerpts and permalinks.')
  return {
    target: { problemId, ...(input.contributionId ? { contributionId: input.contributionId } : {}) },
    generatedAt: now,
    budget: { chars: budget, used },
    freshness: { snapshotAt: manifest.snapshotAt, snapshotRevision: manifest.revision, recordsOriginCommit: problem.provenance.originCommit, roomVersion: view.version,
      lastSync: Object.values(metadata.sync).map(s => ({ did: s.did, status: s.status, ...(s.completedAt ? { completedAt: s.completedAt } : {}) })) },
    ...fixed, contributions, omissions,
    limitations: [
      `Problem record fields are written by ${problem.provenance.authoredBy} and ${problem.provenance.review}; they are interpretations, not source statements.`,
      'Contributions are attributed statements by their authors; inclusion here is not endorsement or verification.',
      'Ingested ATProto records reflect the last retrieval time; an unreachable repository is stale, not deleted.',
      'Ranking, when present, is lexical and carries no confidence.',
    ],
    links: { app: appLinks.problem(problemId) },
  }
}

// --- browse --------------------------------------------------------------------

export function browse(loaded: LoadedCommons, metadata: CommonsMetadata, input: { path?: string; object?: string; type?: 'issue' | 'pull' | 'discussion'; cursor?: string; limit?: number; linkedOnly?: boolean }) {
  const problems = Object.values(metadata.sources)
  // Moderated contributions are never visible here, so a hidden citation leaves no trace on the navigator.
  const shown = visible(loaded)
  const community = contributionCitationIndex(shown)
  const base = { coverage: coverage(), problems: problems.length, contributions: shown.length, link: appLinks.repository(input.path ?? '') }
  if (input.object) {
    const thread = getThreadObject(input.object, problems, community)
    if (!thread) throw notFound('Thread', input.object)
    return { ...base, view: 'thread' as const, thread }
  }
  if (input.type || input.cursor !== undefined || input.linkedOnly) {
    return { ...base, view: 'threads' as const, ...listThreads(problems, { ...(input.type ? { type: input.type } : {}), ...(input.cursor ? { cursor: input.cursor } : {}), ...(input.limit ? { limit: input.limit } : {}), ...(input.linkedOnly ? { linkedOnly: true } : {}) }, community) }
  }
  const listing = listPath(input.path ?? '', problems, community)
  if (!listing) throw notFound('Path', input.path ?? '')
  if (listing.doc) return { ...base, view: 'doc' as const, doc: listing.doc, path: listing.path }
  return {
    ...base, view: 'dir' as const, path: listing.path, entries: listing.entries,
    ...(listing.path === '' ? { threads: { ...manifest.totals, linked: listThreads(problems, { linkedOnly: true, limit: 200 }).total, citedByContributions: [...community.keys()].filter(k => !k.startsWith('doc/') && !k.startsWith('comment/')).length } } : {}),
  }
}

// --- prepare (validate without writing) ------------------------------------------

export interface PreparedContribution {
  ok: boolean
  errors: string[]
  warnings: string[]
  command?: SubmitContributionCommandV2
  destination: { roomId: string; problemId: string; link: string; visibility: string; publication: string }
  digest?: string
  parentSummary?: ContributionSummary | { objectId: string; kind: 'source' }
}

export function prepareContribution(loaded: LoadedCommons, metadata: CommonsMetadata, raw: unknown): PreparedContribution {
  const errors: string[] = []
  const warnings: string[] = []
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const problemId = typeof input.problemId === 'string' ? input.problemId.trim() : ''
  const source = metadata.sources[problemId]
  const destination = {
    roomId: importedProblemSpaceId(problemId || '?'), problemId: problemId || '?', link: appLinks.problem(problemId || '?'),
    visibility: 'local shared room on this server (participants who sign in here); not GitHub',
    publication: 'none: publishing to an ATProto repository is a separate, explicit step after submission',
  }
  if (!source) errors.push(problemId ? `Unknown problem "${problemId}".` : 'problemId is required.')
  const text = typeof input.text === 'string' ? input.text.trim() : ''
  if (!text) errors.push('text is required.')
  else if (text.length > MAX_CONTRIBUTION_LENGTH) errors.push(`text may be at most ${MAX_CONTRIBUTION_LENGTH} characters.`)
  const kind = input.kind === undefined ? 'observation' : input.kind
  if (!(COMMONS_CONTRIBUTION_KINDS as unknown[]).includes(kind)) errors.push(`kind must be one of ${COMMONS_CONTRIBUTION_KINDS.join(', ')}.`)
  const assistance = input.assistance === undefined ? (typeof input.preparedBy === 'string' && input.preparedBy && input.preparedBy !== 'browser-draft' ? 'ai-drafted' : 'none') : input.assistance
  if (!(ASSISTANCE_DECLARATIONS as unknown[]).includes(assistance)) errors.push(`assistance must be one of ${ASSISTANCE_DECLARATIONS.join(', ')}.`)
  const sourceRefs = Array.isArray(input.sourceRefs) ? input.sourceRefs : []
  if (!Array.isArray(input.sourceRefs) && input.sourceRefs !== undefined) errors.push('sourceRefs must be an array of object ids.')
  const known = new Set((source?.evidence ?? []).map(e => e.source.objectId))
  for (const ref of sourceRefs) if (typeof ref !== 'string' || !known.has(ref)) errors.push(`Source reference ${JSON.stringify(ref)} does not belong to this problem.`)
  if (source && sourceRefs.length === 0) warnings.push('No source references selected; the contribution will not cite any evidence.')
  let parentSummary: PreparedContribution['parentSummary']
  const link = (field: 'parentId' | 'supersedesId' | 'contradictsId') => {
    const value = input[field]
    if (value === undefined) return
    if (typeof value !== 'string' || !value.trim()) { errors.push(`${field} must be a non-empty string.`); return }
    const target = loaded.contributions.get(value) ?? (metadata.external[value]?.contributionId ? loaded.contributions.get(metadata.external[value].contributionId!) : undefined)
    if (target) {
      if (target.problemId !== problemId) errors.push(`${field} ${value} belongs to problem ${target.problemId}, not ${problemId}.`)
      else if (isModerated(target)) errors.push(`${field} ${value} is not available (${target.reason}).`)
      else if (field === 'parentId') parentSummary = summarize(target)
      return
    }
    if (field === 'parentId' && source?.evidence.some(e => e.source.objectId === value || `commons:${problemId}:${e.id}` === value)) {
      const e = source.evidence.find(e => e.source.objectId === value || `commons:${problemId}:${e.id}` === value)!
      parentSummary = { objectId: e.source.objectId, kind: 'source' }
      return
    }
    errors.push(`${field} ${value} was not found in this problem.`)
  }
  link('parentId'); link('supersedesId'); link('contradictsId')
  if (input.observedAt !== undefined && (typeof input.observedAt !== 'string' || Number.isNaN(Date.parse(input.observedAt)))) errors.push('observedAt must be an ISO-8601 time.')
  if (input.circumstances !== undefined && typeof input.circumstances !== 'string') errors.push('circumstances must be a string.')
  const command: SubmitContributionCommandV2 | undefined = errors.length ? undefined : {
    commandId: typeof input.commandId === 'string' && input.commandId.trim() ? input.commandId : `prepared:${stableHash({ problemId, text, kind, sourceRefs, circumstances: input.circumstances, parentId: input.parentId })}`,
    problemId, text, sourceRefs: sourceRefs as string[], kind: kind as CommonsContributionKind, assistance: assistance as AssistanceDeclaration,
    ...(typeof input.circumstances === 'string' && input.circumstances.trim() ? { circumstances: input.circumstances.trim() } : {}),
    ...(typeof input.preparedBy === 'string' && input.preparedBy ? { preparedBy: input.preparedBy } : {}),
    ...(typeof input.parentId === 'string' ? { parentId: input.parentId } : {}),
    ...(typeof input.supersedesId === 'string' ? { supersedesId: input.supersedesId } : {}),
    ...(typeof input.contradictsId === 'string' ? { contradictsId: input.contradictsId } : {}),
    ...(typeof input.observedAt === 'string' ? { observedAt: input.observedAt } : {}),
  }
  return {
    ok: errors.length === 0, errors, warnings, destination,
    ...(command ? { command, digest: stableHash({ ...command, commandId: undefined }) } : {}),
    ...(parentSummary ? { parentSummary } : {}),
  }
}

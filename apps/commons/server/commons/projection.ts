/**
 * One projection for every entrance. UI, HTTP, CLI and MCP all read
 * `CommonsContribution` built here from the room's event history plus the
 * adapter metadata, so no transport can show a different author, revision or
 * moderation state than another.
 */
import type {
  AssistanceDeclaration, CommonsActor, CommonsContribution, CommonsContributionKind, ImportedProblem,
  ModeratedContribution, Ref, SourceRef,
} from '../../src/commons/contracts.js'
import { appLinks, importedProblemSpaceId } from '../../src/commons/contracts.js'
import type { MemoryEvent } from '../domain/events.js'
import type { ContributionKind, ContributionRecord } from '../domain/types.js'
import type { CommonsMetadata, SubmissionMeta } from './import.js'

export const IMPORT_ACTOR = 'repo:postack-underflow'

/** Commons kinds are stored as the room ontology's nearest kind; the Commons kind itself lives in metadata. */
export const DOMAIN_KIND_FOR: Record<CommonsContributionKind, ContributionKind> = {
  question: 'question', observation: 'claim', attempt: 'approach', outcome: 'evidence', correction: 'contradiction',
}
const COMMONS_KIND_FOR: Record<ContributionKind, CommonsContributionKind> = {
  question: 'question', claim: 'observation', approach: 'attempt', evidence: 'outcome', contradiction: 'correction',
  assumption: 'observation', synthesis: 'observation',
}

export const roomToProblemId = (roomId: string) => roomId.startsWith('commons:') ? roomId.slice('commons:'.length) : roomId
export const isImportedEvidence = (c: ContributionRecord) => c.provenance.authoredBy === IMPORT_ACTOR

export function actorFor(id: string, displayNames: Record<string, string> = {}): CommonsActor {
  if (id.startsWith('did:')) return { id, kind: 'atproto', ...(displayNames[id] ? { displayName: displayNames[id] } : {}) }
  if (id.startsWith('repo:')) return { id, kind: 'import' }
  return { id, kind: 'participant', ...(displayNames[id] ? { displayName: displayNames[id] } : {}) }
}

/** Revision = 1 + edits recorded for the object, so an updated external record advances its version. */
export function revisionsFrom(events: MemoryEvent[]): Map<string, number> {
  const revisions = new Map<string, number>()
  for (const e of events) {
    if (e.eventType === 'ContributionAdded') revisions.set(e.objectId, 1)
    else if (e.eventType === 'ContributionEdited') revisions.set(e.objectId, (revisions.get(e.objectId) ?? 1) + 1)
  }
  return revisions
}

export interface ProjectionContext {
  metadata: CommonsMetadata
  source: ImportedProblem | undefined
  revisions: Map<string, number>
  /** Handle/display-name lookups for external authors, from observations. */
  displayNames?: Record<string, string>
}

const parseDetail = (c: ContributionRecord): Partial<SubmissionMeta> & { postackId?: string } => {
  try { return c.provenance.sourceDetail ? JSON.parse(c.provenance.sourceDetail) : {} } catch { return {} }
}

export function moderationOf(ctx: ProjectionContext, c: ContributionRecord): ModeratedContribution['reason'] | null {
  const { moderation, external } = ctx.metadata
  if (moderation.hidden[c.id]) return 'hidden'
  if (moderation.blockedAuthors[c.provenance.authoredBy]) return 'blocked-author'
  const observation = Object.values(external).find(o => o.contributionId === c.id)
  if (observation?.availability === 'deleted') return 'deleted'
  if (observation?.availability === 'invalid') return 'invalid'
  return null
}

/** Builds the shared view of one participant or external contribution. Imported evidence is not a contribution. */
export function toCommonsContribution(ctx: ProjectionContext, c: ContributionRecord): CommonsContribution | ModeratedContribution {
  const roomId = c.problemId
  const problemId = roomToProblemId(roomId)
  const moderated = moderationOf(ctx, c)
  if (moderated) return { id: c.id, problemId, roomId, moderated: true, reason: moderated, createdAt: c.createdAt }
  const meta: Partial<SubmissionMeta> = ctx.metadata.submissions[c.id] ?? parseDetail(c)
  const byObject = new Map((ctx.source?.evidence ?? []).map(e => [e.source.objectId, e.source]))
  const sourceRefs: SourceRef[] = (meta.sourceRefs ?? []).flatMap(id => (byObject.get(id) ? [byObject.get(id)!] : []))
  const declared: AssistanceDeclaration = meta.assistance
    ?? (c.provenance.preparedBy && c.provenance.preparedBy !== 'browser-draft' ? 'ai-drafted' : 'none')
  const observation = Object.values(ctx.metadata.external).find(o => o.contributionId === c.id)
  const origin: CommonsContribution['origin'] = observation
    ? { kind: 'atproto', uri: observation.uri, cid: observation.cid, did: observation.did, retrievedAt: observation.retrievedAt,
        availability: observation.availability,
        ...(observation.handle ? { handle: observation.handle } : {}),
        ...(observation.pdsEndpoint ? { pdsEndpoint: observation.pdsEndpoint } : {}),
        ...(observation.selfPublicationOf ? { selfPublicationOf: observation.selfPublicationOf } : {}) }
    : { kind: 'local' }
  return {
    id: c.id,
    revision: ctx.revisions.get(c.id) ?? 1,
    problemId,
    roomId,
    kind: meta.kind ?? COMMONS_KIND_FOR[c.kind] ?? 'observation',
    text: c.content,
    ...(meta.circumstances !== undefined ? { circumstances: meta.circumstances } : {}),
    sourceRefs,
    actor: actorFor(c.provenance.authoredBy, ctx.displayNames),
    submittedBy: c.provenance.submittedBy,
    assistance: { declared, ...(c.provenance.preparedBy ? { preparedBy: c.provenance.preparedBy } : {}) },
    createdAt: c.createdAt,
    ...(meta.observedAt ? { observedAt: meta.observedAt } : {}),
    ...(meta.parent ? { parent: meta.parent } : {}),
    ...(meta.supersedes ? { supersedes: meta.supersedes } : {}),
    ...(meta.contradicts ? { contradicts: meta.contradicts } : {}),
    origin,
    entrance: origin.kind === 'atproto' && !origin.selfPublicationOf ? 'atproto' : meta.entrance ?? 'unknown',
    publication: ctx.metadata.publications[c.id] ?? null,
    links: { app: appLinks.contribution(c.id) },
  }
}

export interface ThreadNode { contribution: CommonsContribution | ModeratedContribution; replies: ThreadNode[]; corrections: ThreadNode[] }

const refTargets = (ref: Ref | undefined, external: CommonsMetadata['external']): string[] => {
  if (!ref) return []
  if (ref.kind === 'local') return [ref.id]
  if (ref.kind === 'atproto') {
    const o = external[ref.uri]
    return o?.contributionId ? [o.contributionId] : []
  }
  return []
}

/**
 * Reconstructs a conversation from parent/supersedes/contradicts links. Both
 * voices stay: a correction is attached under its target and never mutates it.
 */
export function buildThread(rootId: string, all: Array<CommonsContribution | ModeratedContribution>, external: CommonsMetadata['external']): ThreadNode | undefined {
  const byId = new Map(all.map(c => [c.id, c]))
  const root = byId.get(rootId)
  if (!root) return undefined
  const visited = new Set<string>()
  const build = (id: string): ThreadNode => {
    visited.add(id)
    const node: ThreadNode = { contribution: byId.get(id)!, replies: [], corrections: [] }
    for (const c of all) {
      if (visited.has(c.id) || 'moderated' in c) continue
      const full = c as CommonsContribution
      if (refTargets(full.parent, external).includes(id)) node.replies.push(build(c.id))
      else if ([...refTargets(full.supersedes, external), ...refTargets(full.contradicts, external)].includes(id)) node.corrections.push(build(c.id))
    }
    return node
  }
  return build(rootId)
}

export const threadParticipants = (node: ThreadNode): string[] => {
  const ids = new Set<string>()
  const walk = (n: ThreadNode) => {
    if (!('moderated' in n.contribution)) ids.add(n.contribution.actor.id)
    for (const r of [...n.replies, ...n.corrections]) walk(r)
  }
  walk(node)
  return [...ids]
}

export const problemLink = (problemId: string) => appLinks.problem(problemId)
export const roomOf = importedProblemSpaceId

export interface ReplyStats { replies: number; participants: string[]; lastActivityAt: string }

/**
 * Per visible contribution: how many visible replies/corrections hang below it
 * (any depth), who took part and when the conversation last moved. Lets every
 * entrance say "3 replies from 2 people" without fetching the thread.
 */
export function replyStats(all: CommonsContribution[], external: CommonsMetadata['external']): Map<string, ReplyStats> {
  const children = new Map<string, CommonsContribution[]>()
  for (const c of all) {
    const targets = new Set([...refTargets(c.parent, external), ...refTargets(c.supersedes, external), ...refTargets(c.contradicts, external)])
    for (const t of targets) if (t !== c.id) children.set(t, [...(children.get(t) ?? []), c])
  }
  const stats = new Map<string, ReplyStats>()
  for (const root of all) {
    const seen = new Set<string>([root.id])
    const people = new Set<string>([root.actor.id])
    let last = root.createdAt
    const queue = [...(children.get(root.id) ?? [])]
    while (queue.length) {
      const c = queue.shift()!
      if (seen.has(c.id)) continue
      seen.add(c.id); people.add(c.actor.id)
      if (c.createdAt > last) last = c.createdAt
      queue.push(...(children.get(c.id) ?? []))
    }
    stats.set(root.id, { replies: seen.size - 1, participants: [...people], lastActivityAt: last })
  }
  return stats
}

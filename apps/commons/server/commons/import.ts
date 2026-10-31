/** Bounded Postack bridge. Source text lives in metadata, never participant events. */
import { createHash, randomUUID } from 'node:crypto'
import type { AssistanceDeclaration, CommonsContributionKind, EdgeOrigin, ExternalAvailability, ImportedProblem, PublicationIntent, PublicationReceipt, Ref } from '../../src/commons/contracts.js'
import { COMMONS_SCHEMA_VERSION, importedContributionId, importedProblemSpaceId } from '../../src/commons/contracts.js'
import { makeEvent, systemClock, type Clock, type MemoryEvent } from '../domain/events.js'
import { conflictError, invalid } from '../domain/errors.js'
import type { RepositoryTransaction, TransactionalEventRepository } from '../persistence/repository.js'

export const commonsIds = { next: (prefix: string) => `${prefix}_${randomUUID()}` }
export function stableHash(value: unknown): string {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical)
    : v !== null && typeof v === 'object'
      ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}
export interface SubmissionMeta {
  sourceRefs: string[]
  circumstances?: string
  commandId: string
  kind?: CommonsContributionKind
  assistance?: AssistanceDeclaration
  parent?: Ref
  supersedes?: Ref
  contradicts?: Ref
  observedAt?: string
}
/** One observed remote record. Our copy is an attributed observation, never authority over the author's content. */
export interface ExternalObservation {
  uri: string
  cid: string
  did: string
  handle?: string
  pdsEndpoint?: string
  collection: string
  rkey: string
  retrievedAt: string
  availability: ExternalAvailability
  invalidReason?: string
  /** Local contribution the observation was projected into, when its problem resolved. */
  contributionId?: string
  roomId?: string
  /** Kept visible rather than merged: the record names a problem this app does not have. */
  unresolvedProblem?: { appUrl: string; localId: string; repository: string }
  /** The local contribution this record is a publication of (same DID as the receipt). */
  selfPublicationOf?: string
  versions: Array<{ cid: string; retrievedAt: string }>
}
export interface SyncProgress {
  did: string
  status: 'running' | 'complete' | 'partial' | 'failed'
  cursor?: string
  startedAt: string
  completedAt?: string
  pages: number
  records: number
  /** URIs seen so far in the current scan; deletion is inferred only from a complete scan. */
  seenUris: string[]
  lastError?: string
  pdsEndpoint?: string
}
export interface CommonsMetadata {
  schemaVersion: string
  sources: Record<string, ImportedProblem>
  commands: Record<string, { hash: string; outcome: unknown }>
  edges: Record<string, { origin: EdgeOrigin; evidenceIds: string[]; relation: string }>
  submissions: Record<string, SubmissionMeta>
  publications: Record<string, PublicationReceipt>
  intents: Record<string, PublicationIntent>
  /** Intent IDs awaiting a confirmed receipt, in queue order. Survives restarts. */
  outbox: string[]
  external: Record<string, ExternalObservation>
  sync: Record<string, SyncProgress>
  moderation: {
    hidden: Record<string, { by: string; at: string; reason?: string }>
    blockedAuthors: Record<string, { by: string; at: string; reason?: string }>
  }
}
/**
 * Reads the adapter's metadata, migrating stores written by the first slice
 * forward: missing collections are created empty and old submissions keep their
 * IDs and fields (kind/assistance default on read, see projection.ts).
 */
export function commonsMetadata(tx: RepositoryTransaction): CommonsMetadata {
  const raw = (tx.metadata.commons ??= {}) as Partial<CommonsMetadata>
  raw.sources ??= {}
  raw.commands ??= {}
  raw.edges ??= {}
  raw.submissions ??= {}
  raw.publications ??= {}
  raw.intents ??= {}
  raw.outbox ??= []
  raw.external ??= {}
  raw.sync ??= {}
  raw.moderation ??= { hidden: {}, blockedAuthors: {} }
  raw.moderation.hidden ??= {}
  raw.moderation.blockedAuthors ??= {}
  raw.schemaVersion = COMMONS_SCHEMA_VERSION
  return raw as CommonsMetadata
}
export function assertImportedProblems(input: unknown): asserts input is ImportedProblem[] {
  if (!Array.isArray(input) || input.length > 1000) throw invalid('problems must be an array of at most 1000 records.')
  const ids = new Set<string>()
  for (const p of input as ImportedProblem[]) {
    if (!p || typeof p.postackId !== 'string' || !p.postackId.trim() || typeof p.title !== 'string' || !p.title.trim()
      || !Array.isArray(p.evidence) || !Array.isArray(p.related) || !Array.isArray(p.environment)
      || !Array.isArray(p.device) || !Array.isArray(p.symptoms) || !Array.isArray(p.aliases)
      || !Array.isArray(p.outcomes) || !Array.isArray(p.corrections) || !p.provenance
      || typeof p.provenance.authoredBy !== 'string') throw invalid('Invalid imported problem.')
    if (ids.has(p.postackId)) throw invalid('Duplicate Postack ID.')
    ids.add(p.postackId)
    const evidenceIds = new Set<string>()
    for (const e of p.evidence) {
      if (!e || typeof e.id !== 'string' || !e.id || evidenceIds.has(e.id) || !e.source
        || typeof e.source.objectId !== 'string' || typeof e.source.permalink !== 'string') throw invalid('Invalid evidence reference.')
      evidenceIds.add(e.id)
    }
    for (const r of p.related) {
      if (!r || typeof r.problemId !== 'string' || typeof r.relation !== 'string'
        || !['postack-agent', 'source'].includes(r.origin) || !Array.isArray(r.evidenceIds)) throw invalid('Invalid imported relation.')
    }
  }
}
export interface ImportResult { roomIds: string[]; appendedEvents: number }
export async function importIntoTransaction(tx: RepositoryTransaction, problems: ImportedProblem[], clock: Clock): Promise<ImportResult> {
  const metadata = commonsMetadata(tx)
  const events: MemoryEvent[] = []
  const deps = { clock, ids: commonsIds }
  for (const p of problems) {
    const previous = metadata.sources[p.postackId]
    if (previous) {
      if (stableHash(previous) !== stableHash(p)) throw conflictError('Imported record changed; a new source revision requires explicit migration.', { postackId: p.postackId })
      continue
    }
    const problemId = importedProblemSpaceId(p.postackId)
    if ((await tx.repository.read(problemId)).length) throw conflictError('Room ID already exists.', { problemId })
    events.push(makeEvent(deps, {
      problemId, objectId: problemId, actorId: 'repo:postack-underflow', eventType: 'ProblemCreated',
      payload: { title: p.title, shortTitle: p.title, description: 'Imported Postack interpretation; source evidence is available separately.', stateSummary: 'Unreviewed imported record', thinkNext: [] },
    }))
    for (const e of p.evidence) {
      events.push(makeEvent(deps, {
        problemId, objectId: importedContributionId(p.postackId, e.id), actorId: 'repo:postack-underflow', eventType: 'ContributionAdded',
        payload: { kind: 'evidence', label: `Imported evidence ${e.id}`, content: `Imported evidence reference: ${e.source.objectId} (${e.id}).`, visibility: 'problem',
          provenance: { authoredBy: 'repo:postack-underflow', preparedBy: p.provenance.authoredBy, submittedBy: 'repo:postack-underflow', source: 'repo_import',
            sourceDetail: JSON.stringify({ postackId: p.postackId, evidenceId: e.id, source: e.source }), endorsement: 'participant_review_required', timestamp: clock.now() } },
      }))
    }
    for (const [index, r] of p.related.entries()) {
      const proposalId = `commons:${p.postackId}:relation:${index}`
      metadata.edges[proposalId] = { origin: r.origin === 'source' ? 'source-assertion' : 'postack-agent', evidenceIds: [...r.evidenceIds], relation: r.relation }
      events.push(makeEvent(deps, {
        problemId, objectId: proposalId, actorId: 'postack-agent', eventType: 'RelationProposed',
        payload: { proposalId, kind: 'relation', sourceId: problemId, targetId: importedProblemSpaceId(r.problemId), relationKind: 'relates',
          reason: `Unreviewed imported ${r.relation}; see original record and evidence.`, confidence: 0, proposedBy: 'postack-agent' },
      }))
    }
    metadata.sources[p.postackId] = structuredClone(p)
  }
  await tx.repository.append(events)
  return { roomIds: problems.map(p => importedProblemSpaceId(p.postackId)), appendedEvents: events.length }
}
export function createCommonsImporter(repository: TransactionalEventRepository, clock: Clock = systemClock) {
  return async (problems: ImportedProblem[]): Promise<ImportResult> => {
    assertImportedProblems(problems)
    const snapshot = structuredClone(problems)
    return repository.transaction(tx => importIntoTransaction(tx, snapshot, clock))
  }
}

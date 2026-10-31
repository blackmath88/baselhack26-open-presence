/**
 * Bounded, validated ingestion from opted-in ATProto repositories. Observed
 * records are projected into the same rooms as local contributions, attributed
 * to the publishing DID, with their CID/revision kept. Our copy is a cache: an
 * update is a new version of one contribution, a deletion is a visibility
 * change, and an unreachable repository is stale, never deleted.
 */
import type { ExternalAvailability, Ref } from '../../src/commons/contracts.js'
import { importedProblemSpaceId } from '../../src/commons/contracts.js'
import { manifest } from '../../src/commons/source/index.js'
import { deriveLabel, makeEvent, type Clock, type MemoryEvent } from '../domain/events.js'
import type { RepositoryTransaction, TransactionalEventRepository } from '../persistence/repository.js'
import type { AtprotoAdapter, RemoteRecord } from './atproto/contract.js'
import { commonsIds, commonsMetadata, type ExternalObservation } from './import.js'
import { DOMAIN_KIND_FOR } from './projection.js'

export interface IngestDeps { adapter: AtprotoAdapter; appId: string; clock: Clock }

export type IngestOutcome = 'created' | 'updated' | 'unchanged' | 'self' | 'self-updated' | 'unresolved' | 'invalid'

const ids = { next: (prefix: string) => commonsIds.next(prefix) }

function observation(remote: RemoteRecord, context: { pdsEndpoint?: string; handle?: string }, now: string, availability: ExternalAvailability, previous?: ExternalObservation): ExternalObservation {
  return {
    uri: remote.uri, cid: remote.cid, did: remote.did, collection: remote.collection, rkey: remote.rkey, retrievedAt: now, availability,
    ...(context.handle ? { handle: context.handle } : previous?.handle ? { handle: previous.handle } : {}),
    ...(context.pdsEndpoint ? { pdsEndpoint: context.pdsEndpoint } : previous?.pdsEndpoint ? { pdsEndpoint: previous.pdsEndpoint } : {}),
    ...(previous?.contributionId ? { contributionId: previous.contributionId } : {}),
    ...(previous?.roomId ? { roomId: previous.roomId } : {}),
    ...(previous?.selfPublicationOf ? { selfPublicationOf: previous.selfPublicationOf } : {}),
    versions: [...(previous?.versions ?? []), ...(previous?.cid === remote.cid ? [] : [{ cid: remote.cid, retrievedAt: now }])],
  }
}

const refOf = (ref: Ref | undefined): Ref | undefined => ref

/** Inside a transaction. Returns what happened so sync can report counts honestly. */
export async function ingestRemote(tx: RepositoryTransaction, deps: IngestDeps, remote: RemoteRecord, context: { pdsEndpoint?: string; handle?: string }): Promise<{ outcome: IngestOutcome; contributionId?: string; reason?: string }> {
  const metadata = commonsMetadata(tx)
  const now = deps.clock.now()
  const previous = metadata.external[remote.uri]
  if (previous && previous.cid === remote.cid && previous.availability === 'available') {
    metadata.external[remote.uri] = { ...previous, retrievedAt: now, ...(context.handle ? { handle: context.handle } : {}) }
    return { outcome: 'unchanged', ...(previous.contributionId ? { contributionId: previous.contributionId } : {}) }
  }
  const parsed = deps.adapter.parseRecord(remote.value)
  if (!parsed.ok) {
    metadata.external[remote.uri] = { ...observation(remote, context, now, 'invalid', previous), invalidReason: parsed.reason }
    return { outcome: 'invalid', reason: parsed.reason }
  }
  const value = parsed.value
  const problemId = value.problem.localId
  const source = metadata.sources[problemId]
  if (!source || value.problem.repository !== manifest.repository) {
    metadata.external[remote.uri] = { ...observation(remote, context, now, 'available', previous), unresolvedProblem: { appUrl: value.problem.appUrl, localId: problemId, repository: value.problem.repository } }
    return { outcome: 'unresolved', reason: `Problem "${problemId}" from ${value.problem.repository} is not known here; kept as an unresolved reference, not merged.` }
  }
  const roomId = importedProblemSpaceId(problemId)
  const known = new Set(source.evidence.map(e => e.source.objectId))
  const meta = {
    sourceRefs: value.sourceRefs.map(s => s.objectId).filter(id => known.has(id)),
    ...(value.circumstances ? { circumstances: value.circumstances } : {}),
    commandId: `ingest:${remote.uri}`, kind: value.kind, assistance: value.assistance.declared,
    ...(refOf(value.parent) ? { parent: value.parent! } : {}),
    ...(refOf(value.supersedes) ? { supersedes: value.supersedes! } : {}),
    ...(refOf(value.contradicts) ? { contradicts: value.contradicts! } : {}),
    ...(value.observedAt ? { observedAt: value.observedAt } : {}),
  }
  // Self-publication: the record declares it originates from a contribution this app published from the same DID.
  const origin = value.origin
  const receipt = origin && origin.app === deps.appId ? metadata.publications[origin.localId] : undefined
  if (origin && receipt && receipt.did === remote.did && receipt.rkey === remote.rkey) {
    const edited = receipt.cid !== undefined && receipt.cid !== remote.cid
    metadata.external[remote.uri] = { ...observation(remote, context, now, 'available', previous), contributionId: origin.localId, roomId, selfPublicationOf: origin.localId }
    if (receipt.status !== 'published' || !receipt.uri) Object.assign(receipt, { status: 'published', uri: remote.uri, cid: remote.cid, publishedAt: receipt.publishedAt ?? now })
    if (edited) {
      await tx.repository.append([makeEvent({ clock: deps.clock, ids }, { problemId: roomId, actorId: remote.did, objectId: origin.localId, eventType: 'ContributionEdited',
        payload: { content: value.text, label: deriveLabel(value.text), reason: `Remote update observed at ${remote.cid}` } })])
      receipt.cid = remote.cid
      metadata.submissions[origin.localId] = { ...metadata.submissions[origin.localId], ...meta, commandId: metadata.submissions[origin.localId]?.commandId ?? meta.commandId }
      return { outcome: 'self-updated', contributionId: origin.localId }
    }
    return { outcome: 'self', contributionId: origin.localId }
  }
  const events: MemoryEvent[] = []
  if (previous?.contributionId) {
    events.push(makeEvent({ clock: deps.clock, ids }, { problemId: roomId, actorId: remote.did, objectId: previous.contributionId, eventType: 'ContributionEdited',
      payload: { content: value.text, label: deriveLabel(value.text), kind: DOMAIN_KIND_FOR[value.kind], reason: `Remote update observed at ${remote.cid}` } }))
    await tx.repository.append(events)
    metadata.submissions[previous.contributionId] = { ...metadata.submissions[previous.contributionId], ...meta }
    metadata.external[remote.uri] = { ...observation(remote, context, now, 'available', previous), contributionId: previous.contributionId, roomId }
    return { outcome: 'updated', contributionId: previous.contributionId }
  }
  const contributionId = ids.next('ext')
  events.push(makeEvent({ clock: deps.clock, ids }, { problemId: roomId, actorId: remote.did, objectId: contributionId, eventType: 'ContributionAdded',
    payload: { kind: DOMAIN_KIND_FOR[value.kind], label: deriveLabel(value.text), content: value.text, visibility: 'problem',
      provenance: { authoredBy: remote.did, submittedBy: remote.did, source: 'atproto', sourceDetail: JSON.stringify({ uri: remote.uri, cid: remote.cid }),
        ...(value.assistance.preparedBy ? { preparedBy: value.assistance.preparedBy } : {}), endorsement: 'participant_review_required', timestamp: value.createdAt } } }))
  await tx.repository.append(events)
  metadata.submissions[contributionId] = meta
  metadata.external[remote.uri] = { ...observation(remote, context, now, 'available', previous), contributionId, roomId }
  return { outcome: 'created', contributionId }
}

export interface ResolveResult { uri: string; status: 'ingested' | 'deleted' | 'missing' | 'stale' | 'unavailable' | 'refused'; outcome?: IngestOutcome; contributionId?: string; reason?: string }

export async function resolveExternal(repository: TransactionalEventRepository, deps: IngestDeps, uri: string): Promise<ResolveResult> {
  const fetched = await deps.adapter.reader.getRecord(uri)
  return repository.transaction(async tx => {
    const metadata = commonsMetadata(tx)
    const previous = metadata.external[uri]
    const now = deps.clock.now()
    if (fetched.status === 'found') {
      const result = await ingestRemote(tx, deps, fetched.record, { pdsEndpoint: fetched.pdsEndpoint, ...(fetched.handle ? { handle: fetched.handle } : {}) })
      return { uri, status: 'ingested', outcome: result.outcome, ...(result.contributionId ? { contributionId: result.contributionId } : {}), ...(result.reason ? { reason: result.reason } : {}) }
    }
    if (fetched.status === 'missing') {
      if (previous) { metadata.external[uri] = { ...previous, availability: 'deleted', retrievedAt: now }; return { uri, status: 'deleted', ...(previous.contributionId ? { contributionId: previous.contributionId } : {}) } }
      return { uri, status: 'missing', reason: 'No such record at the author\'s repository; nothing was stored.' }
    }
    if (fetched.status === 'refused') return { uri, status: 'refused', reason: fetched.reason }
    if (previous) { metadata.external[uri] = { ...previous, availability: previous.availability === 'deleted' ? 'deleted' : 'stale' }; return { uri, status: 'stale', reason: fetched.error, ...(previous.contributionId ? { contributionId: previous.contributionId } : {}) } }
    return { uri, status: 'unavailable', reason: fetched.error }
  })
}

export interface SyncResult {
  did: string; status: 'complete' | 'partial' | 'failed' | 'refused'; pages: number; records: number
  outcomes: Record<IngestOutcome, number>; deleted: number; cursor?: string; error?: string; pdsEndpoint?: string; handle?: string
}

const emptyOutcomes = (): Record<IngestOutcome, number> => ({ created: 0, updated: 0, unchanged: 0, self: 0, 'self-updated': 0, unresolved: 0, invalid: 0 })

/** Pages through one author's collection with persisted progress; a scan counts as complete only when every page succeeded. */
export async function syncAuthor(repository: TransactionalEventRepository, deps: IngestDeps, didOrHandle: string, options: { maxPages?: number; pageSize?: number } = {}): Promise<SyncResult> {
  const identity = await deps.adapter.reader.resolveIdentity(didOrHandle)
  if ('refused' in identity) return { did: didOrHandle, status: 'refused', pages: 0, records: 0, outcomes: emptyOutcomes(), deleted: 0, error: identity.refused }
  if ('unreachable' in identity) return { did: didOrHandle, status: 'failed', pages: 0, records: 0, outcomes: emptyOutcomes(), deleted: 0, error: identity.unreachable }
  const { did, pdsEndpoint } = identity
  const handle = identity.handle
  const collection = deps.adapter.namespace.contributionCollection
  const maxPages = Math.min(Math.max(options.maxPages ?? 20, 1), 100)
  const pageSize = Math.min(Math.max(options.pageSize ?? 50, 1), 100)
  const outcomes = emptyOutcomes()
  let cursor = await repository.transaction(async tx => {
    const metadata = commonsMetadata(tx)
    const now = deps.clock.now()
    const prior = metadata.sync[did]
    const resume = prior?.status === 'partial' && prior.cursor
    metadata.sync[did] = resume
      ? { ...prior, status: 'running', pdsEndpoint }
      : { did, status: 'running', startedAt: now, pages: 0, records: 0, seenUris: [], pdsEndpoint }
    return resume ? prior.cursor : undefined
  })
  let pages = 0
  let records = 0
  for (;;) {
    if (pages >= maxPages) {
      await repository.transaction(async tx => { const s = commonsMetadata(tx).sync[did]!; s.status = 'partial'; if (cursor) s.cursor = cursor })
      return { did, status: 'partial', pages, records, outcomes, deleted: 0, ...(cursor ? { cursor } : {}), pdsEndpoint, ...(handle ? { handle } : {}) }
    }
    const listed = await deps.adapter.reader.listRecords(did, collection, cursor, pageSize)
    if (listed.status !== 'page') {
      const error = listed.status === 'refused' ? listed.reason : listed.error
      await repository.transaction(async tx => {
        const s = commonsMetadata(tx).sync[did]!
        s.status = pages > 0 || s.pages > 0 ? 'partial' : 'failed'
        s.lastError = error
        if (cursor) s.cursor = cursor
        // Records already observed stay available: an interrupted scan is not deletion evidence.
      })
      return { did, status: pages > 0 ? 'partial' : 'failed', pages, records, outcomes, deleted: 0, error, ...(cursor ? { cursor } : {}), pdsEndpoint, ...(handle ? { handle } : {}) }
    }
    pages += 1
    const page = listed.page
    const done = await repository.transaction(async tx => {
      const metadata = commonsMetadata(tx)
      const s = metadata.sync[did]!
      for (const record of page.records) {
        const result = await ingestRemote(tx, deps, record, { pdsEndpoint, ...(handle ? { handle } : {}) })
        outcomes[result.outcome] += 1
        if (!s.seenUris.includes(record.uri)) s.seenUris.push(record.uri)
      }
      s.pages += 1
      s.records += page.records.length
      records += page.records.length
      // A PDS may return a cursor with the last page; the scan ends on an empty page or a missing cursor.
      if (page.cursor && page.records.length > 0) { s.cursor = page.cursor; return false }
      delete s.cursor
      s.status = 'complete'
      s.completedAt = deps.clock.now()
      let deleted = 0
      for (const o of Object.values(metadata.external)) {
        if (o.did !== did || o.collection !== collection || s.seenUris.includes(o.uri) || o.availability === 'deleted') continue
        o.availability = 'deleted'
        deleted += 1
      }
      s.seenUris = []
      return { deleted }
    })
    if (done) return { did, status: 'complete', pages, records, outcomes, deleted: done.deleted, pdsEndpoint, ...(handle ? { handle } : {}) }
    cursor = page.cursor
  }
}

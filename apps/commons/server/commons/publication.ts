/**
 * Publication outbox. An intent binds payload digest, account, revision and
 * expiry; a receipt tracks transport state separately from the local
 * contribution. The record key is allocated and persisted before any network
 * I/O, so a retry reuses it and a timeout can never produce a second record.
 */
import { TID } from '@atproto/common-web'
import type { CommonsContribution, PublicationIntent, PublicationReceipt } from '../../src/commons/contracts.js'
import { appLinks, isModerated } from '../../src/commons/contracts.js'
import { manifest } from '../../src/commons/source/index.js'
import type { ActorContext } from '../auth/actor-context.js'
import { conflictError, forbidden, invalid, notFound } from '../domain/errors.js'
import type { Clock } from '../domain/events.js'
import type { TransactionalEventRepository } from '../persistence/repository.js'
import type { AtprotoAdapter, AtprotoSession, PublishOutcome, RecordBuildInput } from './atproto/contract.js'
import { commonsIds, commonsMetadata, type CommonsMetadata } from './import.js'
import { loadCommons, type LoadedCommons } from './queries.js'

export const INTENT_TTL_MS = 15 * 60 * 1000

export interface PublicationDeps { adapter: AtprotoAdapter; appUrl: string; clock: Clock }

export type PreparePublicationResult =
  | { ready: false; reason: 'no-account' | 'not-author' | 'moderated' | 'external'; message: string; activation: ReturnType<AtprotoAdapter['sessions']['describe']> }
  | { ready: true; intent: Omit<PublicationIntent, 'record'>; preview: Record<string, unknown>; warnings: string[]; destination: { did: string; handle?: string; service: string; collection: string; rkey: string; uri: string } }

const snapshotId = () => `commons-001@${manifest.revision.slice(0, 12)}`

function resolvedRefs(c: CommonsContribution, metadata: CommonsMetadata, warnings: string[]): RecordBuildInput['resolved'] {
  const resolve = (field: 'parent' | 'supersedes' | 'contradicts') => {
    const ref = c[field]
    if (!ref) return undefined
    if (ref.kind === 'atproto') {
      const o = metadata.external[ref.uri]
      if (o && o.availability !== 'invalid') return { uri: o.uri, cid: ref.cid ?? o.cid }
      warnings.push(`${field} ${ref.uri} has not been observed here; the published record will not carry it.`)
      return undefined
    }
    if (ref.kind === 'local') {
      const receipt = metadata.publications[ref.id]
      if (receipt?.status === 'published' && receipt.uri && receipt.cid) return { uri: receipt.uri, cid: receipt.cid }
      const observed = Object.values(metadata.external).find(o => o.contributionId === ref.id && o.availability === 'available')
      if (observed) return { uri: observed.uri, cid: observed.cid }
      warnings.push(`${field} ${ref.id} is local-only (not published); the published record will reference it only through the app link.`)
      return undefined
    }
    warnings.push(`${field} points at source ${ref.objectId}; source objects are cited, not referenced as AT records.`)
    return undefined
  }
  const parent = resolve('parent'), supersedes = resolve('supersedes'), contradicts = resolve('contradicts')
  return { ...(parent ? { parent } : {}), ...(supersedes ? { supersedes } : {}), ...(contradicts ? { contradicts } : {}) }
}

function build(deps: PublicationDeps, c: CommonsContribution, metadata: CommonsMetadata, warnings: string[]) {
  return deps.adapter.buildRecord({
    contribution: c,
    problemUrl: `${deps.appUrl}/${appLinks.problem(c.problemId)}`,
    source: { repository: manifest.repository, revision: manifest.revision, snapshotId: snapshotId() },
    resolved: resolvedRefs(c, metadata, warnings),
  })
}

/** Inside a transaction: validates authorship and builds a content-bound intent. The session was resolved before. */
export function prepareIntent(metadata: CommonsMetadata, loaded: LoadedCommons, deps: PublicationDeps, actor: ActorContext, contributionId: string, session: AtprotoSession | undefined): PreparePublicationResult {
  const activation = deps.adapter.sessions.describe()
  const c = loaded.contributions.get(contributionId)
  if (!c) throw notFound('Contribution', contributionId)
  if (isModerated(c)) return { ready: false, reason: 'moderated', message: `Contribution is ${c.reason}; it cannot be published.`, activation }
  if (c.origin.kind !== 'local') return { ready: false, reason: 'external', message: 'This contribution is owned by another ATProto repository; it is already published there.', activation }
  if (c.actor.id !== actor.actorId) return { ready: false, reason: 'not-author', message: 'Only the author can publish their own contribution.', activation }
  if (!session) return { ready: false, reason: 'no-account', message: `No ATProto account is connected for ${actor.actorId}. Connect a development account (see activation) before publishing.`, activation }
  const warnings: string[] = []
  const built = build(deps, c, metadata, warnings)
  const now = deps.clock.now()
  const intent: PublicationIntent = {
    intentId: commonsIds.next('intent'), contributionId, revision: c.revision, actorId: actor.actorId,
    did: session.did, ...(session.handle ? { handle: session.handle } : {}), service: session.service,
    collection: built.collection, rkey: TID.nextStr(), payloadDigest: built.digest, record: built.record,
    createdAt: now, expiresAt: new Date(Date.parse(now) + INTENT_TTL_MS).toISOString(),
  }
  // Forget stale intents; receipts keep their own copy of what matters.
  for (const [id, old] of Object.entries(metadata.intents)) if (Date.parse(old.expiresAt) < Date.parse(now) - 24 * 3600 * 1000) delete metadata.intents[id]
  metadata.intents[intent.intentId] = intent
  const { record, ...rest } = intent
  return { ready: true, intent: rest, preview: record, warnings,
    destination: { did: intent.did, ...(intent.handle ? { handle: intent.handle } : {}), service: intent.service, collection: intent.collection, rkey: intent.rkey, uri: `at://${intent.did}/${intent.collection}/${intent.rkey}` } }
}

/** Inside a transaction: turns a still-valid intent into a queued receipt. Idempotent per contribution. */
export function enqueue(metadata: CommonsMetadata, loaded: LoadedCommons, deps: PublicationDeps, actor: ActorContext, intentId: string): PublicationReceipt {
  const intent = metadata.intents[intentId]
  if (!intent) throw notFound('Publication intent', intentId)
  if (intent.actorId !== actor.actorId) throw forbidden('This publication intent belongs to another participant.')
  const now = deps.clock.now()
  const existing = metadata.publications[intent.contributionId]
  if (existing && existing.intentId === intentId) return existing
  if (Date.parse(intent.expiresAt) < Date.parse(now)) throw conflictError('Publication intent expired; prepare it again.', { expiresAt: intent.expiresAt })
  const c = loaded.contributions.get(intent.contributionId)
  if (!c || isModerated(c)) throw conflictError('Contribution is no longer publishable.')
  if (c.revision !== intent.revision) throw conflictError('Contribution changed since the preview; prepare it again.', { revision: c.revision, previewed: intent.revision })
  const rebuilt = build(deps, c, metadata, [])
  if (rebuilt.digest !== intent.payloadDigest) throw conflictError('Payload changed since the preview; prepare it again.', { digest: rebuilt.digest, previewed: intent.payloadDigest })
  if (existing) {
    if (existing.status === 'published') return existing
    if (existing.payloadDigest === intent.payloadDigest && existing.did === intent.did) return existing
    throw conflictError('A different publication is already pending for this contribution; retry it or wait for its receipt before publishing anew.', { pending: existing })
  }
  const receipt: PublicationReceipt = {
    intentId, contributionId: intent.contributionId, revision: intent.revision, status: 'queued', did: intent.did,
    ...(intent.handle ? { handle: intent.handle } : {}), collection: intent.collection, rkey: intent.rkey,
    payloadDigest: intent.payloadDigest, attempts: 0, queuedAt: now,
  }
  metadata.publications[intent.contributionId] = receipt
  if (!metadata.outbox.includes(intentId)) metadata.outbox.push(intentId)
  return receipt
}

export interface DrainResult { attempted: number; receipts: PublicationReceipt[] }

/**
 * Processes queued/failed/interrupted receipts: marks them publishing in one
 * transaction, talks to the PDS outside any transaction, then records the
 * outcome. Interrupted `publishing` items are safe to retry because the
 * publisher reconciles by key before creating anything.
 */
export function createOutboxDrainer(repository: TransactionalEventRepository, deps: PublicationDeps) {
  let inflight: Promise<DrainResult> | null = null
  const run = async (): Promise<DrainResult> => {
    const batch = await repository.transaction(async tx => {
      const metadata = commonsMetadata(tx)
      const now = deps.clock.now()
      const loaded = loadCommons(await tx.repository.read(), metadata)
      const picked: Array<{ intent: PublicationIntent; receipt: PublicationReceipt }> = []
      for (const intentId of [...metadata.outbox]) {
        const intent = metadata.intents[intentId]
        const receipt = intent && metadata.publications[intent.contributionId]
        if (!intent || !receipt || receipt.intentId !== intentId) { metadata.outbox = metadata.outbox.filter(id => id !== intentId); continue }
        if (!['queued', 'failed', 'publishing'].includes(receipt.status)) { metadata.outbox = metadata.outbox.filter(id => id !== intentId); continue }
        // A queued write is not permanent permission to publish. Keep blocked
        // entries pending, but never contact the publisher while they are withheld.
        const contribution = loaded.contributions.get(intent.contributionId)
        if (!contribution || isModerated(contribution)) continue
        if (contribution.revision !== intent.revision || build(deps, contribution, metadata, []).digest !== intent.payloadDigest) {
          receipt.status = 'failed'
          receipt.lastError = 'Contribution changed since the publication preview; the queued payload was not sent.'
          continue
        }
        receipt.status = 'publishing'
        receipt.attempts += 1
        receipt.lastAttemptAt = now
        picked.push({ intent: structuredClone(intent), receipt: structuredClone(receipt) })
      }
      return picked
    })
    const receipts: PublicationReceipt[] = []
    for (const { intent } of batch) {
      let outcome: PublishOutcome
      try {
        const session = await deps.adapter.sessions.sessionFor(intent.actorId)
        if (!session || session.did !== intent.did || new URL(session.service).href !== new URL(intent.service).href) {
          outcome = { outcome: 'unreachable', error: 'Publication account changed since the preview; restore the previewed account before retrying.' }
        } else {
          outcome = await deps.adapter.publisher.reconcileOrCreate({ actorId: intent.actorId,
            expectedSession: { did: intent.did, service: intent.service },
            collection: intent.collection, rkey: intent.rkey, record: intent.record, digest: intent.payloadDigest })
        }
      } catch (error) {
        // A throwing session provider/transport must not strand the whole batch
        // in publishing or prevent unrelated queued contributions from settling.
        outcome = { outcome: 'unreachable', error: error instanceof Error ? error.message : String(error) }
      }
      receipts.push(await repository.transaction(async tx => {
        const metadata = commonsMetadata(tx)
        const receipt = metadata.publications[intent.contributionId]!
        const now = deps.clock.now()
        if (outcome.outcome === 'created' || outcome.outcome === 'existing') {
          Object.assign(receipt, { status: 'published', uri: outcome.uri, cid: outcome.cid, publishedAt: now })
          delete receipt.lastError
          metadata.outbox = metadata.outbox.filter(id => id !== intent.intentId)
          const previous = metadata.external[outcome.uri]
          metadata.external[outcome.uri] = {
            uri: outcome.uri, cid: outcome.cid, did: outcome.did, ...(intent.handle ? { handle: intent.handle } : {}), pdsEndpoint: intent.service,
            collection: intent.collection, rkey: intent.rkey, retrievedAt: now, availability: 'available',
            contributionId: intent.contributionId, roomId: `commons:${loadCommons(await tx.repository.read(), metadata).contributions.get(intent.contributionId)?.problemId ?? ''}`,
            selfPublicationOf: intent.contributionId,
            versions: [...(previous?.versions ?? []), ...(previous?.cid === outcome.cid ? [] : [{ cid: outcome.cid, retrievedAt: now }])],
          }
        } else if (outcome.outcome === 'conflict') {
          Object.assign(receipt, { status: 'conflict', uri: outcome.uri, cid: outcome.cid, lastError: 'A different record already exists at this key; nothing was overwritten.' })
          metadata.outbox = metadata.outbox.filter(id => id !== intent.intentId)
        } else {
          Object.assign(receipt, { status: 'failed', lastError: outcome.error })
        }
        return structuredClone(receipt)
      }))
    }
    return { attempted: batch.length, receipts }
  }
  return () => {
    if (!inflight) inflight = run().finally(() => { inflight = null })
    return inflight
  }
}

export const assertPublishable = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) throw invalid('contributionId must be a non-empty string.')
  return value
}

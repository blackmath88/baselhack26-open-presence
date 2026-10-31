/**
 * The Commons application service: one set of operations behind HTTP, CLI and
 * MCP. Writes run inside the repository's serialized transaction with durable
 * command receipts; reads fold the same log. Network I/O (ATProto) happens
 * outside transactions and is reconciled back in through receipts.
 */
import type {
  CommonsContribution, ImportedProblem, ModeratedContribution, Ref, ReviewCommand, SubmitContributionCommand, SubmitContributionCommandV2,
} from '../../src/commons/contracts.js'
import { COMMONS_SCHEMA_VERSION, SUBMIT_ENTRANCES, importedProblemSpaceId, isModerated } from '../../src/commons/contracts.js'
import type { ActorContext } from '../auth/actor-context.js'
import { hasScope, SCOPE_CONTRIBUTE, SCOPE_READ, SCOPE_REVIEW } from '../auth/actor-context.js'
import { createContributionService } from '../application/contribution-service.js'
import { createCurationService } from '../application/curation-service.js'
import { nullCurator } from '../curation/ai-curator.js'
import { conflictError, forbidden, invalid, notFound } from '../domain/errors.js'
import { assertHumanActor } from '../domain/policies.js'
import { project } from '../domain/projections.js'
import { systemClock, type Clock } from '../domain/events.js'
import type { RepositoryTransaction, TransactionalEventRepository } from '../persistence/repository.js'
import type { AtprotoAdapter } from './atproto/contract.js'
import { assertImportedProblems, commonsIds, commonsMetadata, importIntoTransaction, stableHash, type CommonsMetadata } from './import.js'
import { nullAtprotoAdapter } from './null-atproto.js'
import { DOMAIN_KIND_FOR } from './projection.js'
import { createOutboxDrainer, enqueue, prepareIntent, type PublicationDeps } from './publication.js'
import { browse, contextPacket, findContribution, loadCommons, prepareContribution, problemView, searchAll, threadView, type LoadedCommons } from './queries.js'
import { resolveExternal, syncAuthor, type IngestDeps } from './ingestion.js'
import { visibleRoomEvents } from './read-view.js'

export interface CommonsServiceOptions {
  repository: TransactionalEventRepository
  clock?: Clock
  atproto?: AtprotoAdapter
  /** Absolute base URL participants open, used for canonical links inside published records. */
  appUrl?: string
  /** Identifier this app writes into `origin.app` of records it publishes, to recognise its own records on ingestion. */
  appId?: string
}
const text = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw invalid(`${field} must be a non-empty string.`)
  return value
}
function authorize(actor: ActorContext, scope: string) {
  assertHumanActor(actor, 'access Commons')
  if (!hasScope(actor, scope)) throw forbidden(`Missing scope ${scope}.`)
}
/** Durable idempotency: same key + same input replays the first outcome (flagged), different input conflicts. */
async function command<T extends object>(tx: RepositoryTransaction, actor: ActorContext, commandId: string, input: unknown, work: () => Promise<T>): Promise<T & { replayed: boolean }> {
  text(commandId, 'commandId')
  const metadata = commonsMetadata(tx)
  const hash = stableHash({ actor: actor.actorId, input })
  const prior = metadata.commands[commandId]
  if (prior) {
    if (prior.hash !== hash) throw conflictError('commandId was already used with different input.')
    return { ...(structuredClone(prior.outcome) as T), replayed: true }
  }
  const outcome = await work()
  metadata.commands[commandId] = { hash, outcome: structuredClone(outcome) }
  return { ...outcome, replayed: false }
}
export function createCommonsService(options: CommonsServiceOptions) {
  const { repository } = options
  const clock = options.clock ?? systemClock
  const adapter = options.atproto ?? nullAtprotoAdapter
  const appUrl = (options.appUrl ?? 'http://localhost:5173').replace(/\/+$/, '')
  const appId = options.appId ?? 'open-presence-commons'
  const deps = (tx: RepositoryTransaction) => ({ repository: tx.repository, clock, ids: commonsIds, curator: nullCurator })
  const publicationDeps: PublicationDeps = { adapter, appUrl, clock }
  const ingestDeps: IngestDeps = { adapter, appId, clock }
  const drain = createOutboxDrainer(repository, publicationDeps)
  const loaded = async (tx: RepositoryTransaction): Promise<{ metadata: CommonsMetadata; loaded: LoadedCommons }> => {
    const metadata = commonsMetadata(tx)
    return { metadata, loaded: loadCommons(await tx.repository.read(), metadata) }
  }
  const read = <T>(actor: ActorContext, work: (ctx: { metadata: CommonsMetadata; loaded: LoadedCommons }) => T | Promise<T>): Promise<T> => {
    authorize(actor, SCOPE_READ)
    return repository.transaction(async tx => work(await loaded(tx)))
  }
  const toRef = (ctx: { metadata: CommonsMetadata; loaded: LoadedCommons }, problemId: string, id: string | undefined): Ref | undefined => {
    if (!id) return undefined
    const local = ctx.loaded.contributions.get(id)
    if (local) return { kind: 'local', id, ...(isModerated(local) ? {} : { revision: local.revision }) }
    const external = ctx.metadata.external[id]
    if (external) return { kind: 'atproto', uri: external.uri, cid: external.cid }
    const source = ctx.metadata.sources[problemId]
    const evidence = source?.evidence.find(e => e.source.objectId === id || `commons:${problemId}:${e.id}` === id)
    return evidence ? { kind: 'source', objectId: evidence.source.objectId, snapshotId: evidence.source.snapshotId, digest: evidence.source.digest } : undefined
  }

  return {
    async importProblems(actor: ActorContext, problems: ImportedProblem[]) {
      authorize(actor, SCOPE_CONTRIBUTE)
      assertImportedProblems(problems)
      const snapshot = structuredClone(problems)
      return repository.transaction(tx => importIntoTransaction(tx, snapshot, clock))
    },

    /** Validates and previews a contribution exactly as submit would record it. Never writes. */
    prepareContribution(actor: ActorContext, input: unknown) {
      return read(actor, ctx => prepareContribution(ctx.loaded, ctx.metadata, input))
    },

    async submitContribution(actor: ActorContext, input: SubmitContributionCommand | SubmitContributionCommandV2) {
      authorize(actor, SCOPE_CONTRIBUTE)
      if (!input || typeof input !== 'object') throw invalid('Invalid contribution command.')
      const { entrance, ...snapshot } = structuredClone(input) as SubmitContributionCommandV2
      if (entrance !== undefined && !(SUBMIT_ENTRANCES as readonly unknown[]).includes(entrance)) throw invalid(`entrance must be one of ${SUBMIT_ENTRANCES.join(', ')}.`)
      // The entrance is transport metadata: a retry through another entrance replays instead of conflicting.
      return repository.transaction(tx => command(tx, actor, snapshot.commandId, { type: 'submit', command: snapshot }, async () => {
        const postackId = text(snapshot.problemId, 'problemId')
        const ctx = await loaded(tx)
        if (!ctx.metadata.sources[postackId]) throw notFound('Imported problem', postackId)
        if (!Array.isArray(snapshot.sourceRefs) || snapshot.sourceRefs.some(s => typeof s !== 'string')) throw invalid('sourceRefs must be a string array.')
        if (snapshot.preparedBy !== undefined) text(snapshot.preparedBy, 'preparedBy')
        const prepared = prepareContribution(ctx.loaded, ctx.metadata, snapshot)
        if (!prepared.ok || !prepared.command) throw invalid(prepared.errors.join(' '), { errors: prepared.errors })
        const cmd = prepared.command
        const parent = toRef(ctx, postackId, cmd.parentId)
        const supersedes = toRef(ctx, postackId, cmd.supersedesId)
        const contradicts = toRef(ctx, postackId, cmd.contradictsId)
        const result = await createContributionService(deps(tx)).add(actor, {
          problemId: importedProblemSpaceId(postackId), content: cmd.text, kind: DOMAIN_KIND_FOR[cmd.kind ?? 'observation'],
          ...(cmd.preparedBy ? { preparedBy: cmd.preparedBy } : {}),
          source: cmd.preparedBy ? 'ai_assisted' : 'direct',
          sourceDetail: JSON.stringify({ commandId: snapshot.commandId, postackId, sourceRefs: cmd.sourceRefs, circumstances: cmd.circumstances, kind: cmd.kind }),
        })
        ctx.metadata.submissions[result.contribution.id] = {
          sourceRefs: [...cmd.sourceRefs], commandId: snapshot.commandId, kind: cmd.kind ?? 'observation', assistance: cmd.assistance ?? 'none',
          ...(cmd.circumstances !== undefined ? { circumstances: cmd.circumstances } : {}),
          ...(parent ? { parent } : {}), ...(supersedes ? { supersedes } : {}), ...(contradicts ? { contradicts } : {}),
          ...(cmd.observedAt ? { observedAt: cmd.observedAt } : {}),
          ...(entrance ? { entrance } : {}),
        }
        return { ...result, problemId: importedProblemSpaceId(postackId), contributionId: result.contribution.id, links: { app: `#/contributions/${encodeURIComponent(result.contribution.id)}` } }
      }))
    },

    async review(actor: ActorContext, input: ReviewCommand) {
      authorize(actor, SCOPE_REVIEW)
      if (!input || typeof input !== 'object') throw invalid('Invalid review command.')
      const snapshot = structuredClone(input)
      // One reason policy for every transport, applied before the receipt hash:
      // trimmed, blank means absent, at most 1000 characters.
      if (snapshot.reason !== undefined) {
        if (typeof snapshot.reason !== 'string') throw invalid('reason must be a string.')
        const reason = snapshot.reason.trim()
        if (reason.length > 1000) throw invalid('reason must be at most 1000 characters.')
        if (reason) snapshot.reason = reason
        else delete snapshot.reason
      }
      if (snapshot.problemId !== undefined) text(snapshot.problemId, 'problemId')
      return repository.transaction(tx => command(tx, actor, snapshot.commandId, { type: 'review', command: snapshot }, async () => {
        text(snapshot.proposalId, 'proposalId')
        if (!['accept', 'reject'].includes(snapshot.decision)) throw invalid('decision must be accept or reject.')
        if (snapshot.expectedVersion !== undefined && (!Number.isInteger(snapshot.expectedVersion) || snapshot.expectedVersion < 0)) throw invalid('expectedVersion must be a nonnegative integer.')
        const all = await tx.repository.read()
        const proposed = all.find(e => e.objectId === snapshot.proposalId && (e.eventType === 'RelationProposed' || e.eventType === 'ConflictProposed'))
        if (!proposed) throw notFound('Proposal', snapshot.proposalId)
        // The caller names the room it is reviewing in; never act on a proposal in another room.
        if (snapshot.problemId !== undefined && snapshot.problemId !== proposed.problemId) throw notFound('Proposal', `${snapshot.proposalId} in ${snapshot.problemId}`)
        const events = all.filter(e => e.problemId === proposed.problemId)
        const state = project(events)
        const proposal = state?.proposals.find(p => p.id === snapshot.proposalId)
        if (!proposal) throw notFound('Proposal', snapshot.proposalId)
        if (proposal.status !== 'pending') throw conflictError('Proposal has already been reviewed.', { status: proposal.status })
        if (snapshot.expectedVersion !== undefined && snapshot.expectedVersion !== events.length) throw conflictError('Room version changed.', { version: events.length })
        const curation = createCurationService(deps(tx))
        return snapshot.decision === 'reject'
          ? curation.reject(actor, { problemId: proposed.problemId, proposalId: snapshot.proposalId, ...(snapshot.reason !== undefined ? { reason: snapshot.reason } : {}) })
          : curation.accept(actor, { problemId: proposed.problemId, proposalId: snapshot.proposalId })
      }))
    },

    /**
     * A free-form contribution to an imported room (the room's own "Add a thought").
     * Runs the existing contribution service inside the same serialized transaction
     * as Commons commands, so it validates and appends against current state.
     */
    async addToRoom(actor: ActorContext, input: Parameters<ReturnType<typeof createContributionService>['add']>[1], commandId?: string) {
      authorize(actor, SCOPE_CONTRIBUTE)
      if (!input.problemId.startsWith('commons:')) throw invalid('Not a Commons room.')
      const snapshot = structuredClone(input)
      return repository.transaction(tx => {
        const work = () => createContributionService(deps(tx)).add(actor, snapshot)
        // With a key, a retried post replays its first outcome; the same key with other content conflicts.
        return commandId === undefined ? work() : command(tx, actor, commandId, { type: 'add', input: snapshot }, work)
      })
    },

    async getRoom(actor: ActorContext, id: string) {
      authorize(actor, SCOPE_READ)
      return repository.transaction(async tx => {
        const roomId = id.startsWith('commons:') ? id : importedProblemSpaceId(id)
        const allHistory = await tx.repository.read()
        const rawHistory = allHistory.filter(e => e.problemId === roomId)
        const metadata = commonsMetadata(tx)
        const history = visibleRoomEvents(allHistory, metadata).filter(e => e.problemId === roomId)
        const state = project(history)
        if (!state) throw notFound('Room', id)
        const source = metadata.sources[roomId.slice('commons:'.length)]
        const edgeProvenance = (proposalId?: string) => proposalId && metadata.edges[proposalId]
          ? metadata.edges[proposalId] : { origin: 'machine-proposal' as const, evidenceIds: [] }
        return {
          ...state, version: rawHistory.length, history, source: source ? structuredClone(source) : null,
          proposals: state.proposals.map(p => ({ ...p, ...edgeProvenance(p.id) })),
          relations: state.relations.map(r => ({ ...r, ...edgeProvenance(r.fromProposalId), reviewedBy: r.createdBy })),
          contributions: state.contributions.map(c => ({ ...c, submission: metadata.submissions[c.id] ?? null })),
        }
      })
    },

    // --- multi-entry reads -------------------------------------------------
    search(actor: ActorContext, input: { query: string; limit?: number; include?: Array<'problems' | 'contributions'> }) {
      text(input?.query, 'query')
      return read(actor, ctx => searchAll(ctx.loaded, ctx.metadata, input))
    },
    browseRepository(actor: ActorContext, input: Parameters<typeof browse>[2] = {}) {
      return read(actor, ctx => browse(ctx.loaded, ctx.metadata, input))
    },
    getProblem(actor: ActorContext, id: string) {
      return read(actor, ctx => problemView(ctx.loaded, ctx.metadata, text(id, 'problemId')))
    },
    getContribution(actor: ActorContext, id: string): Promise<(CommonsContribution | ModeratedContribution) & { problemTitle?: string }> {
      return read(actor, ctx => {
        const c = findContribution(ctx.loaded, text(id, 'contributionId'))
        const title = ctx.metadata.sources[c.problemId]?.title
        return { ...c, ...(title ? { problemTitle: title } : {}) }
      })
    },
    getThread(actor: ActorContext, id: string) {
      return read(actor, ctx => threadView(ctx.loaded, ctx.metadata, text(id, 'contributionId')))
    },
    getContext(actor: ActorContext, input: { problemId?: string; contributionId?: string; budget?: number }) {
      return read(actor, ctx => contextPacket(ctx.loaded, ctx.metadata, input, clock.now()))
    },
    listProblems(actor: ActorContext) {
      return read(actor, ctx => Object.values(ctx.metadata.sources).map(p => ({
        problemId: p.postackId, title: p.title, status: p.status, device: p.device, environment: p.environment,
        roomId: importedProblemSpaceId(p.postackId), contributions: (ctx.loaded.byRoom.get(importedProblemSpaceId(p.postackId)) ?? []).length,
        link: `#/problems/${encodeURIComponent(p.postackId)}`,
      })))
    },
    status(actor: ActorContext) {
      return read(actor, ctx => {
        const receipts = Object.values(ctx.metadata.publications)
        const count = (s: string) => receipts.filter(r => r.status === s).length
        return {
          schemaVersion: COMMONS_SCHEMA_VERSION, appUrl, appId,
          atproto: adapter.describe(),
          publications: { queued: count('queued') + count('publishing'), published: count('published'), failed: count('failed'), conflict: count('conflict'), outbox: ctx.metadata.outbox.length },
          sync: Object.values(ctx.metadata.sync).map(({ seenUris: _seen, ...s }) => s),
          external: { observed: Object.keys(ctx.metadata.external).length, unresolved: Object.values(ctx.metadata.external).filter(o => o.unresolvedProblem).length, invalid: Object.values(ctx.metadata.external).filter(o => o.availability === 'invalid').length },
          moderation: { hidden: Object.keys(ctx.metadata.moderation.hidden).length, blockedAuthors: Object.keys(ctx.metadata.moderation.blockedAuthors).length },
          problems: Object.keys(ctx.metadata.sources).length,
        }
      })
    },

    // --- local moderation (affects every projection) ------------------------
    async moderate(actor: ActorContext, input: { commandId: string; contributionId?: string; authorId?: string; action: 'hide' | 'unhide' | 'block' | 'unblock'; reason?: string }) {
      authorize(actor, SCOPE_REVIEW)
      const snapshot = structuredClone(input)
      return repository.transaction(tx => command(tx, actor, snapshot.commandId, { type: 'moderate', command: snapshot }, async () => {
        const ctx = await loaded(tx)
        const now = clock.now()
        const entry = { by: actor.actorId, at: now, ...(snapshot.reason ? { reason: snapshot.reason } : {}) }
        if (snapshot.action === 'hide' || snapshot.action === 'unhide') {
          const id = text(snapshot.contributionId, 'contributionId')
          if (!ctx.loaded.contributions.has(id)) throw notFound('Contribution', id)
          if (snapshot.action === 'hide') ctx.metadata.moderation.hidden[id] = entry
          else delete ctx.metadata.moderation.hidden[id]
          return { contributionId: id, hidden: snapshot.action === 'hide', by: actor.actorId, at: now }
        }
        const authorId = text(snapshot.authorId, 'authorId')
        if (snapshot.action === 'block') ctx.metadata.moderation.blockedAuthors[authorId] = entry
        else delete ctx.metadata.moderation.blockedAuthors[authorId]
        return { authorId, blocked: snapshot.action === 'block', by: actor.actorId, at: now }
      }))
    },

    // --- publication -----------------------------------------------------------
    async preparePublication(actor: ActorContext, input: { contributionId: string }) {
      authorize(actor, SCOPE_CONTRIBUTE)
      const contributionId = text(input?.contributionId, 'contributionId')
      // Network (login) happens before the transaction, never inside it.
      const session = await adapter.sessions.sessionFor(actor.actorId)
      return repository.transaction(async tx => {
        const ctx = await loaded(tx)
        return prepareIntent(ctx.metadata, ctx.loaded, publicationDeps, actor, contributionId, session)
      })
    },
    async publishContribution(actor: ActorContext, input: { intentId: string }) {
      authorize(actor, SCOPE_CONTRIBUTE)
      const intentId = text(input?.intentId, 'intentId')
      const queued = await repository.transaction(async tx => {
        const ctx = await loaded(tx)
        return enqueue(ctx.metadata, ctx.loaded, publicationDeps, actor, intentId)
      })
      if (queued.status === 'published' || queued.status === 'conflict') return { receipt: queued, drained: 0 }
      const result = await drain()
      const receipt = await repository.transaction(async tx => structuredClone(commonsMetadata(tx).publications[queued.contributionId] ?? queued))
      return { receipt, drained: result.attempted }
    },
    /** Re-attempts everything still in the outbox (also run at boot). Returns the receipts touched. */
    async retryPublications(actor?: ActorContext) {
      if (actor) authorize(actor, SCOPE_CONTRIBUTE)
      return drain()
    },
    getPublication(actor: ActorContext, contributionId: string) {
      return read(actor, ctx => {
        const id = text(contributionId, 'contributionId')
        if (!ctx.loaded.contributions.has(id)) throw notFound('Contribution', id)
        return { contributionId: id, receipt: ctx.metadata.publications[id] ?? null, observed: Object.values(ctx.metadata.external).filter(o => o.contributionId === id).map(({ ...o }) => o) }
      })
    },

    // --- ingestion ---------------------------------------------------------------
    async syncAuthor(actor: ActorContext, input: { did: string; maxPages?: number }) {
      authorize(actor, SCOPE_CONTRIBUTE)
      return syncAuthor(repository, ingestDeps, text(input?.did, 'did'), { ...(input.maxPages ? { maxPages: input.maxPages } : {}) })
    },
    async resolveExternal(actor: ActorContext, input: { uri: string }) {
      authorize(actor, SCOPE_CONTRIBUTE)
      const uri = text(input?.uri, 'uri')
      if (!uri.startsWith('at://')) throw invalid('uri must be an at:// URI.')
      return resolveExternal(repository, ingestDeps, uri)
    },
    /** Startup hook: bounded sync of configured opt-in authors, best effort, never throws. */
    async bootstrap(options: { follow: string[]; retry?: boolean }) {
      const report: Array<{ did: string; status: string; records: number; error?: string }> = []
      if (options.retry !== false) await drain().catch(error => console.error('[commons] outbox retry failed:', error))
      for (const did of options.follow) {
        try {
          const r = await syncAuthor(repository, ingestDeps, did, { maxPages: 5 })
          report.push({ did: r.did, status: r.status, records: r.records, ...(r.error ? { error: r.error } : {}) })
        } catch (error) {
          report.push({ did, status: 'failed', records: 0, error: error instanceof Error ? error.message : String(error) })
        }
      }
      return report
    },
  }
}
export type CommonsService = ReturnType<typeof createCommonsService>

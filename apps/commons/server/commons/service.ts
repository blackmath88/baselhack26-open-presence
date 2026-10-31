import type { ImportedProblem, ReviewCommand, SubmitContributionCommand } from '../../src/commons/contracts.js'
import { importedProblemSpaceId } from '../../src/commons/contracts.js'
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
import { assertImportedProblems, commonsIds, commonsMetadata, importIntoTransaction, stableHash } from './import.js'

export interface CommonsServiceOptions { repository: TransactionalEventRepository; clock?: Clock }
const text = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw invalid(`${field} must be a non-empty string.`)
  return value
}
function authorize(actor: ActorContext, scope: string) {
  assertHumanActor(actor, 'access Commons')
  if (!hasScope(actor, scope)) throw forbidden(`Missing scope ${scope}.`)
}
async function command<T>(tx: RepositoryTransaction, actor: ActorContext, commandId: string, input: unknown, work: () => Promise<T>): Promise<T> {
  text(commandId, 'commandId')
  const metadata = commonsMetadata(tx)
  const hash = stableHash({ actor: actor.actorId, input })
  const prior = metadata.commands[commandId]
  if (prior) {
    if (prior.hash !== hash) throw conflictError('commandId was already used with different input.')
    return structuredClone(prior.outcome) as T
  }
  const outcome = await work()
  metadata.commands[commandId] = { hash, outcome: structuredClone(outcome) }
  return outcome
}
export function createCommonsService(options: CommonsServiceOptions) {
  const { repository } = options
  const clock = options.clock ?? systemClock
  const deps = (tx: RepositoryTransaction) => ({ repository: tx.repository, clock, ids: commonsIds, curator: nullCurator })
  return {
    async importProblems(actor: ActorContext, problems: ImportedProblem[]) {
      authorize(actor, SCOPE_CONTRIBUTE)
      assertImportedProblems(problems)
      const snapshot = structuredClone(problems)
      return repository.transaction(tx => importIntoTransaction(tx, snapshot, clock))
    },
    async submitContribution(actor: ActorContext, input: SubmitContributionCommand) {
      authorize(actor, SCOPE_CONTRIBUTE)
      if (!input || typeof input !== 'object') throw invalid('Invalid contribution command.')
      const snapshot = structuredClone(input)
      return repository.transaction(tx => command(tx, actor, snapshot.commandId, { type: 'submit', command: snapshot }, async () => {
        const postackId = text(snapshot.problemId, 'problemId')
        text(snapshot.text, 'text')
        if (!Array.isArray(snapshot.sourceRefs) || snapshot.sourceRefs.some(s => typeof s !== 'string')) throw invalid('sourceRefs must be a string array.')
        if (snapshot.circumstances !== undefined) text(snapshot.circumstances, 'circumstances')
        if (snapshot.preparedBy !== undefined) text(snapshot.preparedBy, 'preparedBy')
        const metadata = commonsMetadata(tx)
        const source = metadata.sources[postackId]
        if (!source) throw notFound('Imported problem', postackId)
        const known = new Set(source.evidence.map(e => e.source.objectId))
        if (snapshot.sourceRefs.some(s => !known.has(s))) throw invalid('Source reference does not belong to this problem.')
        const result = await createContributionService(deps(tx)).add(actor, {
          problemId: importedProblemSpaceId(postackId), content: snapshot.text,
          ...(snapshot.preparedBy ? { preparedBy: snapshot.preparedBy } : {}),
          source: snapshot.preparedBy ? 'ai_assisted' : 'direct',
          sourceDetail: JSON.stringify({ commandId: snapshot.commandId, postackId, sourceRefs: snapshot.sourceRefs, circumstances: snapshot.circumstances }),
        })
        metadata.submissions[result.contribution.id] = {
          sourceRefs: [...snapshot.sourceRefs], commandId: snapshot.commandId,
          ...(snapshot.circumstances !== undefined ? { circumstances: snapshot.circumstances } : {}),
        }
        return result
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
        const history = await tx.repository.read(roomId)
        const state = project(history)
        if (!state) throw notFound('Room', id)
        const metadata = commonsMetadata(tx)
        const source = metadata.sources[roomId.slice('commons:'.length)]
        const edgeProvenance = (proposalId?: string) => proposalId && metadata.edges[proposalId]
          ? metadata.edges[proposalId] : { origin: 'machine-proposal' as const, evidenceIds: [] }
        return {
          ...state, version: history.length, history, source: source ? structuredClone(source) : null,
          proposals: state.proposals.map(p => ({ ...p, ...edgeProvenance(p.id) })),
          relations: state.relations.map(r => ({ ...r, ...edgeProvenance(r.fromProposalId), reviewedBy: r.createdBy })),
          contributions: state.contributions.map(c => ({ ...c, submission: metadata.submissions[c.id] ?? null })),
        }
      })
    },
  }
}
export type CommonsService = ReturnType<typeof createCommonsService>

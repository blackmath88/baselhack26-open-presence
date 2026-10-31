/** Normal-reader projection only. The durable event log is never redacted or rewritten. */
import type { MemoryEvent } from '../domain/events.js'
import type { EventRepository, TransactionalEventRepository } from '../persistence/repository.js'
import { isModerated } from '../../src/commons/contracts.js'
import { commonsMetadata, type CommonsMetadata } from './import.js'
import { loadCommons } from './queries.js'

const referenceKeys = new Set(['sourceId', 'targetId', 'leftObjectId', 'rightObjectId', 'proposalId', 'fromProposalId', 'supersededBy'])

function referencesWithheld(value: unknown, withheld: Set<string>): boolean {
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(([key, item]) =>
    (referenceKeys.has(key) && typeof item === 'string' && withheld.has(item)) ||
    (typeof item === 'object' && referencesWithheld(item, withheld)))
}

/** Also withhold dependent proposals/reviews/relations: their reasons can quote the hidden text. */
export function visibleRoomEvents(events: MemoryEvent[], metadata: CommonsMetadata): MemoryEvent[] {
  const withheld = new Set([...loadCommons(events, metadata).contributions.values()].filter(isModerated).map(c => c.id))
  if (!withheld.size) return events
  let changed: boolean
  do {
    changed = false
    for (const event of events) {
      if (!event.problemId.startsWith('commons:') || withheld.has(event.objectId)) continue
      if (referencesWithheld(event.payload, withheld)) { withheld.add(event.objectId); changed = true }
    }
  } while (changed)
  return events.filter(e => !e.problemId.startsWith('commons:') || !withheld.has(e.objectId))
}

/** All inherited read services use the same transactional moderation snapshot. Never use for commands. */
export function createModerationAwareReads(repository: TransactionalEventRepository): EventRepository {
  return {
    async append() { throw new Error('The moderation-aware read repository cannot append events.') },
    read: problemId => repository.transaction(async tx => {
      const events = visibleRoomEvents(await tx.repository.read(), commonsMetadata(tx))
      return problemId ? events.filter(e => e.problemId === problemId) : events
    }),
  }
}

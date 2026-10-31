/** Ordinary reads must never fold withheld bodies or their derived proposals.
 * The durable event log remains untouched. Apply the filter before projection,
 * so compact labels, updates and orchestration candidates cannot recover text.
 */
import type { MemoryEvent } from '../domain/events.js'
import type { EventRepository, TransactionalEventRepository } from '../persistence/repository.js'
import { commonsMetadata, type CommonsMetadata } from './import.js'

export function withheldIds(events: MemoryEvent[], metadata: CommonsMetadata): Set<string> {
  const ids = new Set(Object.keys(metadata.moderation.hidden))
  for (const e of events) {
    if (e.eventType !== 'ContributionAdded') continue
    const provenance = e.payload.provenance as { authoredBy?: string } | undefined
    if (provenance?.authoredBy && metadata.moderation.blockedAuthors[provenance.authoredBy]) ids.add(e.objectId)
  }
  for (const o of Object.values(metadata.external)) {
    if (o.contributionId && (o.availability === 'deleted' || o.availability === 'invalid')) ids.add(o.contributionId)
  }
  return ids
}

export function withheldObjectIds(events: MemoryEvent[], metadata: CommonsMetadata): Set<string> {
  const withheld = withheldIds(events, metadata)
  if (!withheld.size) return withheld
  // Close over dependent proposals, accepted edges, evaluations and their events.
  // Restrict dependency fields to ids; arbitrary text is never interpreted as an id.
  const fields = ['sourceId', 'targetId', 'leftObjectId', 'rightObjectId', 'proposalId', 'fromProposalId', 'supersededBy']
  let changed = true
  while (changed) {
    changed = false
    for (const e of events) {
      if (!e.problemId.startsWith('commons:') || withheld.has(e.objectId)) continue
      if (fields.some(f => typeof e.payload[f] === 'string' && withheld.has(e.payload[f] as string))) {
        withheld.add(e.objectId); changed = true
      }
    }
  }
  return withheld
}

export function visibleEvents(events: MemoryEvent[], metadata: CommonsMetadata): MemoryEvent[] {
  const withheld = withheldObjectIds(events, metadata)
  return events.filter(e => !e.problemId.startsWith('commons:') || !withheld.has(e.objectId))
}

/** Receipts can contain full contribution/proposal snapshots from before moderation. */
export function referencesWithheld(value: unknown, withheld: Set<string>): boolean {
  if (typeof value === 'string') return withheld.has(value)
  if (Array.isArray(value)) return value.some(v => referencesWithheld(v, withheld))
  return !!value && typeof value === 'object' && Object.values(value).some(v => referencesWithheld(v, withheld))
}

/** Read-only port used by ordinary legacy readers, never by command validation. */
export function commonsReadRepository(repository: TransactionalEventRepository): EventRepository {
  return {
    append: () => { throw new Error('Cannot append through the Commons read boundary.') },
    read: problemId => repository.transaction(async tx => visibleEvents(await tx.repository.read(problemId), commonsMetadata(tx))),
  }
}

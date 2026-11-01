/** Receipt replay must not recover bodies saved before moderation. */
import type { MemoryEvent } from '../domain/events.js'
import type { CommonsMetadata } from './import.js'
import { visibleRoomEvents } from './read-view.js'

export function withheldObjectIds(events: MemoryEvent[], metadata: CommonsMetadata): Set<string> {
  const visible = new Set(visibleRoomEvents(events, metadata).map(e => e.id))
  return new Set(events.filter(e => !visible.has(e.id)).map(e => e.objectId))
}

export function referencesWithheld(value: unknown, withheld: Set<string>): boolean {
  if (typeof value === 'string') return withheld.has(value)
  if (Array.isArray(value)) return value.some(v => referencesWithheld(v, withheld))
  return !!value && typeof value === 'object' && Object.values(value).some(v => referencesWithheld(v, withheld))
}

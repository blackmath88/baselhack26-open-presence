/**
 * What leaves the browser on submit. The body is the server's prepared command, unchanged,
 * plus the draft id as idempotency key and the entrance, so the request matches the preview
 * field for field. The "not included" list names private material that is in this browser
 * but not in that body: search words and other drafts are checked against the body; history
 * and chat are never part of a command by construction.
 */
import type { PreparedContribution } from './api'
import type { DraftV2 } from './drafts'

export type OutgoingCommand = NonNullable<PreparedContribution['command']> & { commandId: string; entrance: 'browser' }

export function outgoingCommand(prepared: PreparedContribution, draftId: string): OutgoingCommand | undefined {
  if (!prepared.ok || !prepared.command) return undefined
  return { ...prepared.command, commandId: draftId, entrance: 'browser' }
}

export interface NotIncluded { label: string; detail?: string }

/** Private material present in this browser that the outgoing body does not contain. */
export function notIncluded(body: OutgoingCommand, local: { query?: string; otherDrafts: DraftV2[] }): NotIncluded[] {
  const sent = JSON.stringify(body).toLowerCase()
  const out: NotIncluded[] = []
  const q = local.query?.trim()
  if (q && !sent.includes(q.toLowerCase())) out.push({ label: 'Your search words', detail: `“${q}”` })
  const others = local.otherDrafts.filter((d) => !sent.includes(d.text.trim().toLowerCase()))
  if (others.length) out.push({ label: `Your other draft${others.length === 1 ? '' : 's'} in this browser`, detail: `${others.length}` })
  out.push({ label: 'Browser history, chat and the record pages you opened' })
  return out
}

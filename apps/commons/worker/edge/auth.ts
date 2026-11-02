import type { ActorContext } from '../../server/auth/actor-context.js'
import { SCOPE_READ, SCOPE_CONTRIBUTE, SCOPE_REVIEW } from '../../server/auth/actor-context.js'
import { unauthorized } from '../../server/domain/errors.js'
import type { PrototypeAuth } from '../../server/auth/prototype-auth.js'
import type { Database } from './d1-repository.js'
export const publicActor: ActorContext = { actorId: 'person:public-reader', displayName: 'Public reader', scopes: [SCOPE_READ] }
export async function tokenHash(token: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))), x => x.toString(16).padStart(2, '0')).join('')
}
export function createEdgeAuth(db: Database): PrototypeAuth {
  const disabled = (): never => { throw unauthorized('Prototype participant issuance is disabled.') }
  return {
    issue: disabled, issueStable: disabled, revoke: disabled, participants: () => [],
    async verify(token) {
      if (token === 'public') return structuredClone(publicActor)
      if (token.length < 32 || token.length > 256) throw unauthorized('Invalid contributor access code.')
      const row = await db.prepare('SELECT actor_id, display_name, can_review FROM contributor_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > ?')
        .bind(await tokenHash(token), new Date().toISOString()).first<{ actor_id: string; display_name: string; can_review: number }>()
      if (!row || !row.actor_id.startsWith('person:') || row.actor_id === publicActor.actorId) throw unauthorized('Unknown, revoked or expired contributor access code.')
      return { actorId: row.actor_id, displayName: row.display_name, scopes: [SCOPE_READ, SCOPE_CONTRIBUTE, ...(row.can_review ? [SCOPE_REVIEW] : [])] }
    },
  }
}

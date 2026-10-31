/** The adapter used when no ATProto configuration exists: every operation reports that state, nothing pretends. */
import type { AtprotoAdapter } from './atproto/contract.js'
import { invalid } from '../domain/errors.js'

export const NOT_CONFIGURED = 'ATProto is not configured on this server (set COMMONS_ATPROTO_ACCOUNTS / COMMONS_ATPROTO_ALLOWED_PDS; see DEMO.md).'

export const nullAtprotoAdapter: AtprotoAdapter = {
  namespace: { authority: 'test.openpresence.commons', contributionCollection: 'test.openpresence.commons.contribution' },
  buildRecord: () => { throw invalid(NOT_CONFIGURED) },
  parseRecord: () => ({ ok: false, reason: NOT_CONFIGURED }),
  sessions: {
    sessionFor: async () => undefined,
    describe: () => ({ mode: 'none', configured: [], note: NOT_CONFIGURED }),
  },
  publisher: { reconcileOrCreate: async () => ({ outcome: 'unreachable', error: NOT_CONFIGURED }) },
  reader: {
    resolveIdentity: async () => ({ refused: NOT_CONFIGURED }),
    getRecord: async () => ({ status: 'refused', reason: NOT_CONFIGURED }),
    listRecords: async () => ({ status: 'refused', reason: NOT_CONFIGURED }),
  },
  describe: () => ({ namespace: 'test.openpresence.commons', allowedPds: [], sessions: { mode: 'none', configured: [], note: NOT_CONFIGURED } }),
}

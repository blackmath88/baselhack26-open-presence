/** Shared runtime inputs: service validation and MCP discovery use the same shapes.
 * Unknown identity fields are stripped; authorization always comes from the session.
 */
import * as z from 'zod/v4'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS } from '../../src/commons/contracts.js'
import { invalid } from '../domain/errors.js'

const id = z.string().min(1).refine(value => value.trim().length > 0, 'Must not be blank')
const contributionInput = z.object({
    problemId: id,
    text: id.max(8000),
    kind: z.enum(COMMONS_CONTRIBUTION_KINDS).optional(),
    circumstances: z.string().max(2000).optional(),
    sourceRefs: z.array(z.string()).max(50).optional().describe('objectIds from the problem evidence, e.g. issue/99'),
    assistance: z.enum(ASSISTANCE_DECLARATIONS).optional(),
    preparedBy: id.max(200).optional().describe('Model or agent that drafted the text.'),
    parentId: id.optional().describe('Reply target: a contribution id or an ingested at:// URI in the same problem.'),
    supersedesId: id.optional(),
    contradictsId: id.optional(),
    observedAt: z.string().optional(),
  })

export const operationSchemas = {
  search: z.object({ query: id.max(500), limit: z.number().int().min(1).max(50).optional(), include: z.array(z.enum(['problems', 'contributions'])).optional() }),
  browse_repository: z.object({ path: z.string().max(500).optional(), object: z.string().max(100).optional().describe('e.g. issue/99, pull/113'), type: z.enum(['issue', 'pull', 'discussion']).optional(), cursor: z.string().optional(), limit: z.number().int().min(1).max(200).optional(), linkedOnly: z.boolean().optional() }),
  list_problems: z.object({}),
  get_problem: z.object({ problemId: id }),
  get_contribution: z.object({ contributionId: id }),
  get_thread: z.object({ contributionId: id }),
  get_context: z.object({ problemId: id.optional(), contributionId: id.optional(), budget: z.number().int().min(1000).max(60000).optional() }),
  prepare_contribution: contributionInput.extend({ commandId: id.max(200).optional() }),
  submit_contribution: contributionInput.extend({ commandId: id.max(200) }),
  moderate: z.object({ commandId: id.max(200), action: z.enum(['hide', 'unhide', 'block', 'unblock']), contributionId: id.optional(), authorId: id.optional(), reason: z.string().max(1000).optional() }),
  prepare_publication: z.object({ contributionId: id }),
  publish_contribution: z.object({ intentId: id }),
  get_publication: z.object({ contributionId: id }),
  sync_author: z.object({ did: id.describe('DID or handle'), maxPages: z.number().int().min(1).max(100).optional() }),
  resolve_external: z.object({ uri: id.startsWith('at://') }),
  status: z.object({}),
  review: z.object({ commandId: id.max(200), proposalId: id, problemId: id.optional(), decision: z.enum(['accept', 'reject']), reason: z.string().max(1000).optional(), expectedVersion: z.number().int().min(0).optional() }),
} as const

/** Keep exact optional service types, and never coerce wrong JSON types. */
export function parseOperation<T>(name: keyof typeof operationSchemas, input: T): T {
  const parsed = operationSchemas[name].safeParse(input)
  if (!parsed.success) throw invalid(parsed.error.issues.map(i => `${i.path.join('.') || 'input'}: ${i.message}`).join(' '))
  return Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined)) as T
}

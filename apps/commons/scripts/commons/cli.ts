#!/usr/bin/env -S node --import tsx
/**
 * `commons` CLI — the agent/terminal entrance. Talks to the running local
 * server over HTTP so it shares the same services, identity and data as the
 * UI and MCP. JSON on stdout, errors as JSON on stderr, meaningful exit codes:
 *   0 ok · 2 usage/validation · 3 conflict · 4 forbidden/not ready · 5 not found · 6 server unreachable · 1 other
 *
 * Identity: BRAINSTORM_TOKEN (a session token the server issued) or, for the
 * local prototype, BRAINSTORM_PARTICIPANT=<Achim|Kai|Lea|Mara> which mints one
 * through the dev sign-in route. Never a self-declared actor in a request body.
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const API = (process.env.COMMONS_API ?? process.env.BRAINSTORM_API ?? 'http://127.0.0.1:8787').replace(/\/+$/, '')

type Flags = Record<string, string | boolean | string[]>
function parseArgs(argv: string[]): { positional: string[]; flags: Flags } {
  const positional: string[] = []
  const flags: Flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { positional.push(a); continue }
    const [key, inline] = a.slice(2).split(/=(.*)/s)
    const value = inline ?? (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : true)
    if (key === 'evidence') { flags.evidenceIds = [...((flags.evidenceIds as string[] | undefined) ?? []), String(value)]; continue }
    if (key === 'ref' || key === 'source-ref') { flags.sourceRefs = [...((flags.sourceRefs as string[] | undefined) ?? []), String(value)]; continue }
    flags[key] = flags[key] !== undefined && typeof flags[key] === 'string' ? [flags[key] as string, String(value)] : value
  }
  return { positional, flags }
}

class CliError extends Error { constructor(readonly exit: number, message: string, readonly body?: unknown) { super(message) } }

async function token(): Promise<string> {
  if (process.env.BRAINSTORM_TOKEN) return process.env.BRAINSTORM_TOKEN
  const participant = process.env.BRAINSTORM_PARTICIPANT
  if (!participant) throw new CliError(2, 'Set BRAINSTORM_TOKEN=<session token> or BRAINSTORM_PARTICIPANT=<Achim|Kai|Lea|Mara>.')
  const res = await call('POST', '/api/auth/session', { participantId: participant }, null)
  return (res as { token: string }).token
}

async function call(method: string, path: string, body: unknown, auth: string | null): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${API}${path}`, {
      method, headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (error) {
    throw new CliError(6, `Cannot reach ${API}: ${error instanceof Error ? error.message : String(error)}. Is \`npm run dev:server\` running?`)
  }
  const text = await response.text()
  let payload: unknown = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) {
    const code = (payload as { error?: string }).error
    const exit = response.status === 409 ? 3 : response.status === 403 || response.status === 401 ? 4 : response.status === 404 ? 5 : response.status === 422 ? 2 : 1
    throw new CliError(exit, `${method} ${path} → HTTP ${response.status} ${code ?? ''}`.trim(), payload)
  }
  return payload
}

const q = (params: Record<string, string | number | boolean | undefined>) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== false && v !== '') s.set(k, String(v))
  const str = s.toString()
  return str ? `?${str}` : ''
}
const flagStr = (flags: Flags, key: string): string | undefined => (typeof flags[key] === 'string' ? (flags[key] as string) : undefined)
const flagNum = (flags: Flags, key: string): number | undefined => {
  if (flags[key] === undefined) return undefined
  const value = flagStr(flags, key)
  if (value === undefined || !value.trim() || !Number.isFinite(Number(value))) throw new CliError(2, `--${key} needs a finite number.`)
  return Number(value)
}

function draftFromFlags(flags: Flags): Record<string, unknown> {
  const file = flagStr(flags, 'file')
  let base: Record<string, unknown> = {}
  if (file) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'))
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected a JSON object.')
      base = parsed as Record<string, unknown>
    } catch (error) { throw new CliError(2, `Invalid draft file: ${error instanceof Error ? error.message : String(error)}`) }
  }
  const set = (key: string, value: unknown) => { if (value !== undefined) base[key] = value }
  set('problemId', flagStr(flags, 'problem') ?? flagStr(flags, 'problemId'))
  set('text', flagStr(flags, 'text'))
  set('kind', flagStr(flags, 'kind'))
  set('circumstances', flagStr(flags, 'circumstances'))
  set('assistance', flagStr(flags, 'assistance'))
  set('preparedBy', flagStr(flags, 'prepared-by'))
  set('parentId', flagStr(flags, 'parent'))
  set('supersedesId', flagStr(flags, 'supersedes'))
  set('contradictsId', flagStr(flags, 'contradicts'))
  set('observedAt', flagStr(flags, 'observed-at'))
  set('commandId', flagStr(flags, 'command-id'))
  if (flags.sourceRefs) base.sourceRefs = flags.sourceRefs
  if (flags.evidenceIds) base.evidenceIds = flags.evidenceIds
  return base
}

const USAGE = `commons — the Photo Frame Commons from the terminal (JSON out)

  commons search <query> [--limit n] [--include problems,contributions]
  commons browse [path] [--object issue/99] [--threads issue|pull|discussion] [--cursor c] [--linked]
  commons problems
  commons inspect <problemId | contributionId>
  commons thread <contributionId>
  commons context <problemId | contributionId> [--budget chars]
  commons draft --problem <id> --text "..." [--kind observation|question|attempt|outcome|correction]
                [--circumstances "..."] [--ref objectId ...] [--evidence e2 ...] [--parent id] [--assistance none|ai-assisted|ai-drafted]
                [--prepared-by name] [--command-id id]        → validates; prints the exact command; writes nothing
  commons submit (--file draft.json | draft flags) [--command-id id]   → records it in the local shared room
  commons publish <contributionId> [--yes]       → preview the ATProto record; --yes publishes through the outbox
  commons publication <contributionId> · commons retry-publications
  commons sync <did|handle> [--max-pages n] · commons resolve <at://uri>
  commons moderate hide|unhide <contributionId> [--reason r] · commons moderate block|unblock <authorId>
  commons status

Env: COMMONS_API (default http://127.0.0.1:8787), BRAINSTORM_TOKEN or BRAINSTORM_PARTICIPANT.`

async function main(argv: string[]): Promise<number> {
  const { positional, flags } = parseArgs(argv)
  const [cmd, ...rest] = positional
  if (!cmd || cmd === 'help' || flags.help) { console.log(USAGE); return 0 }
  const t = await token()
  const get = (path: string) => call('GET', path, undefined, t)
  const post = (path: string, body: unknown) => call('POST', path, body, t)
  let out: unknown
  let exit = 0
  switch (cmd) {
    case 'search': {
      if (!rest.length) throw new CliError(2, 'search needs a query.')
      out = await get(`/api/commons/search${q({ q: rest.join(' '), limit: flagNum(flags, 'limit'), include: flagStr(flags, 'include') })}`)
      break
    }
    case 'browse': out = await get(`/api/commons/repository${q({ path: rest[0], object: flagStr(flags, 'object'), type: flagStr(flags, 'threads'), cursor: flagStr(flags, 'cursor'), limit: flagNum(flags, 'limit'), linked: flags.linked === true })}`); break
    case 'problems': out = await get('/api/commons/problems'); break
    case 'inspect': {
      if (!rest[0]) throw new CliError(2, 'inspect needs an id.')
      try { out = { kind: 'problem', ...(await get(`/api/commons/problems/${encodeURIComponent(rest[0])}`) as object) } }
      catch (error) {
        if (!(error instanceof CliError) || error.exit !== 5) throw error
        out = { kind: 'contribution', ...(await get(`/api/commons/contributions/${encodeURIComponent(rest[0])}`) as object) }
      }
      break
    }
    case 'thread': out = await get(`/api/commons/contributions/${encodeURIComponent(rest[0] ?? '')}/thread`); break
    case 'context': {
      if (!rest[0]) throw new CliError(2, 'context needs a problem or contribution id.')
      const isContribution = /^(contrib|ext)_/.test(rest[0])
      out = await get(`/api/commons/context${q({ [isContribution ? 'contributionId' : 'problemId']: rest[0], budget: flagNum(flags, 'budget') })}`)
      break
    }
    case 'draft': {
      const prepared = await post('/api/commons/contributions/prepare', draftFromFlags(flags)) as { ok: boolean }
      out = prepared
      if (!prepared.ok) exit = 2
      break
    }
    case 'submit': {
      const draft = draftFromFlags(flags)
      const prepared = await post('/api/commons/contributions/prepare', draft) as { ok: boolean; command?: Record<string, unknown>; errors: string[] }
      if (!prepared.ok || !prepared.command) throw new CliError(2, `Not submitted: ${prepared.errors.join(' ')}`, prepared)
      const command = { ...prepared.command, commandId: flagStr(flags, 'command-id') ?? (typeof draft.commandId === 'string' ? draft.commandId : prepared.command.commandId ?? randomUUID()), entrance: 'cli' }
      out = await post('/api/commons/contributions', command)
      break
    }
    case 'publish': {
      if (!rest[0]) throw new CliError(2, 'publish needs a contribution id.')
      const prepared = await post('/api/commons/publications/prepare', { contributionId: rest[0] }) as { ready: boolean; intent?: { intentId: string } }
      if (!prepared.ready) { out = prepared; exit = 4; break }
      if (flags.yes !== true) { out = { ...prepared, note: 'Preview only. Re-run with --yes to publish exactly this payload to the account above.' }; break }
      out = await post('/api/commons/publications', { intentId: prepared.intent!.intentId })
      break
    }
    case 'publication': out = await get(`/api/commons/contributions/${encodeURIComponent(rest[0] ?? '')}/publication`); break
    case 'retry-publications': out = await post('/api/commons/publications/retry', {}); break
    case 'sync': out = await post('/api/commons/sync', { did: rest[0], maxPages: flagNum(flags, 'max-pages') }); break
    case 'resolve': out = await post('/api/commons/resolve', { uri: rest[0] }); break
    case 'moderate': {
      const [action, id] = rest
      if (!['hide', 'unhide', 'block', 'unblock'].includes(action ?? '') || !id) throw new CliError(2, 'moderate hide|unhide <contributionId> | block|unblock <authorId>')
      out = await post('/api/commons/moderation', { commandId: flagStr(flags, 'command-id') ?? randomUUID(), action, ...(action.endsWith('block') ? { authorId: id } : { contributionId: id }), reason: flagStr(flags, 'reason') })
      break
    }
    case 'status': out = await get('/api/commons/status'); break
    default: throw new CliError(2, `Unknown command "${cmd}".\n${USAGE}`)
  }
  process.stdout.write(`${JSON.stringify(out, null, flags.compact ? 0 : 2)}\n`)
  return exit
}

main(process.argv.slice(2)).then(code => process.exit(code), error => {
  if (error instanceof CliError) {
    process.stderr.write(`${JSON.stringify({ error: error.message, ...(error.body !== undefined ? { detail: error.body } : {}) }, null, 2)}\n`)
    process.exit(error.exit)
  }
  process.stderr.write(`${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`)
  process.exit(1)
})

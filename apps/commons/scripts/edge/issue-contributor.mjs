// Local operator tool: credentials are written to ignored, owner-only files.
import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const [slug, displayName, days = '7'] = process.argv.slice(2)
if (!slug || !/^[a-z0-9-]{1,48}$/.test(slug) || !displayName || !Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 30) {
  throw new Error('Usage: node scripts/edge/issue-contributor.mjs <unique-slug> <display-name> [1–30 days]')
}
const code = randomBytes(32).toString('base64url')
const hash = createHash('sha256').update(code).digest('hex')
const expires = new Date(Date.now() + Number(days) * 86400000).toISOString()
const quote = value => `'${value.replaceAll("'", "''")}'`
const directory = resolve('.edge-credentials')
mkdirSync(directory, { recursive: true, mode: 0o700 })
const prefix = resolve(directory, `${slug}-${Date.now()}`)
writeFileSync(`${prefix}.code`, code + '\n', { mode: 0o600, flag: 'wx' })
writeFileSync(`${prefix}.sql`, `INSERT INTO contributor_tokens (token_hash, actor_id, display_name, expires_at) VALUES (${quote(hash)}, ${quote(`person:${slug}`)}, ${quote(displayName)}, ${quote(expires)});\n`, { mode: 0o600, flag: 'wx' })
console.log(`Credential: ${prefix}.code\nImport SQL: ${prefix}.sql\nExpires: ${expires}\nShare the code privately. It is a reusable bearer credential until revoked or expired, not a single-use invitation.`)

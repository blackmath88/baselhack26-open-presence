/**
 * The dev server: REST API and MCP-over-HTTP on one port.
 *
 * Both mount the same `Services` instance, so a contribution made through the
 * REST API is visible to an MCP client on the next call without any
 * synchronisation — they are literally the same objects in the same process.
 */
import { createServer } from 'node:http'
import { buildServices, commonsConfigFromEnv } from '../container.js'
import { createApi } from './api.js'
import { createMcpNodeHandler } from '../mcp/http.js'
import { createCommonsImporter } from '../commons/import.js'
import { importedProblems } from '../../src/commons/source/index.js'
import type { TransactionalEventRepository } from '../persistence/repository.js'

const port = Number(process.env.PORT ?? 8787)
// Loopback by default: prototype sign-in must not be reachable from the LAN unless asked for.
const host = process.env.HOST ?? '127.0.0.1'

// The prototype login stub is on by default for local development and must be
// explicitly disabled anywhere else. See docs/architecture/ADR-003 §9.
const enablePrototypeAuth = process.env.BRAINSTORM_PROTOTYPE_AUTH !== 'off'

async function main(): Promise<void> {
  const services = await buildServices()
  // Idempotent: unchanged pinned records append nothing on later boots.
  if (services.commons) {
    const result = await createCommonsImporter(services.repository as TransactionalEventRepository)(importedProblems())
    console.log(`Photo Frame Commons: ${result.roomIds.length} imported rooms, ${result.appendedEvents} new import events`)
    const config = commonsConfigFromEnv()
    console.log(`Commons ATProto: ${config.atproto ? `configured (${config.atproto.describe().allowedPds.join(', ') || 'no PDS allowlisted'})` : 'not configured — publication and ingestion report that state'}`)
    // Pending outbox work and opt-in authors are retried at boot, best effort; failures are reported, never hidden.
    const report = await services.commons.bootstrap({ follow: config.follow })
    for (const r of report) console.log(`Commons sync ${r.did}: ${r.status}, ${r.records} records${r.error ? ` (${r.error})` : ''}`)
  }
  const api = createApi(services, { enablePrototypeAuth })
  const mcp = createMcpNodeHandler(services)

  createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0]
    const route = path === '/mcp' ? mcp(req, res) : api(req, res)
    route.catch((error) => {
      console.error('[br-ai-nstorm] unhandled request error:', error)
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'internal_error' }))
      }
    })
  }).listen(port, host, () => {
    console.log(`br-ai-nstorm API   http://localhost:${port}/api`)
    console.log(`br-ai-nstorm MCP   http://localhost:${port}/mcp`)
    if (enablePrototypeAuth) {
      console.log('prototype auth ON — POST /api/auth/session { participantId } to get a token.')
    }
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

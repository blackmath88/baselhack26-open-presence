#!/usr/bin/env node
/**
 * Isolated local ATProto network for Commons integration: one did:plc
 * directory (in-memory) and one PDS (sqlite in a temp dir). Everything is
 * disposable; nothing is reachable from outside this machine unless you bind
 * it so yourself. This is NOT federation and NOT a public account.
 *
 * Usage as a module:
 *   const net = await startLocalPds(); const a = await net.createAccount('alice.test', 'alice-pass'); …; await net.close()
 * Usage as a script:
 *   node start.mjs   → prints COMMONS_PDS_URL / COMMONS_PLC_URL and two dev accounts; Ctrl-C stops it.
 */
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { AtpAgent } from '@atproto/api'
import { Secp256k1Keypair } from '@atproto/crypto'
import { PDS } from '@atproto/pds'
import * as plc from '@did-plc/server'

const ADMIN_PASSWORD = 'admin-pass' // dev only
const JWT_SECRET = 'jwt-secret-dev-only'

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)) })
  })
}

async function tmpdir(label) {
  return fs.mkdtemp(path.join(os.tmpdir(), `commons-pds-${label}-`))
}

/** Handles under `.test` resolve against the PDS itself; PLC endpoints already point at localhost. */
function patchResolvers(pds, pdsUrl) {
  const resolver = pds.ctx.idResolver
  const original = resolver.handle.resolve.bind(resolver.handle)
  resolver.handle.resolve = async (handle) => {
    const local = pds.ctx.cfg.identity.serviceHandleDomains.some((d) => handle.endsWith(d))
    if (!local) return original(handle)
    try {
      const res = await fetch(new URL('/.well-known/atproto-did', pdsUrl), { headers: { host: handle } })
      return res.ok ? (await res.text()).trim() : undefined
    } catch {
      return undefined
    }
  }
}

export async function startLocalPds({ pdsPort, plcPort } = {}) {
  const plcListen = plcPort ?? (await freePort())
  const plcServer = plc.PlcServer.create({ db: plc.Database.mock(), port: plcListen })
  await plcServer.start()
  const plcUrl = `http://localhost:${plcListen}`

  const port = pdsPort ?? (await freePort())
  const pdsUrl = `http://localhost:${port}`
  const recoveryKey = (await Secp256k1Keypair.create()).did()
  const rotation = await Secp256k1Keypair.create({ exportable: true })
  const dirs = [await tmpdir('data'), await tmpdir('blobs')]
  const pds = await PDS.fromEnv({
    devMode: true,
    port,
    hostname: 'localhost',
    dataDirectory: dirs[0],
    blobstoreDiskLocation: dirs[1],
    recoveryDidKey: recoveryKey,
    adminPassword: ADMIN_PASSWORD,
    jwtSecret: JWT_SECRET,
    serviceHandleDomains: ['.test'],
    didPlcUrl: plcUrl,
    plcRotationKeyK256PrivateKeyHex: Buffer.from(await rotation.export()).toString('hex'),
    inviteRequired: false,
    disableSsrfProtection: true,
    bskyAppViewUrl: 'https://appview.invalid',
    bskyAppViewDid: 'did:example:invalid',
    bskyAppViewCdnUrlPattern: 'http://cdn.appview.com/%s/%s/%s',
    modServiceUrl: 'https://moderator.invalid',
    modServiceDid: 'did:example:invalid',
    serviceName: 'Commons development PDS (disposable)',
  })
  patchResolvers(pds, pdsUrl)
  await pds.start()

  const accounts = []
  return {
    pdsUrl,
    plcUrl,
    pds,
    async createAccount(handle, password, email = `${handle.split('.')[0]}@example.invalid`) {
      const agent = new AtpAgent({ service: pdsUrl })
      const { data } = await agent.com.atproto.server.createAccount({ handle, password, email })
      accounts.push({ did: data.did, handle: data.handle })
      return { did: data.did, handle: data.handle }
    },
    accounts,
    async close() {
      await pds.destroy().catch(() => undefined)
      await plcServer.destroy().catch(() => undefined)
      await Promise.all(dirs.map((d) => fs.rm(d, { recursive: true, force: true }).catch(() => undefined)))
    },
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname
if (isMain) {
  const network = await startLocalPds({
    pdsPort: process.env.COMMONS_PDS_PORT ? Number(process.env.COMMONS_PDS_PORT) : undefined,
    plcPort: process.env.COMMONS_PLC_PORT ? Number(process.env.COMMONS_PLC_PORT) : undefined,
  })
  const alice = await network.createAccount('alice.test', 'alice-dev-pass')
  const bob = await network.createAccount('bob.test', 'bob-dev-pass')
  console.log('# Disposable local ATProto network. Dev-only credentials; data lives in temp dirs and is deleted on exit.')
  console.log(`COMMONS_PDS_URL=${network.pdsUrl}`)
  console.log(`COMMONS_PLC_URL=${network.plcUrl}`)
  console.log(`COMMONS_ATPROTO_ALLOWED_PDS=${network.pdsUrl}`)
  console.log(`COMMONS_ATPROTO_ACCOUNTS='${JSON.stringify({
    'person:kai': { service: network.pdsUrl, identifier: alice.handle, password: 'alice-dev-pass' },
    'person:lea': { service: network.pdsUrl, identifier: bob.handle, password: 'bob-dev-pass' },
  })}'`)
  console.log(`# alice.test = ${alice.did}`)
  console.log(`# bob.test   = ${bob.did}`)
  console.log('# Press Ctrl-C to stop.')
  const stop = async () => { await network.close(); process.exit(0) }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

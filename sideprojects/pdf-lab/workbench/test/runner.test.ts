// The local runner's boundaries: limits, isolation, origin/host/type/hash/structure checks, and one
// real measurement when the engines are installed. Measurements here go to temporary directories only.
import { existsSync, readFileSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { DEFAULT_LIMITS, isolation, runBounded } from '../runner/bounded.mjs'
import { bend } from '../src/adapters/mappingWriter'
import { parseMeasurement } from '../src/adapters/liveRuns'

const LAB = fileURLToPath(new URL('../../', import.meta.url))
const VENV = '/tmp/pdf-nuc-check/bin/python'
if (!process.env.PDF_CHECK_PYTHON && existsSync(VENV)) process.env.PDF_CHECK_PYTHON = VENV
const { createRunner, instruments } = await import('../runner/server.mjs')

const other = readFileSync(join(LAB, 'output/pdf/01-poem-other.pdf'))
const sha = async (b: Uint8Array) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', b as Uint8Array<ArrayBuffer>))].map((x) => x.toString(16).padStart(2, '0')).join('')
const alive = (pid: number) => { try { process.kill(pid, 0); return true } catch { return false } }

describe('bounded child processes', () => {
  it('kills the whole process group at the wall-time limit', async () => {
    const r = await runBounded(['sh', '-c', 'sleep 30 & echo $!; wait'], { limits: { ...DEFAULT_LIMITS, wallMs: 400 } })
    expect(r.timedOut).toBe(true)
    expect(r.durationMs).toBeLessThan(3000)
    const grandchild = Number(r.stdout.trim())
    await new Promise((res) => setTimeout(res, 200))
    expect(Number.isInteger(grandchild) && grandchild > 0 && alive(grandchild)).toBe(false)
  })
  it('stops a child that exceeds the output limit', async () => {
    const r = await runBounded(['yes'], { limits: { ...DEFAULT_LIMITS, outputMiB: 0.01 } })
    expect(r.truncated).toBe(true)
    expect(r.stdout.length).toBeLessThanOrEqual(0.01 * 1024 * 1024)
  })
  it.skipIf(!isolation().network.startsWith('none'))('gives jobs no network', async () => {
    const r = await runBounded(['python3', '-c', 'import socket; socket.create_connection(("1.1.1.1", 53), 2)'])
    expect(r.exitCode).not.toBe(0)
    expect(r.stderr).toMatch(/unreachable|Errno/i)
  })
})

describe('runner endpoint', () => {
  const PORT = 31987
  const ORIGIN = 'http://127.0.0.1:3100'
  const tools = instruments()
  const server = createRunner({ tools, port: PORT, allowOrigins: new Set([ORIGIN]) })
  const base = `http://127.0.0.1:${PORT}`
  beforeAll(() => new Promise<void>((r) => server.listen(PORT, '127.0.0.1', () => r())))
  afterAll(() => new Promise<void>((r) => server.close(() => r())))
  const post = async (bytes: Uint8Array, headers: Record<string, string> = {}) => fetch(`${base}/measure`, {
    method: 'POST', body: bytes as Uint8Array<ArrayBuffer>,
    headers: { origin: ORIGIN, 'x-pdf-lab-runner': '1', 'content-type': 'application/pdf', 'x-expect-sha256': await sha(bytes), ...headers },
  })

  it('answers health only for allowed origins', async () => {
    expect((await fetch(`${base}/health`, { headers: { origin: 'https://evil.example' } })).status).toBe(403)
    const ok = await fetch(`${base}/health`, { headers: { origin: ORIGIN } })
    expect(ok.status).toBe(200)
    expect(ok.headers.get('access-control-allow-origin')).toBe(ORIGIN)
  })
  it('refuses a non-loopback Host (DNS rebinding)', async () => {
    const status = await new Promise<number>((resolve) => {
      request({ host: '127.0.0.1', port: PORT, path: '/health', headers: { host: 'attacker.example:3110', origin: ORIGIN } }, (res) => { res.resume(); resolve(res.statusCode ?? 0) }).end()
    })
    expect(status).toBe(421)
  })
  it('refuses requests a cross-site form could send, wrong types, wrong hashes and oversize bodies', async () => {
    expect((await post(other, { 'x-pdf-lab-runner': '' })).status).toBe(403)
    expect((await post(other, { 'content-type': 'text/plain' })).status).toBe(415)
    expect((await post(other, { 'x-expect-sha256': 'a'.repeat(64) })).status).toBe(409)
    expect((await post(new Uint8Array(17000))).status).toBe(413)
    expect((await fetch(`${base}/run?cmd=ls`, { method: 'POST', headers: { origin: ORIGIN } })).status).toBe(404)
  })
  it('refuses files outside the two-poem fixture family, including ones with actions', async () => {
    expect((await post(new TextEncoder().encode('%PDF-1.4\nnot the fixture'))).status).toBe(422)
    const withAction = Buffer.from(other.toString('latin1').replace('<< /Type /Catalog', '<< /OpenAction 3 0 R /Type /Catalog'), 'latin1')
    expect((await post(withAction)).status).toBe(422)
  })
  it.skipIf(!tools.mupdf || !tools.pdftotext || !tools.pdftoppm)('measures a variant: new reading extracted, picture unchanged', async () => {
    const lines = ['I keep a tide beneath my tongue.', 'Paper boats remember the rain.', 'A word slips free before a song.', 'The shore was listening so long.']
    const bytes = bend(other, lines)
    const res = await post(bytes)
    expect(res.status).toBe(200)
    const m = parseMeasurement(await res.json(), await sha(bytes), base)
    expect(m.runs.mupdf?.text).toContain('Paper boats remember the rain.')
    expect(m.runs.pdftotext?.text).toContain('Paper boats remember the rain.')
    const recorded = JSON.parse(readFileSync(join(LAB, 'evidence/poems-results.json'), 'utf8'))
    expect(m.runs.mupdf?.pixelsSha256).toBe(recorded.runs.other.mupdf.observation.pixels_sha256)
    expect(m.runs.pdftoppm?.pixelsSha256).toBe(recorded.runs.other.poppler_render.pixels_sha256)
    expect(m.runs.mupdf?.origin).toBe('live')
    expect(m.runs.mupdf?.command.join(' ')).not.toMatch(/\/tmp\/pdf-lab-run-/)
  })
  it('rejects a response for different bytes than were sent', () => {
    const body = { schema: 'pdf-lab.runner.measurement', schemaVersion: 1, inputSha256: 'b'.repeat(64), startedAt: 'x', finishedAt: 'y', limits: {}, isolation: { network: 'n', rlimits: 'r' }, runs: [] }
    expect(() => parseMeasurement(body, 'a'.repeat(64), base)).toThrow(/different bytes/)
  })
})

// PDF LAB local measurement runner (workbench phase 4).
//
// Loopback only. Measures one small two-poem PDF with three allowlisted operations — the same
// commands the recorded evidence used — and returns the raw results. It accepts no paths, no shell
// text and no operation names from the request: the body is the PDF, the header is its SHA-256.
// One job at a time; each in its own temporary directory, removed afterwards.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_LIMITS, isolation, runBounded } from './bounded.mjs'

const LAB = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const HOST = '127.0.0.1'
const PORT = Number(process.env.RUNNER_PORT ?? 3110)
const PYTHON = process.env.PDF_CHECK_PYTHON || 'python3'
const ORIGINS = new Set((process.env.RUNNER_ALLOW_ORIGINS ?? 'http://127.0.0.1:3100,http://localhost:3100').split(',').map((s) => s.trim()).filter(Boolean))
const MAX_BYTES = 16 * 1024
export const SCHEMA = 'pdf-lab.runner.measurement'

const sha256 = (b) => createHash('sha256').update(b).digest('hex')

/** The same input guard as the lab's two-poem writer: only its small authored fixture family. */
export function fixtureProblem(bytes) {
  if (bytes.length > MAX_BYTES) return `larger than ${MAX_BYTES} bytes`
  const s = bytes.toString('latin1')
  if (!s.startsWith('%PDF-1.4') || !s.includes('/CMapName /TwoPoems')) return 'not a two-poem fixture'
  const objects = [...s.matchAll(/^(\d+) 0 obj\n[\s\S]*?\nendobj\n/gm)]
  if (objects.length !== 11 || objects.some((o, i) => Number(o[1]) !== i + 1)) return 'unexpected object structure'
  if (/\/(JavaScript|JS|Launch|URI|SubmitForm|OpenAction|AA|EmbeddedFile)\b/.test(s)) return 'contains an action or embedded file'
  return null
}

/** Poppler prints its version on stderr; read both streams whatever the exit code. */
function probe(argv, pick) {
  const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: 5000 })
  if (r.error) return null
  return pick(`${r.stdout ?? ''}${r.stderr ?? ''}`)
}

/** Instrument versions as the tools themselves report them, read once at start. */
export function instruments() {
  const mupdf = probe([PYTHON, '-c', 'import fitz, json; print(json.dumps(list(fitz.version)))'], (o) => { try { return JSON.parse(o.trim()) } catch { return null } })
  return {
    mupdf: mupdf ? { engine: 'MuPDF', version: mupdf[1], wrapper: 'PyMuPDF', wrapperVersion: mupdf[0] } : null,
    pdftotext: probe(['pdftotext', '-v'], (o) => ({ engine: 'Poppler', wrapper: 'pdftotext', version: o.match(/pdftotext version (\S+)/)?.[1] ?? null })),
    pdftoppm: probe(['pdftoppm', '-v'], (o) => ({ engine: 'Poppler', wrapper: 'pdftoppm', version: o.match(/pdftoppm version (\S+)/)?.[1] ?? null })),
  }
}

/** Run the three operations on one file. Commands mirror check-poems.py's recorded runs. */
export async function measure(bytes, tools) {
  const dir = mkdtempSync(join(tmpdir(), 'pdf-lab-run-'))
  try {
    const pdf = join(dir, 'input.pdf')
    writeFileSync(pdf, bytes)
    const shown = (argv) => argv.map((a) => a.replaceAll(dir, '$JOB').replace(LAB, '$LAB'))
    const runs = []
    const record = (operation, tool, argv, r, extra) => runs.push({
      operation, instrument: tool, command: shown(argv), exitCode: r.exitCode, signal: r.signal, timedOut: r.timedOut, truncated: r.truncated,
      durationMs: r.durationMs, stdout: r.stdout, stderr: r.stderr, ...extra,
    })
    if (tools.mupdf) {
      const argv = [PYTHON, join(LAB, 'check-poems.py'), '--worker', pdf, join(dir, 'mupdf.png')]
      const r = await runBounded(argv, { cwd: dir })
      let obs = null
      try { obs = r.exitCode === 0 ? JSON.parse(r.stdout) : null } catch { obs = null }
      record('render-and-extract', tools.mupdf, argv, r, { text: obs?.text ?? null, pixelsSha256: obs?.pixels_sha256 ?? null, width: obs?.width ?? null, height: obs?.height ?? null })
    }
    if (tools.pdftotext) {
      const argv = ['pdftotext', '-layout', pdf, '-']
      const r = await runBounded(argv, { cwd: dir })
      record('extract-text', tools.pdftotext, argv, r, { text: r.exitCode === 0 ? r.stdout : null, pixelsSha256: null })
    }
    if (tools.pdftoppm) {
      const argv = ['pdftoppm', '-r', '72', '-singlefile', pdf, join(dir, 'poppler')]
      const r = await runBounded(argv, { cwd: dir })
      let pixels = null
      // Hash the PPM file bytes, exactly as check-poems.py recorded poppler_render.pixels_sha256.
      try { pixels = r.exitCode === 0 ? sha256(readFileSync(join(dir, 'poppler.ppm'))) : null } catch { pixels = null }
      record('render', tools.pdftoppm, argv, r, { text: null, pixelsSha256: pixels })
    }
    return runs
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function headers(origin) {
  return { 'access-control-allow-origin': origin, vary: 'origin', 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type, x-pdf-lab-runner, x-expect-sha256', 'access-control-max-age': '600', 'cache-control': 'no-store' }
}

export function createRunner({ tools = instruments(), allowOrigins = ORIGINS, port = PORT } = {}) {
  let busy = false
  const hostOk = (h) => h === `127.0.0.1:${port}` || h === `localhost:${port}`
  return createServer(async (req, res) => {
    const origin = req.headers.origin ?? ''
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json', ...(allowOrigins.has(origin) ? headers(origin) : {}) })
      res.end(JSON.stringify(body))
    }
    // DNS-rebinding and cross-site guard: loopback Host, allowlisted Origin, a header simple requests cannot set.
    if (!hostOk(req.headers.host ?? '')) return send(421, { error: 'wrong host' })
    if (!allowOrigins.has(origin)) return send(403, { error: 'origin not allowed' })
    if (req.method === 'OPTIONS') { res.writeHead(204, headers(origin)); return res.end() }
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    if (req.method === 'GET' && url.pathname === '/health') {
      return send(200, { schema: SCHEMA, schemaVersion: 1, instruments: tools, limits: DEFAULT_LIMITS, isolation: isolation(), busy })
    }
    if (url.pathname !== '/measure' || req.method !== 'POST') return send(404, { error: 'unknown endpoint' })
    if (req.headers['x-pdf-lab-runner'] !== '1') return send(403, { error: 'missing runner header' })
    if (req.headers['content-type'] !== 'application/pdf') return send(415, { error: 'expected application/pdf' })
    const expected = String(req.headers['x-expect-sha256'] ?? '')
    if (!/^[0-9a-f]{64}$/.test(expected)) return send(400, { error: 'x-expect-sha256 must be a SHA-256 hex digest' })
    const body = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > MAX_BYTES) return send(413, { error: `larger than ${MAX_BYTES} bytes` })
      body.push(chunk)
    }
    const bytes = Buffer.concat(body)
    const actual = sha256(bytes)
    if (actual !== expected) return send(409, { error: 'body does not match x-expect-sha256', actual })
    const problem = fixtureProblem(bytes)
    if (problem) return send(422, { error: `not accepted: ${problem}` })
    if (busy) return send(429, { error: 'another measurement is running' })
    busy = true
    const startedAt = new Date().toISOString()
    try {
      const runs = await measure(bytes, tools)
      send(200, { schema: SCHEMA, schemaVersion: 1, inputSha256: actual, startedAt, finishedAt: new Date().toISOString(), limits: DEFAULT_LIMITS, isolation: isolation(), runs })
    } catch (e) {
      send(500, { error: `measurement failed: ${e.message}` })
    } finally {
      busy = false
    }
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tools = instruments()
  createRunner({ tools }).listen(PORT, HOST, () => {
    console.log(`PDF LAB runner on http://${HOST}:${PORT}/ for ${[...ORIGINS].join(', ')}`)
    console.log(`instruments: ${JSON.stringify(tools)}`)
    console.log(`isolation: ${JSON.stringify(isolation())}`)
  })
}

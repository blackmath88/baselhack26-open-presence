// Adapter for the local runner's responses (runner/server.mjs). Validated like any other evidence:
// a response for different bytes than were sent is rejected, never shown.
import type { Instrument, Run } from '../domain/types'
import { EvidenceError, arr, isObject, num, obj, optNum, optStr, sha, str, strings } from '../domain/check'

export const RUNNER_SCHEMA = 'pdf-lab.runner.measurement'

export interface RunnerHealth {
  instruments: Record<'mupdf' | 'pdftotext' | 'pdftoppm', Instrument | null>
  limits: Record<string, number>
  isolation: { network: string; rlimits: string }
  busy: boolean
}

export interface LiveMeasurement {
  inputSha256: string
  startedAt: string
  finishedAt: string
  isolation: RunnerHealth['isolation']
  runs: { mupdf: Run | null; pdftotext: Run | null; pdftoppm: Run | null }
}

function instrument(v: unknown, path: string, id: string): Instrument | null {
  if (v === null || v === undefined) return null
  const o = obj(v, path)
  return {
    id, engine: str(o.engine, `${path}/engine`), wrapper: str(o.wrapper, `${path}/wrapper`),
    version: optStr(o.version, `${path}/version`), wrapperVersion: optStr(o.wrapperVersion, `${path}/wrapperVersion`),
    configuration: id === 'mupdf' ? 'check-poems.py worker: page text and 72 dpi render' : id === 'pdftotext' ? '-layout' : '-r 72 -singlefile',
  }
}

const header = (root: Record<string, unknown>, P: string) => {
  if (root.schema !== RUNNER_SCHEMA) throw new EvidenceError(`${P}/schema`, 'not a PDF LAB runner response')
  const v = num(root.schemaVersion, `${P}/schemaVersion`)
  if (v !== 1) throw new EvidenceError(`${P}/schemaVersion`, `runner schema ${v} is not supported (expects 1)`)
}
const isolationOf = (v: unknown, P: string) => { const o = obj(v, P); return { network: str(o.network, `${P}/network`), rlimits: str(o.rlimits, `${P}/rlimits`) } }
const limitsOf = (v: unknown, P: string) => Object.fromEntries(Object.entries(obj(v, P)).map(([k, x]) => [k, num(x, `${P}/${k}`)]))

export function parseHealth(input: unknown): RunnerHealth {
  const P = 'runner/health'
  const root = obj(input, P)
  header(root, P)
  const ins = obj(root.instruments, `${P}/instruments`)
  return {
    instruments: { mupdf: instrument(ins.mupdf, `${P}/instruments/mupdf`, 'mupdf'), pdftotext: instrument(ins.pdftotext, `${P}/instruments/pdftotext`, 'pdftotext'), pdftoppm: instrument(ins.pdftoppm, `${P}/instruments/pdftoppm`, 'pdftoppm') },
    limits: limitsOf(root.limits, `${P}/limits`), isolation: isolationOf(root.isolation, `${P}/isolation`), busy: root.busy === true,
  }
}

const OPERATIONS = { 'render-and-extract': 'mupdf', 'extract-text': 'pdftotext', render: 'pdftoppm' } as const

export function parseMeasurement(input: unknown, sentSha256: string, runnerUrl: string): LiveMeasurement {
  const P = 'runner/measurement'
  const root = obj(input, P)
  header(root, P)
  const inputSha256 = sha(root.inputSha256, `${P}/inputSha256`)
  if (inputSha256 !== sentSha256) throw new EvidenceError(`${P}/inputSha256`, 'the runner measured different bytes than were sent')
  const finishedAt = str(root.finishedAt, `${P}/finishedAt`)
  const limits = limitsOf(root.limits, `${P}/limits`)
  const runs: LiveMeasurement['runs'] = { mupdf: null, pdftotext: null, pdftoppm: null }
  arr(root.runs, `${P}/runs`).forEach((raw, i) => {
    const p = `${P}/runs/${i}`
    const r = obj(raw, p)
    const operation = str(r.operation, `${p}/operation`)
    if (!(operation in OPERATIONS)) throw new EvidenceError(`${p}/operation`, `unknown operation ${operation}`)
    const key = OPERATIONS[operation as keyof typeof OPERATIONS]
    const exitCode = r.exitCode === null ? -1 : num(r.exitCode, `${p}/exitCode`)
    const failed = exitCode !== 0 || r.timedOut === true || r.truncated === true
    runs[key] = {
      id: `live:${key}`, operation: operation as Run['operation'], instrument: instrument(r.instrument, `${p}/instrument`, key)!,
      inputSha256, status: failed ? 'failed' : 'ok', command: strings(r.command, `${p}/command`), exitCode,
      stdout: str(r.stdout, `${p}/stdout`), stderr: `${str(r.stderr, `${p}/stderr`)}${r.timedOut === true ? '\n[stopped: wall-time limit]' : ''}${r.truncated === true ? '\n[stopped: output limit]' : ''}`,
      text: optStr(r.text, `${p}/text`), pixelsSha256: optStr(r.pixelsSha256, `${p}/pixelsSha256`),
      evidence: { path: `local runner ${runnerUrl}`, sourceCommit: null }, origin: 'live', measuredAt: finishedAt, limits,
    }
    void optNum(r.durationMs, `${p}/durationMs`)
  })
  return { inputSha256, startedAt: str(root.startedAt, `${P}/startedAt`), finishedAt, isolation: isolationOf(root.isolation, `${P}/isolation`), runs }
}

export const isRunnerError = (v: unknown): string | null => (isObject(v) && typeof v.error === 'string' ? v.error : null)

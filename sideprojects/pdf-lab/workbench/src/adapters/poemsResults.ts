// Adapter for evidence/poems-results.json: the recorded MuPDF and Poppler runs over the four
// two-poem files. Versions are copied per instrument exactly as reported; anything the report does
// not say stays null. Runs keep raw stdout/stderr and are marked stale if their input hash no longer
// matches the file the workbench serves.
import type { EvidenceRef, Instrument, Run } from '../domain/types'
import { EvidenceError, isObject, num, obj, optStr, sha, str, strings } from '../domain/check'

export const READINGS = ['visible', 'other', 'direct', 'raster'] as const
export type Reading = (typeof READINGS)[number]
export const EVIDENCE_PATH = 'evidence/poems-results.json'

export interface PoemRuns {
  inputSha256: string
  mupdf: Run
  pdftotext: Run
  pdftoppm: Run | null
}

export interface PoemsEvidence {
  versions: Record<string, string>
  limits: Record<string, number> | null
  checks: Record<string, unknown>
  notRun: string[]
  instruments: { mupdf: Instrument; pdftotext: Instrument; pdftoppm: Instrument }
  runs: Record<Reading, PoemRuns>
}

/** Arguments that are options or values, never local paths from the machine that ran them. */
const configuration = (command: string[]) => command.slice(1).filter((a) => !a.includes('/') && a !== '-').join(' ')

export function parsePoemsResults(input: unknown, opts: { sourceCommit: string | null; currentSha256: (reading: Reading) => string | null }): PoemsEvidence {
  const P = 'poems-results'
  const root = obj(input, P)
  const versions = Object.fromEntries(Object.entries(obj(root.versions, `${P}/versions`)).map(([k, v]) => [k, str(v, `${P}/versions/${k}`)]))
  const limits = isObject(root.limits) ? Object.fromEntries(Object.entries(root.limits).map(([k, v]) => [k, num(v, `${P}/limits/${k}`)])) : null
  const popplerVersion = versions.poppler?.match(/(\d+\.\d+\.\d+)/)?.[1] ?? null
  const instruments = {
    mupdf: { id: 'mupdf', engine: 'MuPDF', wrapper: 'PyMuPDF', version: versions.mupdf ?? null, wrapperVersion: versions.pymupdf ?? null, configuration: 'check-poems.py worker: page text and 72 dpi render' },
    pdftotext: { id: 'pdftotext', engine: 'Poppler', wrapper: 'pdftotext', version: popplerVersion, wrapperVersion: null, configuration: '-layout' },
    // The report records pdftotext's version only; pdftoppm's is not stated, so it stays unknown.
    pdftoppm: { id: 'pdftoppm', engine: 'Poppler', wrapper: 'pdftoppm', version: null, wrapperVersion: null, configuration: '-r 72 -singlefile' },
  } satisfies PoemsEvidence['instruments']
  const runsRoot = obj(root.runs, `${P}/runs`)
  const runs = {} as Record<Reading, PoemRuns>
  for (const reading of READINGS) {
    const r = obj(runsRoot[reading], `${P}/runs/${reading}`)
    const inputSha256 = sha(r.sha256, `${P}/runs/${reading}/sha256`)
    const current = opts.currentSha256(reading)
    const stale = current !== inputSha256
    const make = (key: string, operation: Run['operation'], instrument: Instrument): Run => {
      const path = `${P}/runs/${reading}/${key}`
      const raw = obj(r[key], path)
      const command = strings(raw.command, `${path}/command`)
      const exitCode = num(raw.exit_code, `${path}/exit_code`)
      const stdout = str(raw.stdout, `${path}/stdout`)
      let text: string | null = null
      let pixelsSha256: string | null = optStr(raw.pixels_sha256, `${path}/pixels_sha256`)
      if (key === 'mupdf') {
        // Observation is stored for vector files; the raster run keeps only its JSON stdout.
        let observation: unknown = raw.observation
        if (observation === undefined) {
          try { observation = JSON.parse(stdout) } catch { throw new EvidenceError(path, 'MuPDF stdout is not the expected JSON and no observation was stored') }
        }
        const o = obj(observation, `${path}/observation`)
        text = str(o.text, `${path}/observation/text`)
        pixelsSha256 = optStr(o.pixels_sha256, `${path}/observation/pixels_sha256`)
      } else if (key === 'poppler') {
        text = stdout
      }
      const evidence: EvidenceRef = { path: EVIDENCE_PATH, sourceCommit: opts.sourceCommit, pointer: `/runs/${reading}/${key}` }
      return {
        id: `${reading}:${key}`, operation, instrument, inputSha256, command, exitCode, stdout,
        stderr: str(raw.stderr, `${path}/stderr`), text, pixelsSha256, evidence, origin: 'recorded', limits,
        status: stale ? 'stale-input' : exitCode === 0 ? 'ok' : 'failed',
      }
    }
    runs[reading] = {
      inputSha256,
      mupdf: make('mupdf', 'render-and-extract', instruments.mupdf),
      pdftotext: make('poppler', 'extract-text', instruments.pdftotext),
      pdftoppm: r.poppler_render === undefined ? null : make('poppler_render', 'render', instruments.pdftoppm),
    }
  }
  return {
    versions, limits, instruments, runs,
    checks: obj(root.checks, `${P}/checks`),
    notRun: strings(root.not_run, `${P}/not_run`),
  }
}

export const commandConfiguration = configuration

/** Whether a line appears in an engine's text, ignoring whitespace differences only. */
export function containsLine(text: string | null, line: string): boolean | null {
  if (text === null) return null
  const squash = (s: string) => s.replace(/\s+/g, ' ').trim()
  return squash(text).includes(squash(line))
}

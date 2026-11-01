// Contract tests over the real lab files, plus deliberately broken copies of them.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import labJson from '../src/generated/lab-data.json'
import { EvidenceError } from '../src/domain/check'
import { parseLabData } from '../src/adapters/labData'
import { parsePoemsResults, type Reading } from '../src/adapters/poemsResults'
import { UnsupportedStructure, parseTwoPoemFixture } from '../src/adapters/twoPoemFixture'
import { parseSourceRenders } from '../src/adapters/poemsTransforms'

const LAB = fileURLToPath(new URL('../../', import.meta.url))
const read = (rel: string) => readFileSync(LAB + rel)
const json = (rel: string) => JSON.parse(read(rel).toString('utf8'))
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const FILES: Record<Reading, string> = { visible: 'output/pdf/01-poem-visible.pdf', other: 'output/pdf/01-poem-other.pdf', direct: 'output/pdf/01-poem-direct.pdf', raster: 'output/pdf/01-poem-raster.pdf' }
const current = (r: Reading) => sha(read(FILES[r]))

describe('lab inventory', () => {
  it('accepts the ingested inventory and verifies the poem files against both manifests', () => {
    const lab = parseLabData(labJson)
    for (const file of Object.values(FILES)) {
      const a = lab.artefacts.get(file)!
      expect(a.integrity).toBe('verified')
      expect(a.listed.map((l) => l.manifest).sort()).toEqual(['output/pdf/manifest.json', 'output/pdf/poems-manifest.json'])
      expect(a.sha256).toBe(sha(read(file)))
    }
    // Two committed files share bytes; the inventory keeps both names and reports the group.
    expect(lab.sameBytes.some((g) => g.includes('output/pdf/01-one-letter.pdf') && g.includes('output/pdf/03-baseline.pdf'))).toBe(true)
  })
  it('marks an artefact whose manifest hash differs as a mismatch', () => {
    const bad = clone(labJson) as { artefacts: Array<{ path: string; listed: Array<{ sha256: string }> }> }
    bad.artefacts.find((a) => a.path === FILES.other)!.listed[0]!.sha256 = '0'.repeat(64)
    expect(parseLabData(bad).artefacts.get(FILES.other)!.integrity).toBe('mismatch')
  })
  it('rejects an unsupported schema with a useful message', () => {
    expect(() => parseLabData({ ...clone(labJson), schemaVersion: 2 })).toThrow(/schema 2 is not supported/)
  })
  it('rejects duplicate inventory paths', () => {
    const dup = clone(labJson) as { artefacts: unknown[] }
    dup.artefacts.push(dup.artefacts[0])
    expect(() => parseLabData(dup)).toThrow(/duplicate inventory entry/)
  })
  it('rejects a malformed hash', () => {
    const bad = clone(labJson) as { artefacts: Array<{ sha256: string }> }
    bad.artefacts[0]!.sha256 = 'not-a-hash'
    expect(() => parseLabData(bad)).toThrow(EvidenceError)
  })
})

describe('recorded poem runs', () => {
  const raw = json('evidence/poems-results.json')
  it('reads every reading with per-instrument versions and keeps unknowns unknown', () => {
    const e = parsePoemsResults(raw, { sourceCommit: 'abc', currentSha256: current })
    expect(e.instruments.mupdf.version).toBe('1.26.11')
    expect(e.instruments.mupdf.wrapperVersion).toBe('1.26.6')
    expect(e.instruments.pdftotext.version).toBe('26.08.0')
    expect(e.instruments.pdftoppm.version).toBeNull()
    expect(e.runs.other.mupdf.text).toContain('The silence carries paper boats.')
    expect(e.runs.raster.mupdf.text).toBe('')
    expect(e.runs.raster.pdftoppm).toBeNull()
    expect(e.runs.visible.mupdf.status).toBe('ok')
    expect(e.runs.visible.mupdf.origin).toBe('recorded')
    expect(e.runs.other.pdftotext.evidence).toEqual({ path: 'evidence/poems-results.json', sourceCommit: 'abc', pointer: '/runs/other/poppler' })
    expect(e.notRun).toContain('native viewer copy/paste')
  })
  it('marks runs stale when the served file no longer matches their input hash', () => {
    const e = parsePoemsResults(raw, { sourceCommit: null, currentSha256: (r) => (r === 'other' ? 'f'.repeat(64) : current(r)) })
    expect(e.runs.other.mupdf.status).toBe('stale-input')
    expect(e.runs.visible.mupdf.status).toBe('ok')
  })
  it('leaves a missing version null instead of borrowing another', () => {
    const r = clone(raw); delete r.versions.mupdf
    expect(parsePoemsResults(r, { sourceCommit: null, currentSha256: current }).instruments.mupdf.version).toBeNull()
  })
  it('rejects a corrupt report', () => {
    const r = clone(raw); delete r.runs.visible
    expect(() => parsePoemsResults(r, { sourceCommit: null, currentSha256: current })).toThrow(/runs\/visible: expected an object/)
    const s = clone(raw); s.runs.raster.mupdf.stdout = 'not json'
    expect(() => parsePoemsResults(s, { sourceCommit: null, currentSha256: current })).toThrow(EvidenceError)
  })
})

describe('two-poem fixture bytes', () => {
  const text = (r: Reading) => read(FILES[r]).toString('latin1')
  it('finds the drawn and mapped line for each glyph, ignoring the codespace range', () => {
    const other = parseTwoPoemFixture(text('other'))
    expect(other.kind).toBe('type3-mapped')
    if (other.kind !== 'type3-mapped') return
    expect(other.lines.map((l) => l.code)).toEqual(['41', '42', '43', '44'])
    expect(other.lines[1]).toMatchObject({ drawn: 'The window gathers little seas.', mapped: 'The silence carries paper boats.', x: 48, y: 482 })
    expect(other.fontBBox).toEqual([0, -8, 500, 30])
    const visible = parseTwoPoemFixture(text('visible'))
    expect(visible.kind === 'type3-mapped' && visible.lines.every((l) => l.drawn === l.mapped)).toBe(true)
  })
  it('recognises the direct control as ordinary text even though it declares the Type 3 font', () => {
    const direct = parseTwoPoemFixture(text('direct'))
    expect(direct.kind).toBe('direct-text')
    expect(direct.kind === 'direct-text' && direct.lines[3]!.drawn).toBe('Dark gives each wing a name.')
  })
  it('fails honestly on structure it does not understand', () => {
    expect(() => parseTwoPoemFixture(text('other').replace(/\/ToUnicode \d+ 0 R/, ''))).toThrow(UnsupportedStructure)
    expect(() => parseTwoPoemFixture(read(FILES.raster).toString('latin1'))).toThrow(UnsupportedStructure)
    expect(() => parseTwoPoemFixture('not a pdf')).toThrow(UnsupportedStructure)
  })
})

describe('stored source renders', () => {
  it('reads MuPDF and Poppler renders of the unchanged files only', () => {
    const t = parseSourceRenders(json('evidence/poems-transforms.json'), null)
    expect(t.renders.map((r) => `${r.reading}-${r.engine}`).sort()).toEqual(['other-mupdf', 'other-poppler', 'visible-mupdf', 'visible-poppler'])
    expect(t.renders.every((r) => r.preview.startsWith('evidence/previews/01-poem-'))).toBe(true)
    expect(t.dpi).toBe(72)
  })
})

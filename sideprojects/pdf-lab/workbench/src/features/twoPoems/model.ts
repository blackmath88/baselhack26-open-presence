// A01 Two poems: everything the encounter and inspector show, composed from the adapters.
// Components render this model; they never parse evidence themselves.
import labJson from '../../generated/lab-data.json'
import type { Artefact, Correspondence, EvidenceRef, Selection } from '../../domain/types'
import { parseLabData, type LabData } from '../../adapters/labData'
import { EVIDENCE_PATH, containsLine, parsePoemsResults, type PoemRuns, type PoemsEvidence, type Reading } from '../../adapters/poemsResults'
import { parseTwoPoemFixture, type TwoPoemFixture } from '../../adapters/twoPoemFixture'
import { TRANSFORMS_PATH, parseSourceRenders, type TransformsSummary } from '../../adapters/poemsTransforms'

export const SPECIMEN_ID = 'a01-two-poems'
export const PAGE = { width: 612, height: 792 } as const

export interface ReadingInfo {
  id: Reading
  label: string
  short: string
  file: string
  /** Recorded render shown on the stage, and exactly what it is. */
  preview: string
  previewLabel: string
}

export const READING_INFO: Record<Reading, ReadingInfo> = {
  other: { id: 'other', label: 'Alternate reading', short: 'Alternate', file: 'output/pdf/01-poem-other.pdf', preview: 'evidence/previews/01-poem-other.webp', previewLabel: 'Recorded MuPDF render of this file, 72 dpi' },
  visible: { id: 'visible', label: 'Visible mapping', short: 'Visible', file: 'output/pdf/01-poem-visible.pdf', preview: 'evidence/previews/01-poem-visible.webp', previewLabel: 'Recorded MuPDF render of this file, 72 dpi' },
  direct: { id: 'direct', label: 'Direct-text control', short: 'Direct text', file: 'output/pdf/01-poem-direct.pdf', preview: 'evidence/previews/01-poem-direct.webp', previewLabel: 'Recorded MuPDF render of this file, 72 dpi' },
  raster: { id: 'raster', label: 'Raster-only control', short: 'Raster', file: 'output/pdf/01-poem-raster.pdf', preview: 'evidence/previews/01-poem-visible.webp', previewLabel: 'Recorded MuPDF render of the visible-mapping file. This raster PDF embeds those pixels; no separate preview of it was stored' },
}
export const READING_ORDER: Reading[] = ['other', 'visible', 'direct', 'raster']

export interface Lab {
  data: LabData | null
  poems: PoemsEvidence | null
  fixtures: Partial<Record<Reading, TwoPoemFixture>>
  transforms: TransformsSummary | null
  errors: string[]
}

function load(): Lab {
  const errors: string[] = []
  let data: LabData | null = null
  try { data = parseLabData(labJson) } catch (e) { return { data: null, poems: null, fixtures: {}, transforms: null, errors: [(e as Error).message] } }
  for (const info of Object.values(READING_INFO)) {
    const a = data.artefacts.get(info.file)
    if (!a) errors.push(`${info.file} is missing from the inventory`)
    else if (a.integrity === 'mismatch') errors.push(`${info.file} does not match its manifest hash; its evidence is not shown`)
    if (!data.artefacts.get(info.preview)?.url) errors.push(`${info.preview} was not published`)
  }
  let poems: PoemsEvidence | null = null
  const report = data.evidence.get(EVIDENCE_PATH)
  if (!report || report.raw === null) errors.push(`${EVIDENCE_PATH} could not be read${report?.error ? `: ${report.error}` : ''}`)
  else {
    try {
      poems = parsePoemsResults(report.raw, { sourceCommit: data.source.commit, currentSha256: (r) => data!.artefacts.get(READING_INFO[r].file)?.sha256 ?? null })
    } catch (e) { errors.push((e as Error).message) }
  }
  const fixtures: Lab['fixtures'] = {}
  for (const r of ['visible', 'other', 'direct'] as const) {
    const text = data.fixtures.get(READING_INFO[r].file)
    if (!text) { errors.push(`${READING_INFO[r].file} bytes were not ingested`); continue }
    try { fixtures[r] = parseTwoPoemFixture(text) } catch (e) { errors.push(`${READING_INFO[r].file}: ${(e as Error).message}`) }
  }
  let transforms: TransformsSummary | null = null
  const tr = data.evidence.get(TRANSFORMS_PATH)
  if (tr?.raw) {
    try {
      transforms = parseSourceRenders(tr.raw, data.source.commit)
      // A stored render whose input no longer matches the served file is dropped, not shown as current.
      transforms.renders = transforms.renders.filter((r) => r.inputSha256 === data!.artefacts.get(READING_INFO[r.reading].file)?.sha256 && data!.artefacts.get(r.preview)?.url)
    } catch (e) { errors.push((e as Error).message) }
  } else errors.push(`${TRANSFORMS_PATH} could not be read`)
  return { data, poems, fixtures, transforms, errors }
}

export const lab: Lab = load()

export const artefactFor = (r: Reading): Artefact | undefined => lab.data?.artefacts.get(READING_INFO[r].file)
export const previewUrl = (r: Reading): string | undefined => lab.data?.artefacts.get(READING_INFO[r].preview)?.url
export const runsFor = (r: Reading): PoemRuns | undefined => lab.poems?.runs[r]
/** A run whose input no longer matches the served file is not shown as evidence about it. */
export const usableRuns = (r: Reading): PoemRuns | undefined => {
  const runs = runsFor(r)
  return runs && runs.mupdf.status !== 'stale-input' && artefactFor(r)?.integrity !== 'mismatch' ? runs : undefined
}

const ref = (path: string, pointer?: string): EvidenceRef => ({ path, sourceCommit: lab.data?.source.commit ?? null, ...(pointer ? { pointer } : {}) })

/** The four drawn lines are the same in every vector file; take them from the visible fixture. */
export function drawnLines(): string[] {
  const f = lab.fixtures.visible
  return f ? f.lines.map((l) => l.drawn) : []
}

/** Lines the character map of a reading carries; null where the file has no map. */
export function mappedLines(r: Reading): string[] | null {
  const f = r === 'raster' ? undefined : lab.fixtures[r]
  return f?.kind === 'type3-mapped' ? f.lines.map((l) => l.mapped) : null
}

export function selectLine(r: Reading, index: number): Selection | null {
  const artefact = artefactFor(r)
  if (!artefact || index < 0 || index > 3) return null
  const runs = usableRuns(r)
  const fx = r === 'raster' ? undefined : lab.fixtures[r]
  const file = READING_INFO[r].file
  const correspondences: Correspondence[] = []
  let region: Selection['region']
  let regionOrigin: Selection['regionOrigin'] = 'authored'
  const objectRefs: string[] = []
  const drawn = drawnLines()[index] ?? null
  if (fx?.kind === 'type3-mapped') {
    const line = fx.lines[index]!
    const [, llY, urX, urY] = fx.fontBBox
    region = { page: 1, pageWidth: PAGE.width, pageHeight: PAGE.height, x: line.x, y: line.y + llY, width: urX, height: urY - llY }
    regionOrigin = 'declared-bbox'
    objectRefs.push(`object ${fx.contentObject}: <${line.code}> Tj at ${line.x} ${line.y}`, `object ${line.charProcObject}: /${line.glyphName}`, `object ${fx.toUnicodeObject}: ToUnicode`)
    correspondences.push(
      { from: 'Highlighted region', to: `code <${line.code}>`, kind: 'parsed', statement: `The page places code <${line.code}> at (${line.x}, ${line.y}); the box is the font's declared FontBBox, not measured ink.`, evidence: [ref(file)] },
      { from: `code <${line.code}>`, to: 'what you see', kind: 'parsed', statement: `Glyph /${line.glyphName} (object ${line.charProcObject}) paints “${line.drawn}” with Helvetica.`, evidence: [ref(file), ref('poems.py')] },
      { from: `code <${line.code}>`, to: 'what the file says it means', kind: 'parsed', statement: `ToUnicode (object ${fx.toUnicodeObject}) maps <${line.code}> to “${line.mapped}”`, evidence: [ref(file)] },
    )
  } else if (fx?.kind === 'direct-text') {
    const line = fx.lines[index]!
    region = { page: 1, pageWidth: PAGE.width, pageHeight: PAGE.height, x: line.x, y: line.y - 7, width: 500, height: 30 }
    objectRefs.push(`object ${fx.contentObject}: ${line.operator.trim()}`)
    correspondences.push({ from: 'Highlighted region', to: 'text operator', kind: 'parsed', statement: `The content stream shows “${line.drawn}” as ordinary 22 pt Helvetica text at (${line.x}, ${line.y}). The box is a workbench guide.`, evidence: [ref(file)] })
  } else {
    const y = 540 - 58 * index
    region = { page: 1, pageWidth: PAGE.width, pageHeight: PAGE.height, x: 48, y: y - 8, width: 500, height: 38 }
    correspondences.push({ from: 'Highlighted region', to: 'image pixels', kind: 'authored', statement: 'This file holds one image and no text objects. The box marks where the line sits in the recorded picture; nothing in the file says so.', evidence: [ref('check-poems.py')] })
  }
  const expected = r === 'raster' ? null : (mappedLines(r)?.[index] ?? drawn)
  if (runs && expected) {
    for (const run of [runs.mupdf, runs.pdftotext]) {
      const found = containsLine(run.text, expected)
      const name = `${run.instrument.engine} (${run.instrument.wrapper})`
      correspondences.push({
        from: 'what the file says it means', to: name, kind: 'measured',
        statement: found ? `${name} returned “${expected}”${run.instrument.wrapper === 'pdftotext' ? '; present, but its line order differs from the page' : ''}` : `${name} did not return “${expected}”.`,
        evidence: [run.evidence],
      })
    }
  } else if (runs && r === 'raster') {
    correspondences.push({ from: 'image pixels', to: 'extracted text', kind: 'measured', statement: `MuPDF returned ${runs.mupdf.text?.trim() ? 'text' : 'no text'}; pdftotext returned ${runs.pdftotext.stdout.replace(/\f/g, '').trim() ? 'text' : 'no text'}. OCR was not run.`, evidence: [runs.mupdf.evidence, runs.pdftotext.evidence] })
  } else {
    correspondences.push({ from: 'file', to: 'engines', kind: 'unknown', statement: 'No usable recorded run for this file.', evidence: [] })
  }
  correspondences.push({ from: 'engine text', to: 'copy and paste in a PDF viewer', kind: 'unknown', statement: 'Native viewer copy/paste was not run; the report lists it under not_run.', evidence: [ref(EVIDENCE_PATH, '/not_run')] })
  return { specimenId: SPECIMEN_ID, artefactSha256: artefact.sha256, region, regionOrigin, objectRefs, correspondences }
}

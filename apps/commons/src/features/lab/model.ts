// Reuse the standalone workbench's data and parsers; this file only adapts them to the German UI.
import { artefactFor, drawnLines, lab, previewUrl, READING_INFO, selectLine, selectVariantLine, usableRuns } from '../../../../../sideprojects/pdf-lab/workbench/src/features/twoPoems/model'
import { containsLine } from '../../../../../sideprojects/pdf-lab/workbench/src/adapters/poemsResults'
import { changedObjects, parseTwoPoemFixture, readObjects, type TwoPoemFixture } from '../../../../../sideprojects/pdf-lab/workbench/src/adapters/twoPoemFixture'
import { makeRecipe } from '../../../../../sideprojects/pdf-lab/workbench/src/adapters/recipe'
import type { MappingRecipe, Run, Selection } from '../../../../../sideprojects/pdf-lab/workbench/src/domain/types'
import type { Probe, Reader } from './state'
export { lab, drawnLines }
export interface GeneratedReading {
  bytes: Uint8Array; recipe: MappingRecipe; fixture: TwoPoemFixture; text: string
  changed: Array<{ number: number; role: string }>
}
export interface Specimen {
  id: Probe; name: string; file: string; path: string; preview?: string; original?: string
  fixture?: TwoPoemFixture; rawPdf: string; run?: Run; generated: boolean; sha256?: string
  selection: (line: number) => Selection | null
}
export function specimen(id: Probe, reader: Reader, generated?: GeneratedReading): Specimen {
  if (id === 'meine') return {
    id, name: 'Meine Lesart', file: 'meine-lesart.pdf', path: '', preview: previewUrl('visible'),
    fixture: generated?.fixture, rawPdf: generated?.text ?? '', generated: true,
    sha256: generated?.recipe.output.sha256,
    selection: line => generated ? selectVariantLine(generated.fixture, generated.recipe.output.sha256, line) : null,
  }
  const reading = id === 'a' ? 'visible' : 'other'
  const asset = artefactFor(reading)
  const candidate = usableRuns(reading)?.[reader]
  return {
    id, name: `Gedicht ${id.toUpperCase()}`, file: READING_INFO[reading].file.split('/').at(-1)!,
    path: READING_INFO[reading].file, preview: asset?.integrity === 'mismatch' ? undefined : previewUrl(reading),
    original: asset?.url, fixture: asset?.integrity === 'mismatch' ? undefined : lab.fixtures[reading],
    rawPdf: lab.data?.fixtures.get(READING_INFO[reading].file) ?? '',
    run: candidate?.status === 'ok' ? candidate : undefined, generated: false, sha256: asset?.sha256,
    selection: line => selectLine(reading, line),
  }
}
export function mappedLine(s: Specimen, line: number): string | null {
  return s.fixture?.kind === 'type3-mapped' ? s.fixture.lines[line]?.mapped ?? null : null
}
export function measuredLine(s: Specimen, line: number): string | null {
  const expected = mappedLine(s, line)
  if (!expected || !s.run || containsLine(s.run.text, expected) !== true) return null
  // Preserve the actual characters returned by this reader. Spacing/order is kept in raw output.
  const normalized = s.run.text!.replace(/\s+/g, ' ')
  const needle = expected.replace(/\s+/g, ' ')
  const start = normalized.indexOf(needle)
  return normalized.slice(start, start + needle.length)
}
export function contentExcerpt(s: Specimen, line: number): string {
  const fx = s.fixture
  if (fx?.kind !== 'type3-mapped') return 'nicht erfasst'
  const l = fx.lines[line]
  const stream = readObjects(s.rawPdf).find(o => o.number === fx.contentObject)?.stream
  const operator = stream?.split('\n').find(row => row.includes(`<${l.code}> Tj`))
  const mapping = fx.toUnicodeStream.split('\n').find(row => row.startsWith(`<${l.code}>`))
  return `Inhaltsstrom · Objekt ${fx.contentObject}\n${operator ?? 'nicht erfasst'}\n\nCharProcs /${l.glyphName} · Objekt ${l.charProcObject}\n${l.charProcStream}\n\nToUnicode · Objekt ${fx.toUnicodeObject}\n${mapping ?? 'nicht erfasst'}`
}
export async function generateReading(lines: [string, string, string, string]): Promise<GeneratedReading> {
  const parent = artefactFor('visible')
  const source = lab.data?.fixtures.get(READING_INFO.visible.file)
  if (!parent || parent.integrity === 'mismatch' || !source) throw new Error('Die Ausgangsdatei konnte nicht geprüft werden.')
  const parentBytes = Uint8Array.from(source, c => c.charCodeAt(0))
  const result = await makeRecipe({ path: parent.path, sha256: parent.sha256, bytes: parentBytes }, lines)
  const text = new TextDecoder('latin1').decode(result.bytes)
  const fixture = parseTwoPoemFixture(text)
  const changed = changedObjects(source, text)
  if (fixture.kind !== 'type3-mapped' || changed.some(o => o.number !== fixture.toUnicodeObject)) throw new Error('Die Zeichnung wurde verändert; das Referenzbild darf nicht verwendet werden.')
  return { ...result, fixture, text, changed }
}

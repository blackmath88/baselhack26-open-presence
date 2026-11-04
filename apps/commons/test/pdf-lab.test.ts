import { describe, expect, it } from 'vitest'
import { generateReading, lab, mappedLine, measuredLine, specimen } from '../src/features/lab/model'
import { validateLabSearch, labState } from '../src/features/lab/state'

describe('Aurora PDF Lab real evidence boundary', () => {
  it('ingests intact specimens with real whole-line glyphs and both recorded readers', () => {
    expect(lab.errors).toEqual([])
    for (const id of ['a', 'b'] as const) for (const reader of ['mupdf', 'pdftotext'] as const) {
      const s = specimen(id, reader)
      expect(s.run?.inputSha256).toBe(s.sha256)
      expect(s.fixture?.kind).toBe('type3-mapped')
      if (s.fixture?.kind !== 'type3-mapped') throw Error('Missing real fixture')
      expect(s.fixture.lines.map(line => line.code)).toEqual(['41', '42', '43', '44'])
      for (let i = 0; i < 4; i++) {
        expect(measuredLine(s, i)).toBe(mappedLine(s, i))
        expect(s.selection(i)?.regionOrigin).toBe('declared-bbox')
      }
    }
  })
  it('does not substitute mapping text when a reader did not return it', () => {
    const s = specimen('b', 'pdftotext')
    expect(measuredLine({ ...s, run: undefined }, 0)).toBeNull()
    expect(measuredLine({ ...s, run: { ...s.run!, text: 'unrelated reader output' } }, 0)).toBeNull()
  })
  it('produces reproducible real bytes, changes only ToUnicode, and never inherits a reader run', async () => {
    const lines: [string, string, string, string] = ['A tide waits under the floor.', 'The house remembers the sea.', 'I open a door in a whisper.', 'Water comes looking for me.']
    const a = await generateReading(lines), b = await generateReading(lines)
    expect(a.bytes).toEqual(b.bytes)
    expect(a.recipe.output.sha256).toBe(b.recipe.output.sha256)
    expect(a.changed.map(o => o.number)).toEqual([9])
    const s = specimen('meine', 'mupdf', a)
    expect(s.generated).toBe(true)
    expect(s.run).toBeUndefined()
    expect(mappedLine(s, 2)).toBe(lines[2])
    expect(measuredLine(s, 2)).toBeNull()
    expect(s.selection(2)?.artefactSha256).toBe(a.recipe.output.sha256)
  })
  it('rejects unsupported writing instead of producing a pretend specimen', async () => {
    await expect(generateReading(['', 'two', 'three', 'four'])).rejects.toThrow()
    await expect(generateReading(['Grüsse', 'two', 'three', 'four'])).rejects.toThrow()
  })
  it('restores the documented URL and rejects malformed recipe parameters', () => {
    const search = validateLabSearch({ probe: 'b', ansicht: 'zeichen', zeile: '3', durchsicht: '100', vergleich: '1', fokus: '1' })
    expect(labState(search)).toMatchObject({ probe: 'b', view: 'zeichen', line: 2, xray: 100, compare: true, focus: true })
    expect(validateLabSearch({ zeile: -5, durchsicht: 900, ansicht: 'unknown', rezept: ['a'] })).toEqual({ zeile: 1, durchsicht: 100 })
    expect(validateLabSearch({ rezept: ['a', 'b', 'c', 'd'], probe: 'meine' }).rezept).toHaveLength(4)
  })
})

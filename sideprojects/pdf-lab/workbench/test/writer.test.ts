// The ported writer must equal the legacy browser writer byte for byte, and the Python generator
// where Python is available. Recipes must round-trip to the same hash.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EvidenceError } from '../src/domain/check'
import { WriterRejected, bend, sha256Hex } from '../src/adapters/mappingWriter'
import { makeRecipe, parseRecipe } from '../src/adapters/recipe'
import { parseTwoPoemFixture } from '../src/adapters/twoPoemFixture'

const LAB = fileURLToPath(new URL('../../', import.meta.url))
const legacy = createRequire(import.meta.url)(join(LAB, 'poems.js')) as { bend: (s: Uint8Array, l: string[]) => Uint8Array }
const other = new Uint8Array(readFileSync(join(LAB, 'output/pdf/01-poem-other.pdf')))
const visible = new Uint8Array(readFileSync(join(LAB, 'output/pdf/01-poem-visible.pdf')))
const CANON = ['I keep a tide beneath my tongue.', 'The silence carries paper boats.', 'A word slips free before a song.', 'The shore was listening so long.']
const sha = (b: Uint8Array) => sha256Hex(b)

// Deterministic sample of valid inputs: lengths 1–32 over the whole printable range.
function samples(n: number): string[][] {
  let seed = 7
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
  return Array.from({ length: n }, () => Array.from({ length: 4 }, () => Array.from({ length: 1 + Math.floor(rnd() * 32) }, () => String.fromCharCode(32 + Math.floor(rnd() * 95))).join('')))
}

describe('ported writer vs legacy poems.js', () => {
  it('reproduces the canonical alternate PDF byte for byte, from either mapped parent', () => {
    expect(Buffer.from(bend(other, CANON)).equals(Buffer.from(other))).toBe(true)
    expect(Buffer.from(bend(visible, CANON)).equals(Buffer.from(other))).toBe(true)
  })
  it('matches the legacy writer on 40 varied inputs, including escapes and brackets', () => {
    const inputs = [['ONE', 'TWO', 'THREE', 'FOUR'], ['(a)', '\\b', '<41>', '%%EOF'], ...samples(38)]
    for (const lines of inputs) expect(Buffer.from(bend(other, lines)).equals(Buffer.from(legacy.bend(other, lines)))).toBe(true)
  })
  it('rejects exactly what the legacy writer rejects', () => {
    for (const bad of [[], ['a', 'b', 'c'], ['a', 'b', 'c', ''], ['a', 'b', 'c', 'x'.repeat(33)], ['a', 'b', 'c', '\n'], ['a', 'b', 'c', 'é']]) {
      expect(() => bend(other, bad)).toThrow(WriterRejected)
      expect(() => legacy.bend(other, bad)).toThrow()
    }
    expect(() => bend(new Uint8Array(17000), CANON)).toThrow(WriterRejected)
    expect(() => bend(new Uint8Array(readFileSync(join(LAB, 'output/pdf/01-poem-raster.pdf'))), CANON)).toThrow(WriterRejected)
  })
  it('changes only the mapping, which the fixture parser then reads back', () => {
    const out = parseTwoPoemFixture(Array.from(bend(other, ['ONE', 'TWO', 'THREE', 'FOUR']), (b) => String.fromCharCode(b)).join(''))
    expect(out.kind === 'type3-mapped' && out.lines.map((l) => [l.drawn, l.mapped])).toEqual([
      ['I leave a lamp beside the rain.', 'ONE'], ['The window gathers little seas.', 'TWO'], ['A moth rehearses being flame.', 'THREE'], ['Dark gives each wing a name.', 'FOUR'],
    ])
  })
})

describe('ported writer vs the Python generator', () => {
  let python = true
  try { execFileSync('python3', ['-c', 'import sys; sys.exit(0)']) } catch { python = false }
  it.skipIf(!python)('matches `lab.py poem` for custom lines (temporary output only)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wb-poem-'))
    try {
      const lines = ['A tide waits under the floor.', 'The house remembers the sea.', 'I open a door in a whisper.', 'Water comes looking for me.']
      execFileSync('python3', ['lab.py', 'poem', '--lines', ...lines, '--out', join(dir, 'poem.pdf')], { cwd: LAB })
      expect(Buffer.from(bend(other, lines)).equals(readFileSync(join(dir, 'poem.pdf')))).toBe(true)
      const record = JSON.parse(readFileSync(join(dir, 'poem.json'), 'utf8'))
      expect(parseRecipe(record)).toMatchObject({ format: 'lab.py poem', lines, parent: null })
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })
})

describe('recipes', () => {
  const parent = async (bytes: Uint8Array) => ({ path: 'output/pdf/01-poem-other.pdf', sha256: await sha(other), bytes })
  it('round-trip: the saved recipe rebuilds the same bytes', async () => {
    const { recipe, bytes } = await makeRecipe(await parent(other), ['ONE', 'TWO', 'THREE', 'FOUR'])
    const back = parseRecipe(JSON.parse(JSON.stringify(recipe)))
    expect(back.format).toBe('workbench-v1')
    expect(await sha(bend(other, back.lines))).toBe(back.outputSha256)
    expect(recipe.output.sha256).toBe(await sha(bytes))
    expect(recipe.parent.sha256).toBe(await sha(other))
  })
  it('refuses to write from parent bytes that do not match the inventory', async () => {
    const tampered = other.slice(); tampered[100] = tampered[100]! ^ 1
    await expect(makeRecipe(await parent(tampered), CANON)).rejects.toThrow(/nothing was written/)
  })
  it('rejects a future schema, bad lines and unrelated JSON', () => {
    const base = { schema: 'pdf-lab.two-poems.mapping-recipe', schemaVersion: 1, lines: CANON, parent: { path: 'p', sha256: 'a'.repeat(64), bytes: 1 }, output: { sha256: 'b'.repeat(64), bytes: 1 } }
    expect(() => parseRecipe({ ...base, schemaVersion: 2 })).toThrow(/newer than this workbench/)
    expect(() => parseRecipe({ ...base, lines: ['a', 'b', 'c', 'é'] })).toThrow(EvidenceError)
    expect(() => parseRecipe({ hello: 'world' })).toThrow(/not a two-poem mapping recipe/)
  })
})

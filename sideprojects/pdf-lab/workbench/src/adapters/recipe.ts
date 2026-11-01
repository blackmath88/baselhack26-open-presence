// Mapping recipes: make one from a build, read one back (the workbench's own v1, or the CLI's
// `lab.py poem` JSON), and rebuild it to check the recorded output hash.
import type { MappingRecipe } from '../domain/types'
import { EvidenceError, arr, num, obj, sha, str } from '../domain/check'
import { bend, lineProblem, sha256Hex } from './mappingWriter'

export const RECIPE_SCHEMA = 'pdf-lab.two-poems.mapping-recipe'

export async function makeRecipe(parent: { path: string; sha256: string; bytes: Uint8Array }, lines: readonly string[]): Promise<{ recipe: MappingRecipe; bytes: Uint8Array }> {
  const actual = await sha256Hex(parent.bytes)
  if (actual !== parent.sha256) throw new EvidenceError(parent.path, `parent bytes hash to ${actual.slice(0, 12)}…, the inventory says ${parent.sha256.slice(0, 12)}…; nothing was written`)
  const bytes = bend(parent.bytes, lines)
  return {
    bytes,
    recipe: {
      schema: RECIPE_SCHEMA, schemaVersion: 1, operation: 'replace-tounicode-lines',
      writer: { id: 'workbench/mappingWriter', parityWith: 'sideprojects/pdf-lab/poems.js bend()' },
      parent: { path: parent.path, sha256: parent.sha256, bytes: parent.bytes.length },
      lines: [lines[0]!, lines[1]!, lines[2]!, lines[3]!],
      output: { sha256: await sha256Hex(bytes), bytes: bytes.length },
    },
  }
}

const fourLines = (v: unknown, path: string): [string, string, string, string] => {
  const lines = arr(v, path).map((x, i) => str(x, `${path}/${i}`))
  if (lines.length !== 4) throw new EvidenceError(path, `expected four lines, found ${lines.length}`)
  lines.forEach((l, i) => { const p = lineProblem(l); if (p) throw new EvidenceError(`${path}/${i}`, `line ${i + 1}: ${p}`) })
  return [lines[0]!, lines[1]!, lines[2]!, lines[3]!]
}

/** What a recipe file claims. `parent` is null for CLI recipes, which do not record one. */
export interface ImportedRecipe {
  format: 'workbench-v1' | 'lab.py poem'
  lines: [string, string, string, string]
  parent: MappingRecipe['parent'] | null
  outputSha256: string
}

export function parseRecipe(input: unknown): ImportedRecipe {
  const r = obj(input, 'recipe')
  if (r.schema === RECIPE_SCHEMA) {
    const version = num(r.schemaVersion, 'recipe/schemaVersion')
    if (version !== 1) throw new EvidenceError('recipe/schemaVersion', `version ${version} is newer than this workbench understands (1)`)
    const parent = obj(r.parent, 'recipe/parent')
    const output = obj(r.output, 'recipe/output')
    return {
      format: 'workbench-v1', lines: fourLines(r.lines, 'recipe/lines'),
      parent: { path: str(parent.path, 'recipe/parent/path'), sha256: sha(parent.sha256, 'recipe/parent/sha256'), bytes: num(parent.bytes, 'recipe/parent/bytes') },
      outputSha256: sha(output.sha256, 'recipe/output/sha256'),
    }
  }
  if (r.generator === 'poems.poem') {
    return { format: 'lab.py poem', lines: fourLines(r.mapping, 'recipe/mapping'), parent: null, outputSha256: sha(r.sha256, 'recipe/sha256') }
  }
  throw new EvidenceError('recipe', 'not a two-poem mapping recipe (expected the workbench schema or a lab.py poem record)')
}

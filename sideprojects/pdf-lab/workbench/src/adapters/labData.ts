// Adapter for src/generated/lab-data.json (written by scripts/ingest.mjs): validates the inventory,
// decides integrity per artefact, and keeps raw evidence documents beside their hashes.
import type { Artefact } from '../domain/types'
import { EvidenceError, arr, isObject, num, obj, optNum, optStr, sha, str, strings } from '../domain/check'

export const SUPPORTED_SCHEMA = 1

export interface LegacyExhibit {
  anchor: string
  eyebrow: string | null
  headline: string | null
  preview: string | null
  files: string[]
}

export interface LabData {
  source: { root: string; commit: string | null; dirty: boolean | null }
  artefacts: Map<string, Artefact>
  /** Groups of paths whose bytes are identical (same SHA-256). */
  sameBytes: string[][]
  evidence: Map<string, { sha256: string | null; raw: unknown; error: string | null }>
  fixtures: Map<string, string>
  legacy: LegacyExhibit[]
  problems: Array<{ path: string; problem: string }>
}

export function parseLabData(input: unknown): LabData {
  const root = obj(input, 'lab-data')
  const version = num(root.schemaVersion, 'lab-data/schemaVersion')
  if (version !== SUPPORTED_SCHEMA) {
    throw new EvidenceError('lab-data/schemaVersion', `schema ${version} is not supported by this workbench (expects ${SUPPORTED_SCHEMA}); re-run npm run ingest or update the workbench`)
  }
  const src = obj(root.source, 'lab-data/source')
  const artefacts = new Map<string, Artefact>()
  arr(root.artefacts, 'lab-data/artefacts').forEach((raw, i) => {
    const p = `lab-data/artefacts/${i}`
    const a = obj(raw, p)
    const path = str(a.path, `${p}/path`)
    if (artefacts.has(path)) throw new EvidenceError(p, `duplicate inventory entry for ${path}`)
    const digest = sha(a.sha256, `${p}/sha256`)
    const listed = arr(a.listed, `${p}/listed`).map((l, j) => {
      const e = obj(l, `${p}/listed/${j}`)
      return { manifest: str(e.manifest, `${p}/listed/${j}/manifest`), sha256: optStr(e.sha256, `${p}/listed/${j}/sha256`), bytes: optNum(e.bytes, `${p}/listed/${j}/bytes`) }
    })
    const bytes = num(a.bytes, `${p}/bytes`)
    const integrity: Artefact['integrity'] = listed.length === 0 ? 'unlisted'
      : listed.every((l) => l.sha256 === digest && (l.bytes === null || l.bytes === bytes)) ? 'verified' : 'mismatch'
    artefacts.set(path, {
      id: path, path, sha256: digest, bytes, mediaType: str(a.mediaType, `${p}/mediaType`), listed, integrity,
      ...(typeof a.url === 'string' && a.url.startsWith('/lab/') ? { url: a.url } : {}),
    })
  })
  const byHash = new Map<string, string[]>()
  for (const a of artefacts.values()) byHash.set(a.sha256, [...(byHash.get(a.sha256) ?? []), a.path])
  const evidence = new Map<string, { sha256: string | null; raw: unknown; error: string | null }>()
  for (const [path, value] of Object.entries(obj(root.evidence, 'lab-data/evidence'))) {
    const e = obj(value, `lab-data/evidence/${path}`)
    evidence.set(path, { sha256: optStr(e.sha256, `lab-data/evidence/${path}/sha256`), raw: e.raw ?? null, error: optStr(e.error, `lab-data/evidence/${path}/error`) })
  }
  const fixtures = new Map(Object.entries(obj(root.fixtures, 'lab-data/fixtures')).map(([k, v]) => [k, str(v, `lab-data/fixtures/${k}`)]))
  const legacy = arr(root.legacy, 'lab-data/legacy').map((raw, i) => {
    const e = obj(raw, `lab-data/legacy/${i}`)
    return { anchor: str(e.anchor, `lab-data/legacy/${i}/anchor`), eyebrow: optStr(e.eyebrow, ''), headline: optStr(e.headline, ''), preview: optStr(e.preview, ''), files: strings(e.files, `lab-data/legacy/${i}/files`) }
  })
  const problems = arr(root.problems, 'lab-data/problems').map((p) => (isObject(p) ? { path: String(p.path), problem: String(p.problem) } : { path: '?', problem: String(p) }))
  return {
    source: { root: str(src.root, 'lab-data/source/root'), commit: optStr(src.commit, 'lab-data/source/commit'), dirty: typeof src.dirty === 'boolean' ? src.dirty : null },
    artefacts,
    sameBytes: [...byHash.values()].filter((g) => g.length > 1),
    evidence,
    fixtures,
    legacy,
    problems,
  }
}

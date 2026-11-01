// Adapter for evidence/poems-transforms.json, limited to what Batch A shows: the "source" operation
// rows, whose MuPDF and Poppler renders of the unchanged files were stored as previews. Rewrites,
// clones and rasterisation (phase 4) are not read here.
import type { EvidenceRef } from '../domain/types'
import { arr, obj, optNum, optStr, sha, str } from '../domain/check'

export const TRANSFORMS_PATH = 'evidence/poems-transforms.json'

export interface SourceRender {
  reading: 'visible' | 'other'
  inputSha256: string
  engine: 'mupdf' | 'poppler'
  preview: string
  pixelsSha256: string | null
  width: number | null
  height: number | null
  evidence: EvidenceRef
}

export interface TransformsSummary {
  versions: Record<string, string>
  dpi: number | null
  renders: SourceRender[]
}

export function parseSourceRenders(input: unknown, sourceCommit: string | null): TransformsSummary {
  const P = 'poems-transforms'
  const root = obj(input, P)
  const versions = Object.fromEntries(Object.entries(obj(root.versions, `${P}/versions`)).map(([k, v]) => [k, str(v, `${P}/versions/${k}`)]))
  const settings = obj(root.settings, `${P}/settings`)
  const renders: SourceRender[] = []
  arr(root.rows, `${P}/rows`).forEach((raw, i) => {
    const row = obj(raw, `${P}/rows/${i}`)
    if (row.operation !== 'source') return
    const reading = str(row.reading, `${P}/rows/${i}/reading`)
    if (reading !== 'visible' && reading !== 'other') return
    const prefix = str(row.preview_prefix, `${P}/rows/${i}/preview_prefix`)
    const comparison = obj(row.render_comparison, `${P}/rows/${i}/render_comparison`)
    for (const engine of ['mupdf', 'poppler'] as const) {
      const c = obj(comparison[engine], `${P}/rows/${i}/render_comparison/${engine}`)
      const observation = engine === 'mupdf' ? obj(obj(obj(row.engines, '').mupdf, '').observation, `${P}/rows/${i}/engines/mupdf/observation`) : null
      renders.push({
        reading, engine, inputSha256: sha(row.sha256, `${P}/rows/${i}/sha256`), preview: `${prefix}-${engine}.webp`,
        pixelsSha256: optStr(c.pixels_sha256, `${P}/rows/${i}/render_comparison/${engine}/pixels_sha256`),
        width: observation ? optNum(observation.width, '') : null,
        height: observation ? optNum(observation.height, '') : null,
        evidence: { path: TRANSFORMS_PATH, sourceCommit, pointer: `/rows/${i}/render_comparison/${engine}` },
      })
    }
  })
  return { versions, dpi: optNum(settings.raster_dpi, `${P}/settings/raster_dpi`), renders }
}

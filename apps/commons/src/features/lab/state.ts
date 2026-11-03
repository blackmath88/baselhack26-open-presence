export const views = ['seite', 'text', 'zeichen', 'struktur'] as const
export type LabView = typeof views[number]
export type Probe = 'a' | 'b' | 'meine'
export type Reader = 'mupdf' | 'pdftotext'
export interface LabSearch {
  probe?: Probe; ansicht?: LabView; zeile?: number; durchsicht?: number
  vergleich?: 1; fokus?: 1; leser?: Reader; zoom?: number
  // Only explicitly generated, shareable recipe text is put in the URL; unsaved inputs stay local.
  rezept?: [string, string, string, string]
}
const bounded = (value: unknown, min: number, max: number) => {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined
}
export function validateLabSearch(raw: Record<string, unknown>): LabSearch {
  const result: LabSearch = {}
  if (['a', 'b', 'meine'].includes(String(raw.probe))) result.probe = raw.probe as Probe
  if (views.includes(raw.ansicht as LabView)) result.ansicht = raw.ansicht as LabView
  for (const [key, min, max] of [['zeile', 1, 4], ['durchsicht', 0, 100], ['zoom', 60, 160]] as const) {
    const n = bounded(raw[key], min, max)
    if (n !== undefined) result[key] = n
  }
  if (raw.vergleich === 1 || raw.vergleich === '1') result.vergleich = 1
  if (raw.fokus === 1 || raw.fokus === '1') result.fokus = 1
  if (raw.leser === 'mupdf' || raw.leser === 'pdftotext') result.leser = raw.leser
  if (Array.isArray(raw.rezept) && raw.rezept.length === 4 && raw.rezept.every(s => typeof s === 'string' && /^[\x20-\x7E]{1,32}$/.test(s))) result.rezept = raw.rezept as LabSearch['rezept']
  return result
}
export const labState = (search: LabSearch) => ({
  probe: search.probe ?? 'a', view: search.ansicht ?? 'seite', line: (search.zeile ?? 1) - 1,
  xray: search.durchsicht ?? 0, compare: search.vergleich === 1, focus: search.fokus === 1,
  reader: search.leser ?? 'pdftotext', zoom: search.zoom ?? 100,
})

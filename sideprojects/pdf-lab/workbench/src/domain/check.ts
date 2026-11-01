// Small runtime checks for external JSON. TypeScript types say what we expect; these say what arrived.

export class EvidenceError extends Error {
  constructor(public readonly path: string, message: string) {
    super(`${path}: ${message}`)
    this.name = 'EvidenceError'
  }
}

export const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function obj(v: unknown, path: string): Record<string, unknown> {
  if (!isObject(v)) throw new EvidenceError(path, 'expected an object')
  return v
}
export function str(v: unknown, path: string): string {
  if (typeof v !== 'string') throw new EvidenceError(path, 'expected a string')
  return v
}
export function num(v: unknown, path: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EvidenceError(path, 'expected a number')
  return v
}
export function arr(v: unknown, path: string): unknown[] {
  if (!Array.isArray(v)) throw new EvidenceError(path, 'expected an array')
  return v
}
export const strings = (v: unknown, path: string): string[] => arr(v, path).map((x, i) => str(x, `${path}/${i}`))
export const optStr = (v: unknown, path: string): string | null => (v === undefined || v === null ? null : str(v, path))
export const optNum = (v: unknown, path: string): number | null => (v === undefined || v === null ? null : num(v, path))
export const sha = (v: unknown, path: string): string => {
  const s = str(v, path)
  if (!/^[0-9a-f]{64}$/.test(s)) throw new EvidenceError(path, 'expected a SHA-256 hex digest')
  return s
}

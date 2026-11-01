// Research records used by the workbench. Pure types: no React, no filesystem.
// Only what Batch A uses; recipes, variants and transitions arrive with the phase that needs them.

/** Where a fact came from. `path` is relative to sideprojects/pdf-lab; `pointer` is a JSON pointer. */
export interface EvidenceRef {
  path: string
  sourceCommit: string | null
  pointer?: string
}

/** Immutable bytes, identified by hash. */
export interface Artefact {
  id: string
  sha256: string
  bytes: number
  mediaType: string
  /** Source path relative to sideprojects/pdf-lab. */
  path: string
  /** Served URL when the workbench publishes the bytes; absent means "open through the legacy cabinet". */
  url?: string
  /** Every manifest that lists this file, with the hash it recorded. */
  listed: Array<{ manifest: string; sha256: string | null; bytes: number | null }>
  integrity: 'verified' | 'unlisted' | 'mismatch'
}

export interface Instrument {
  id: string
  engine: string
  /** Wrapper or tool the run invoked (e.g. PyMuPDF, pdftotext). */
  wrapper: string
  /** Exactly as reported in the evidence; null when the evidence does not say. */
  version: string | null
  wrapperVersion: string | null
  configuration: string
}

export type RunStatus = 'ok' | 'failed' | 'stale-input'

/** A historical execution, imported verbatim. Never re-stamped as a fresh run. */
export interface Run {
  id: string
  operation: 'extract-text' | 'render-and-extract' | 'render'
  instrument: Instrument
  inputSha256: string
  status: RunStatus
  command: string[]
  exitCode: number
  stdout: string
  stderr: string
  /** Normalised result; raw stdout is kept alongside. */
  text: string | null
  pixelsSha256: string | null
  evidence: EvidenceRef
  /** "recorded": imported from a committed report. Batch A has no live runs. */
  origin: 'recorded'
  limits: Record<string, number> | null
}

/** How sure a link between two things is, and why. One chain has many links of different kinds. */
export type CorrespondenceKind = 'authored' | 'parsed' | 'measured' | 'inferred' | 'unknown'

export interface Correspondence {
  from: string
  to: string
  kind: CorrespondenceKind
  /** One sentence a newcomer can read. */
  statement: string
  evidence: EvidenceRef[]
}

/** PDF user space, origin bottom-left, in points. Page size always travels with the region. */
export interface PageRegion {
  page: number
  pageWidth: number
  pageHeight: number
  x: number
  y: number
  width: number
  height: number
}

export interface Selection {
  specimenId: string
  artefactSha256: string
  region: PageRegion
  /**
   * Never native PDF text selection. "declared-bbox": the glyph's Tm placement plus the font's
   * declared FontBBox, parsed from the file (declared extent, not measured ink). "authored": a
   * guide written by this workbench where the file declares no box.
   */
  regionOrigin: 'declared-bbox' | 'authored'
  objectRefs: string[]
  correspondences: Correspondence[]
}

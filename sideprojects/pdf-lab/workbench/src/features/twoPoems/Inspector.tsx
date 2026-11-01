// Contextual inspector for one selected line: what you see, what the file says it means, what the
// recorded readers returned, and how each link in that chain is known.
import { forwardRef } from 'react'
import type { Reading } from '../../adapters/poemsResults'
import type { EvidenceRef } from '../../domain/types'
import { READING_INFO, drawnLines, lab, mappedLines, selectLine, usableRuns } from './model'

const KIND_LABEL = { authored: 'authored guide', parsed: 'parsed from the file', measured: 'recorded run', inferred: 'inferred', unknown: 'unknown' } as const

export function EvidenceLink({ evidence }: { evidence: EvidenceRef }) {
  const published = evidence.path.startsWith('evidence/') ? `/lab/${evidence.path}` : null
  const label = `${evidence.path}${evidence.pointer ? ` ${evidence.pointer}` : ''}`
  return published
    ? <a href={published} target="_blank" rel="noreferrer" className="small" title={evidence.sourceCommit ? `at ${evidence.sourceCommit}` : undefined}>{label}</a>
    : <code className="small">{label}</code>
}

export const Inspector = forwardRef<HTMLHeadingElement, { reading: Reading; line: number; onClose: () => void }>(function Inspector({ reading, line, onClose }, headingRef) {
  const index = line - 1
  const selection = selectLine(reading, index)
  const drawn = drawnLines()[index]
  const mapped = mappedLines(reading)?.[index]
  const runs = usableRuns(reading)
  const fx = reading === 'raster' ? undefined : lab.fixtures[reading]
  if (!selection || drawn === undefined) return null
  const fxLine = fx?.kind === 'type3-mapped' ? fx.lines[index] : undefined
  const tuLine = fxLine && fx?.kind === 'type3-mapped' ? fx.toUnicodeStream.split('\n').find((l) => l.startsWith(`<${fxLine.code}>`)) : undefined
  return (
    <aside className="card inspector" aria-labelledby="inspector-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <div className="inspector-head">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>{READING_INFO[reading].label}</p>
          <h2 id="inspector-title" ref={headingRef} tabIndex={-1}>Line {line}</h2>
        </div>
        <button className="btn quiet" onClick={onClose} aria-label="Close inspector">Close</button>
      </div>
      <section>
        <h3>You see</h3>
        <p className="quote">{drawn}</p>
      </section>
      <section>
        <h3>The file says it means</h3>
        {reading === 'raster'
          ? <p className="muted">Nothing. This file is one picture; it holds no character codes to map.</p>
          : mapped !== undefined
            ? <p className={`quote ${mapped !== drawn ? 'alt' : ''}`}>{mapped}</p>
            : <p className="quote">{drawn} <span className="small muted">(ordinary text; no custom map)</span></p>}
        {fxLine && tuLine && (
          <details style={{ marginTop: 8 }}>
            <summary>Show the bytes</summary>
            <p className="small muted">Glyph procedure, object {fxLine.charProcObject} (/{fxLine.glyphName}):</p>
            <pre className="excerpt">{fxLine.charProcStream}</pre>
            <p className="small muted">ToUnicode entry, object {fx?.kind === 'type3-mapped' ? fx.toUnicodeObject : ''} (UTF-16BE):</p>
            <pre className="excerpt">{tuLine}</pre>
          </details>
        )}
      </section>
      <section>
        <h3>Readers returned <span className="label">recorded</span></h3>
        {runs ? (
          <dl className="kv">
            {[runs.mupdf, runs.pdftotext].map((run) => {
              const expected = reading === 'raster' ? null : (mapped ?? drawn)
              const found = expected === null ? null : (run.text ?? '').replace(/\s+/g, ' ').includes(expected)
              return [
                <dt key={`${run.id}-t`}>{run.instrument.engine} {run.instrument.version ?? '(version not recorded)'} <span className="muted">({run.instrument.wrapper}{run.instrument.wrapperVersion ? ` ${run.instrument.wrapperVersion}` : ''})</span></dt>,
                <dd key={`${run.id}-d`}>{expected === null ? ((run.text ?? '').replace(/\f/g, '').trim() ? 'some text' : 'no text') : found ? <span className="mark-yes">“{expected}”</span> : <span className="mark-no">not returned</span>}</dd>,
              ]
            })}
          </dl>
        ) : <p className="notice warn small">No usable recorded run for this file.</p>}
      </section>
      <section>
        <h3>How we know</h3>
        <ol className="chain">
          {selection.correspondences.map((c, i) => (
            <li key={i}>
              <span className={`kind kind-${c.kind}`}>{KIND_LABEL[c.kind]}</span>
              <span>{c.statement}</span>
              {c.evidence.length > 0 && <span>{c.evidence.map((e, j) => <span key={j}>{j > 0 && ' · '}<EvidenceLink evidence={e} /></span>)}</span>}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3>Region</h3>
        <p className="small muted" style={{ margin: 0 }}>
          {selection.regionOrigin === 'declared-bbox' ? 'Placement and declared FontBBox from the file' : 'Workbench guide'}: x {selection.region.x}, y {selection.region.y}, {selection.region.width} × {selection.region.height} pt on a {selection.region.pageWidth} × {selection.region.pageHeight} pt page (origin bottom-left).
          {' '}Objects: {selection.objectRefs.join('; ') || 'none'}.
        </p>
      </section>
    </aside>
  )
})

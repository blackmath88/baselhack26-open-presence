// The document stage: a recorded render with four authored line guides on top.
// Guides are buttons (keyboard and touch), positioned in PDF points converted to percentages.
import type { Reading } from '../../adapters/poemsResults'
import { PAGE, READING_INFO, drawnLines, mappedLines, previewUrl, runsFor, selectLine } from './model'

export function Stage({ reading, line, reveal, onSelect }: { reading: Reading; line: number | null; reveal: boolean; onSelect: (index: number) => void }) {
  const src = previewUrl(reading)
  const drawn = drawnLines()
  const mapped = mappedLines(reading)
  const info = READING_INFO[reading]
  const run = runsFor(reading)?.mupdf
  return (
    <figure className="page-wrap" style={{ margin: 0 }} aria-label={`${info.label}: recorded page`}>
      <div className="page">
        {src ? <img src={src} width={PAGE.width} height={PAGE.height} alt={`${info.previewLabel}. The page shows the poem “${drawn.join(' ')}”`} /> : null}
        {drawn.map((text, i) => {
          const sel = selectLine(reading, i)
          if (!sel) return null
          const r = sel.region
          const style = {
            left: `${(r.x / r.pageWidth) * 100}%`,
            top: `${((r.pageHeight - r.y - r.height) / r.pageHeight) * 100}%`,
            width: `${(Math.min(r.width, r.pageWidth - r.x - 8) / r.pageWidth) * 100}%`,
            height: `${(r.height / r.pageHeight) * 100}%`,
          }
          const other = mapped?.[i]
          return (
            <button key={i} type="button" className="hotspot" style={style} aria-pressed={line === i + 1} data-line={i + 1}
              aria-label={`Inspect line ${i + 1}: ${text}${reveal && other !== undefined && other !== text ? ` Character map reads: ${other}` : ''}`} onClick={() => onSelect(i + 1)}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              {reveal && other !== undefined && other !== text && <span className="reveal-chip" aria-hidden="true">reads as: {other}</span>}
            </button>
          )
        })}
      </div>
      {reveal && mapped && (
        <ol className="reveal-list" aria-label="What the character map says each line means" style={{ marginTop: 12 }}>
          {drawn.map((text, i) => (
            <li key={i} className={line === i + 1 ? 'sel' : ''}>
              <span className="n">{i + 1}</span>
              <span>{text}</span>
              <span className="alt">{mapped[i] === text ? 'reads the same' : `reads as: ${mapped[i]}`}</span>
            </li>
          ))}
        </ol>
      )}
      <figcaption className="caption" style={{ marginTop: 8, width: '100%' }}>
        <span className="label">Recorded render</span>
        <span>{info.previewLabel}{run ? ` · MuPDF ${run.instrument.version ?? 'version unknown'}` : ''}. Not a live viewer. Boxes are guides, not PDF text selection.</span>
      </figcaption>
    </figure>
  )
}

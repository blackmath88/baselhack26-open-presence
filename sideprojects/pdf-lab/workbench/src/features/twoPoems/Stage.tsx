// The document stage: a recorded render with four line guides on top. Guides are buttons
// (keyboard and touch), positioned in PDF points converted to percentages. The same stage shows
// recorded specimens and files made in this browser; callers say which picture it is.
import type { ReactNode } from 'react'
import type { Reading } from '../../adapters/poemsResults'
import type { PageRegion } from '../../domain/types'
import { PAGE, READING_INFO, drawnLines, mappedLines, previewUrl, runsFor, selectLine } from './model'

export interface StageLine { drawn: string; mapped: string | null; region: PageRegion }

export function PageStage({ src, alt, caption, label, lines, line, reveal, onSelect }: {
  src: string | undefined
  alt: string
  caption: ReactNode
  label: string
  lines: StageLine[]
  line: number | null
  reveal: boolean
  onSelect: (index: number) => void
}) {
  return (
    <figure className="page-wrap" style={{ margin: 0 }} aria-label={label}>
      <div className="page">
        {src ? <img src={src} width={PAGE.width} height={PAGE.height} alt={alt} /> : null}
        {lines.map(({ drawn, mapped, region: r }, i) => {
          const style = {
            left: `${(r.x / r.pageWidth) * 100}%`,
            top: `${((r.pageHeight - r.y - r.height) / r.pageHeight) * 100}%`,
            width: `${(Math.min(r.width, r.pageWidth - r.x - 8) / r.pageWidth) * 100}%`,
            height: `${(r.height / r.pageHeight) * 100}%`,
          }
          const differs = reveal && mapped !== null && mapped !== drawn
          return (
            <button key={i} type="button" className="hotspot" style={style} aria-pressed={line === i + 1} data-line={i + 1}
              aria-label={`Inspect line ${i + 1}: ${drawn}${differs ? ` Character map reads: ${mapped}` : ''}`} onClick={() => onSelect(i + 1)}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              {differs && <span className="reveal-chip" aria-hidden="true">reads as: {mapped}</span>}
            </button>
          )
        })}
      </div>
      {reveal && lines.some((l) => l.mapped !== null) && (
        <ol className="reveal-list" aria-label="What the character map says each line means" style={{ marginTop: 12 }}>
          {lines.map((l, i) => (
            <li key={i} className={line === i + 1 ? 'sel' : ''}>
              <span className="n">{i + 1}</span>
              <span>{l.drawn}</span>
              <span className="alt">{l.mapped === l.drawn ? 'reads the same' : `reads as: ${l.mapped}`}</span>
            </li>
          ))}
        </ol>
      )}
      <figcaption className="caption" style={{ marginTop: 8, width: '100%' }}>{caption}</figcaption>
    </figure>
  )
}

/** A recorded specimen on the stage. */
export function Stage({ reading, line, reveal, onSelect }: { reading: Reading; line: number | null; reveal: boolean; onSelect: (index: number) => void }) {
  const drawn = drawnLines()
  const mapped = mappedLines(reading)
  const info = READING_INFO[reading]
  const run = runsFor(reading)?.mupdf
  const lines = drawn.flatMap((text, i) => {
    const sel = selectLine(reading, i)
    return sel ? [{ drawn: text, mapped: mapped?.[i] ?? null, region: sel.region }] : []
  })
  return (
    <PageStage src={previewUrl(reading)} label={`${info.label}: recorded page`} lines={lines} line={line} reveal={reveal} onSelect={onSelect}
      alt={`${info.previewLabel}. The page shows the poem “${drawn.join(' ')}”`}
      caption={<><span className="label">Recorded render</span><span>{info.previewLabel}{run ? ` · MuPDF ${run.instrument.version ?? 'version unknown'}` : ''}. Not a live viewer. Boxes are guides, not PDF text selection.</span></>} />
  )
}

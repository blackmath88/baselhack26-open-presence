// Text and comparison views. Both reuse the stage area and keep the selected line marked.
import type { ReactNode } from 'react'
import type { Reading } from '../../adapters/poemsResults'
import type { Run } from '../../domain/types'
import { EvidenceLink } from './Inspector'
import { READING_INFO, drawnLines, lab, mappedLines, previewUrl, usableRuns } from './model'

function highlight(text: string, needle: string | undefined): ReactNode {
  if (!needle) return text
  const at = text.indexOf(needle)
  return at < 0 ? text : <>{text.slice(0, at)}<mark>{needle}</mark>{text.slice(at + needle.length)}</>
}

function RunOutput({ run, needle }: { run: Run; needle: string | undefined }) {
  const i = run.instrument
  const text = (run.text ?? '').replace(/\f/g, '')
  return (
    <div className="card panel">
      <div className="engine-head">
        <h3>{i.engine} · {i.wrapper}</h3>
        <span className="label">recorded · exit {run.exitCode}</span>
      </div>
      <p className="small muted" style={{ marginTop: 0 }}>
        {i.engine} {i.version ?? 'version not recorded'}{i.wrapperVersion ? ` via ${i.wrapper} ${i.wrapperVersion}` : ''} · {i.configuration}
      </p>
      {text.trim() ? <pre className="text-out" tabIndex={0}>{highlight(text, needle)}</pre> : <p className="text-out muted">No text returned.</p>}
      <details style={{ marginTop: 8 }}>
        <summary>Raw run</summary>
        <dl className="kv" style={{ marginTop: 8 }}>
          <dt>Command</dt><dd><code>{run.command.map((a) => a.split('/').pop()).join(' ')}</code> <span className="muted">(paths shortened)</span></dd>
          <dt>Input SHA-256</dt><dd><code>{run.inputSha256}</code></dd>
          <dt>stderr</dt><dd>{run.stderr ? <code>{run.stderr}</code> : 'empty'}</dd>
          {run.limits && <><dt>Limits</dt><dd>{Object.entries(run.limits).map(([k, v]) => `${k} ${v}`).join(', ')}</dd></>}
          <dt>Evidence</dt><dd><EvidenceLink evidence={run.evidence} /></dd>
        </dl>
      </details>
    </div>
  )
}

export function TextView({ reading, line }: { reading: Reading; line: number | null }) {
  const runs = usableRuns(reading)
  const expected = line === null || reading === 'raster' ? undefined : (mappedLines(reading)?.[line - 1] ?? drawnLines()[line - 1])
  if (!runs) return <p className="notice warn">No usable recorded run for {READING_INFO[reading].label}.</p>
  return (
    <div className="stage card">
      <div className="stage-intro">
        <p>What two PDF readers extracted from <strong>{READING_INFO[reading].label.toLowerCase()}</strong>. {expected ? 'The selected line is marked.' : 'Select a line on the page to mark it here.'} Poppler's <code>-layout</code> output joins the mapped lines and moves them before the header; the raw text is shown as recorded.</p>
      </div>
      <div className="side-by-side">
        <RunOutput run={runs.mupdf} needle={expected} />
        <RunOutput run={runs.pdftotext} needle={expected} />
      </div>
    </div>
  )
}

export function CompareView({ line }: { line: number | null }) {
  const drawn = drawnLines()
  const visible = mappedLines('visible') ?? []
  const other = mappedLines('other') ?? []
  const v = usableRuns('visible')
  const o = usableRuns('other')
  const checks = lab.poems?.checks ?? {}
  const renders = lab.transforms?.renders ?? []
  const samePixels = v?.mupdf.pixelsSha256 && v.mupdf.pixelsSha256 === o?.mupdf.pixelsSha256
  return (
    <div className="stage card">
      <div className="stage-intro">
        <p>The visible-mapping file and the alternate file differ only in their ToUnicode stream (and the offsets after it). Same picture, different reading.</p>
      </div>
      <div className="side-by-side">
        {(['visible', 'other'] as const).map((r) => (
          <figure key={r} className="compare-fig">
            <figcaption><strong>{READING_INFO[r].label}</strong> <span className="small muted">· {READING_INFO[r].file.split('/').pop()}</span></figcaption>
            {previewUrl(r) && <img src={previewUrl(r)} width={612} height={792} alt={`Recorded MuPDF render of the ${READING_INFO[r].label.toLowerCase()} file`} />}
            <span className="small muted">MuPDF pixels <code>{usableRuns(r)?.mupdf.pixelsSha256?.slice(0, 16) ?? 'unknown'}…</code></span>
          </figure>
        ))}
      </div>
      <div className="card panel">
        <h2>Same picture?</h2>
        <ul className="check-list">
          <li className={samePixels ? 'mark-yes' : 'mark-no'}>MuPDF {lab.poems?.instruments.mupdf.version ?? ''} rendered identical pixels for both files {samePixels ? '' : '(not established)'}</li>
          <li className={checks.same_pixels_within_both_engines === true ? 'mark-yes' : 'mark-no'}>Poppler's render bytes were also identical for both (report check <code>same_pixels_within_both_engines</code>)</li>
          <li className={checks.only_mapping_object_changes === true ? 'mark-yes' : 'mark-no'}>Only the mapping object changed between the files (report check <code>only_mapping_object_changes</code>)</li>
        </ul>
        <p className="small muted">Pixel equality is within each renderer; the experiment does not claim MuPDF and Poppler draw identical pixels.</p>
      </div>
      <div className="card panel" style={{ overflowX: 'auto' }}>
        <h2>Different reading</h2>
        <table className="readings-table">
          <caption className="sr-only">Lines drawn on the page and lines each file's character map carries, with what MuPDF returned</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Drawn on the page</th><th scope="col">Visible-mapping file says</th><th scope="col">Alternate file says</th></tr></thead>
          <tbody>
            {drawn.map((d, i) => (
              <tr key={i} className={line === i + 1 ? 'sel' : ''}>
                <td>{i + 1}</td><td>{d}</td>
                <td>{visible[i]} {v && <span className={(v.mupdf.text ?? '').includes(visible[i] ?? '\0') ? 'mark-yes small' : 'mark-no small'}>MuPDF</span>}</td>
                <td>{other[i]} {o && <span className={(o.mupdf.text ?? '').includes(other[i] ?? '\0') ? 'mark-yes small' : 'mark-no small'}>MuPDF</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renders.length > 0 && (
        <div className="card panel">
          <h2>Two renderers, one file</h2>
          <p className="small muted">Stored renders of the unchanged alternate file from the transformation run ({lab.transforms?.dpi ?? '?'} dpi). Pixels are compared within an engine, never across.</p>
          <div className="side-by-side">
            {renders.filter((r) => r.reading === 'other').map((r) => {
              const url = lab.data?.artefacts.get(r.preview)?.url
              const version = r.engine === 'mupdf' ? lab.transforms?.versions.mupdf : lab.transforms?.versions.poppler
              return (
                <figure key={r.engine} className="compare-fig">
                  <figcaption><strong>{r.engine === 'mupdf' ? 'MuPDF' : 'Poppler pdftoppm'}</strong> <span className="small muted">· {r.engine === 'mupdf' ? `MuPDF ${version ?? 'unknown'}` : `Poppler (report states “${version ?? 'unknown'}”)`}</span></figcaption>
                  {url && <img src={url} alt={`Recorded ${r.engine} render of the alternate file`} loading="lazy" />}
                  <EvidenceLink evidence={r.evidence} />
                </figure>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

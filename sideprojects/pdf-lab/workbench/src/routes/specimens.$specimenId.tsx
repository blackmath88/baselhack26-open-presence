import { useEffect, useRef } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { READINGS, type Reading } from '../adapters/poemsResults'
import { READING_INFO, READING_ORDER, SPECIMEN_ID, lab } from '../features/twoPoems/model'
import { Stage } from '../features/twoPoems/Stage'
import { Inspector } from '../features/twoPoems/Inspector'
import { CompareView, TextView } from '../features/twoPoems/Readings'
import { Download } from '../features/twoPoems/Download'
import { legacyCabinetUrl, useClientValue } from '../features/legacy'

const VIEWS = ['page', 'text', 'compare'] as const
type View = (typeof VIEWS)[number]

interface SpecimenSearch {
  reading?: Reading
  line?: number
  view?: View
  reveal?: boolean
}

export const Route = createFileRoute('/specimens/$specimenId')({
  // Unknown or malformed values become undefined, so a bad link opens the default view instead of
  // failing. Every key is returned: the router spreads the raw search under this result.
  validateSearch: (raw: Record<string, unknown>): SpecimenSearch => {
    const out: SpecimenSearch = { reading: undefined, line: undefined, view: undefined, reveal: undefined }
    if (typeof raw.reading === 'string' && (READINGS as readonly string[]).includes(raw.reading)) out.reading = raw.reading as Reading
    const line = Number(raw.line)
    if (Number.isInteger(line) && line >= 1 && line <= 4) out.line = line
    if (typeof raw.view === 'string' && (VIEWS as readonly string[]).includes(raw.view)) out.view = raw.view as View
    if (raw.reveal === true || raw.reveal === 'true' || raw.reveal === 1) out.reveal = true
    return out
  },
  beforeLoad: ({ params }) => { if (params.specimenId !== SPECIMEN_ID) throw notFound() },
  head: () => ({ meta: [{ title: 'A01 Two poems · PDF LAB Workbench' }] }),
  component: Specimen,
  notFoundComponent: UnknownSpecimen,
})

function UnknownSpecimen() {
  const legacy = useClientValue(() => legacyCabinetUrl(), '')
  return (
    <div className="notice" role="alert">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>The workbench does not inspect this specimen yet.</h1>
      <p>Only A01 Two poems has an adapter so far. Every exhibit still works in the <a href={legacy || undefined} target="_blank" rel="noreferrer">legacy cabinet ↗</a>.</p>
      <p><Link to="/">Back to the cabinet</Link></p>
    </div>
  )
}

function Specimen() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const reading: Reading = search.reading ?? 'other'
  const view: View = search.view ?? 'page'
  const line = search.line ?? null
  const reveal = search.reveal ?? false
  const inspectorHeading = useRef<HTMLHeadingElement>(null)
  const lastTrigger = useRef<number | null>(null)
  const legacy = useClientValue(() => legacyCabinetUrl('poems'), '')

  // Opening a line moves focus into the inspector; closing returns it to the line's guide.
  useEffect(() => { if (line !== null && lastTrigger.current === line) inspectorHeading.current?.focus() }, [line])
  const set = (patch: SpecimenSearch, replace = false) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace })
  const select = (n: number) => { lastTrigger.current = n; set({ line: n }) }
  const close = () => {
    const n = line
    lastTrigger.current = null
    set({ line: undefined })
    requestAnimationFrame(() => (document.querySelector(`.hotspot[data-line="${n}"]`) as HTMLElement | null)?.focus())
  }

  if (!lab.data || lab.errors.length > 0 && !lab.poems) {
    return <div className="notice bad" role="alert"><strong>This specimen's evidence could not be loaded.</strong><ul>{lab.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
  }
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Cabinet</Link><span aria-hidden="true">/</span><span>A01 Two poems</span><span aria-hidden="true">/</span><span>{READING_INFO[reading].label}</span></nav>
      <div className="page-head">
        <div>
          <h1>A lamp beside the rain</h1>
          <p className="lead">Two readings. One picture.</p>
        </div>
        <Download reading={reading} />
      </div>
      {lab.errors.length > 0 && <div className="notice warn" role="status" style={{ marginBottom: 16 }}>{lab.errors.join(' ')}</div>}

      <div className="toolbar">
        <div className="toolbar-group" role="radiogroup" aria-label="File">
          <span className="toolbar-label" aria-hidden="true">File</span>
          <span className="segmented">
            {READING_ORDER.map((r) => (
              <button key={r} role="radio" aria-checked={reading === r} onClick={() => set({ reading: r })}>{READING_INFO[r].short}</button>
            ))}
          </span>
        </div>
        <div className="toolbar-group" role="tablist" aria-label="View">
          <span className="segmented">
            {VIEWS.map((v) => (
              <button key={v} role="tab" aria-selected={view === v} aria-controls="specimen-view" onClick={() => set({ view: v })}>{v === 'page' ? 'Page' : v === 'text' ? 'Extracted text' : 'Compare'}</button>
            ))}
          </span>
        </div>
      </div>

      <div className={`workspace ${line !== null ? 'inspecting' : ''}`}>
        <div id="specimen-view" role="tabpanel" style={{ minWidth: 0, display: 'grid', gap: 16 }}>
          {view === 'page' && (
            <div className="stage card">
              <div className="stage-intro">
                <p>{line === null
                  ? reveal ? 'Each line now shows what this file\'s character map says it means. Choose a line to see how that is known.' : 'Read the poem with your eyes. Then reveal what a PDF reader takes from the same four lines.'
                  : `Line ${line} is selected. Choose another line, or press Escape in the inspector to close it.`}</p>
                {reading !== 'raster' && (
                  <button className={`btn ${reveal ? '' : 'primary'}`} aria-pressed={reveal} onClick={() => set({ reveal: !reveal || undefined })}>
                    {reveal ? 'Hide the other reading' : 'Reveal the other reading'}
                  </button>
                )}
              </div>
              <Stage reading={reading} line={line} reveal={reveal} onSelect={select} />
            </div>
          )}
          {view === 'text' && <TextView reading={reading} line={line} />}
          {view === 'compare' && <CompareView line={line} />}

        </div>
        {line !== null && <Inspector key={`${reading}:${line}`} ref={inspectorHeading} reading={reading} line={line} onClose={close} />}
      </div>
      <div className="card panel" style={{ marginTop: 16 }}>
        <h2>Write your own second reading</h2>
        <p className="muted" style={{ marginTop: 4 }}>The legacy cabinet already builds a real PDF in your browser from four lines you write; the visible poem stays fixed. In-place authoring here comes in the next batch.</p>
        <a className="btn" href={legacy || undefined} target="_blank" rel="noreferrer">Open “Bend your own four lines” in the legacy cabinet ↗</a>
      </div>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { READINGS, type Reading } from '../adapters/poemsResults'
import { lineProblem } from '../adapters/mappingWriter'
import { READING_INFO, READING_ORDER, SPECIMEN_ID, lab, mappedLines } from '../features/twoPoems/model'
import { Stage } from '../features/twoPoems/Stage'
import { Inspector } from '../features/twoPoems/Inspector'
import { CompareView, TextView } from '../features/twoPoems/Readings'
import { Download } from '../features/twoPoems/Download'
import { AuthorPanel, Lineage, VariantDownload, VariantInspector, VariantStage, VariantText, useVariant, type Lines, type Parent } from '../features/twoPoems/variant'
import { legacyCabinetUrl, useClientValue } from '../features/legacy'

const VIEWS = ['page', 'text', 'compare'] as const
type View = (typeof VIEWS)[number]
/** Recorded files, or "mine": the file rebuilt from `from` + `mine` in this browser. */
type Shown = Reading | 'mine'

interface SpecimenSearch {
  reading?: Shown
  line?: number
  view?: View
  reveal?: boolean
  /** Four replacement lines; the URL is the recipe, so reload rebuilds the same bytes. */
  mine?: Lines
  from?: Parent
  /** Output hash an imported recipe recorded, to check the rebuild against. */
  expect?: string
}

export const Route = createFileRoute('/specimens/$specimenId')({
  // Unknown or malformed values become undefined, so a bad link opens the default view instead of
  // failing. Every key is returned: the router spreads the raw search under this result.
  validateSearch: (raw: Record<string, unknown>): SpecimenSearch => {
    const out: SpecimenSearch = { reading: undefined, line: undefined, view: undefined, reveal: undefined, mine: undefined, from: undefined, expect: undefined }
    if (Array.isArray(raw.mine) && raw.mine.length === 4 && raw.mine.every((l) => typeof l === 'string' && lineProblem(l) === null)) out.mine = raw.mine as Lines
    if (raw.from === 'visible' || raw.from === 'other') out.from = raw.from
    if (typeof raw.expect === 'string' && /^[0-9a-f]{64}$/.test(raw.expect)) out.expect = raw.expect
    if (typeof raw.reading === 'string' && ((READINGS as readonly string[]).includes(raw.reading) || (raw.reading === 'mine' && out.mine))) out.reading = raw.reading as Shown
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

const parentOf = (r: Shown, from: Parent | undefined): Parent => (r === 'visible' ? 'visible' : r === 'mine' ? (from ?? 'other') : 'other')

function Specimen() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const reading: Shown = search.reading ?? 'other'
  const view: View = search.view ?? 'page'
  const line = search.line ?? null
  const reveal = search.reveal ?? false
  const from = parentOf(reading, search.from)
  const inspectorHeading = useRef<HTMLHeadingElement>(null)
  const lastTrigger = useRef<number | null>(null)
  const [authorFocus, setAuthorFocus] = useState<{ line: number } | null>(null)
  const legacy = useClientValue(() => legacyCabinetUrl('poems'), '')
  const variant = useVariant(search.from ?? 'other', search.mine)
  const mine = reading === 'mine'
  const built = variant?.status === 'ready' ? variant.variant : null

  // Opening a line moves focus into the inspector; closing returns it to the line's guide.
  useEffect(() => { if (line !== null && lastTrigger.current === line) inspectorHeading.current?.focus() }, [line, built])
  const set = (patch: SpecimenSearch, replace = false) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace })
  const select = (n: number) => { lastTrigger.current = n; set({ line: n }) }
  const close = () => {
    const n = line
    lastTrigger.current = null
    set({ line: undefined })
    requestAnimationFrame(() => (document.querySelector(`.hotspot[data-line="${n}"]`) as HTMLElement | null)?.focus())
  }
  const rewrite = (n: number) => {
    setAuthorFocus({ line: n })
    requestAnimationFrame(() => document.getElementById('author')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  }
  const authorInitial: Lines = (search.mine ?? (mappedLines(from) as Lines | null) ?? ['', '', '', '']) as Lines

  if (!lab.data || lab.errors.length > 0 && !lab.poems) {
    return <div className="notice bad" role="alert"><strong>This specimen's evidence could not be loaded.</strong><ul>{lab.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
  }
  const label = mine ? 'Your file' : READING_INFO[reading].label
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Cabinet</Link><span aria-hidden="true">/</span><span>A01 Two poems</span><span aria-hidden="true">/</span><span>{label}</span></nav>
      <div className="page-head">
        <div>
          <h1>A lamp beside the rain</h1>
          <p className="lead">{mine ? 'Same picture. Your reading.' : 'Two readings. One picture.'}</p>
        </div>
        {mine ? (built ? <VariantDownload variant={built} /> : null) : <Download reading={reading} />}
      </div>
      {lab.errors.length > 0 && <div className="notice warn" role="status" style={{ marginBottom: 16 }}>{lab.errors.join(' ')}</div>}

      <div className="toolbar">
        <div className="toolbar-group" role="radiogroup" aria-label="File">
          <span className="toolbar-label" aria-hidden="true">File</span>
          <span className="segmented">
            {READING_ORDER.map((r) => (
              <button key={r} role="radio" aria-checked={reading === r} onClick={() => set({ reading: r })}>{READING_INFO[r].short}</button>
            ))}
            {search.mine && <button role="radio" aria-checked={mine} onClick={() => set({ reading: 'mine' })}>Yours</button>}
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

      {mine && variant?.status === 'error' && <div className="notice bad" role="alert" style={{ marginBottom: 16 }}><strong>Your file could not be built.</strong> {variant.message}</div>}
      {mine && built && <Lineage variant={built} {...(search.expect ? { expected: search.expect } : {})} />}

      <div className={`workspace ${line !== null && (!mine || built) ? 'inspecting' : ''}`} style={{ marginTop: mine && built ? 16 : 0 }}>
        <div id="specimen-view" role="tabpanel" style={{ minWidth: 0, display: 'grid', gap: 16 }}>
          {mine && !built && variant?.status !== 'error' && <div className="stage card"><p className="muted" role="status">Building your file from the original…</p></div>}
          {view === 'page' && (!mine || built) && (
            <div className="stage card">
              <div className="stage-intro">
                <p>{line === null
                  ? mine ? (reveal ? 'Each line shows what your character map says. Choose a line to inspect it.' : 'The picture is unchanged. Reveal what your file now says it means.')
                  : reveal ? 'Each line now shows what this file\'s character map says it means. Choose a line to see how that is known.' : 'Read the poem with your eyes. Then reveal what a PDF reader takes from the same four lines.'
                  : `Line ${line} is selected. Choose another line, or press Escape in the inspector to close it.`}</p>
                {reading !== 'raster' && (
                  <button className={`btn ${reveal ? '' : 'primary'}`} aria-pressed={reveal} onClick={() => set({ reveal: !reveal || undefined })}>
                    {reveal ? (mine ? 'Hide your reading' : 'Hide the other reading') : mine ? 'Reveal your reading' : 'Reveal the other reading'}
                  </button>
                )}
              </div>
              {mine && built ? <VariantStage variant={built} from={search.from ?? 'other'} line={line} reveal={reveal} onSelect={select} /> : !mine && <Stage reading={reading as Reading} line={line} reveal={reveal} onSelect={select} />}
            </div>
          )}
          {view === 'text' && (mine ? built && <VariantText variant={built} /> : <TextView reading={reading as Reading} line={line} />)}
          {view === 'compare' && (mine ? built && <VariantCompare lines={built.fixture.kind === 'type3-mapped' ? built.fixture.lines.map((l) => l.mapped) : []} from={search.from ?? 'other'} line={line} /> : <CompareView line={line} />)}
        </div>
        {line !== null && (mine
          ? built && <VariantInspector key={`mine:${line}`} variant={built} line={line} onClose={close} headingRef={inspectorHeading} />
          : <Inspector key={`${reading}:${line}`} ref={inspectorHeading} reading={reading as Reading} line={line} onClose={close} onRewrite={rewrite} />)}
      </div>
      <div style={{ marginTop: 16 }}>
        <AuthorPanel initial={authorInitial} focusLine={authorFocus?.line ?? null} legacyUrl={legacy}
          onBuild={(lines) => set({ mine: lines, from, reading: 'mine', expect: undefined, line: undefined, reveal: true, view: 'page' })}
          onImport={(lines, parent, expected) => set({ mine: lines, from: parent ?? 'other', reading: 'mine', expect: expected, line: undefined, reveal: true, view: 'page' })} />
      </div>
    </>
  )
}

/** Original alternate mapping beside yours, line by line. Both parsed from bytes; neither measured here. */
function VariantCompare({ lines, from, line }: { lines: string[]; from: Parent; line: number | null }) {
  const drawn = mappedLines('visible') ?? []
  const original = mappedLines(from) ?? []
  return (
    <div className="stage card">
      <div className="stage-intro"><p>Your file and its original draw the same four lines. Only what the character map says differs. Both columns are parsed from the files' bytes.</p></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="readings-table">
          <caption className="sr-only">Drawn lines, the original file's mapping and your file's mapping</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Drawn on the page</th><th scope="col">{READING_INFO[from].short} file says</th><th scope="col">Your file says</th></tr></thead>
          <tbody>{drawn.map((d, i) => (
            <tr key={i} className={line === i + 1 ? 'sel' : ''}><td>{i + 1}</td><td>{d}</td><td>{original[i]}</td><td><strong>{lines[i]}</strong>{lines[i] === original[i] ? <span className="small muted"> (unchanged)</span> : null}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

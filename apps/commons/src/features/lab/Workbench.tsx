import { useNavigate } from '@tanstack/react-router'
import { LabIcons } from './LabIcon'
import { specimen } from './model'
import { labState, type LabSearch } from './state'
import { Sheet } from './Sheet'
import { SpecimenPanel, StageBar, FloatingToolbar, EvidenceStrip } from './Controls'
import type { CSSProperties } from 'react'
import './workbench.css'
import './RealPage.css'
import { LineInspector } from './LineInspector'
import { RecipeEditor } from './RecipeEditor'
import { useGenerated } from './useGenerated'
import { useState } from 'react'
export function Workbench({ search }: { search: LabSearch }) {
  const state = labState(search)
  const { generated, building, error, urls } = useGenerated(search.rezept)
  const [rawOpen, setRawOpen] = useState(false)
  const navigate = useNavigate()
  const update = (patch: Partial<LabSearch>) => void navigate({ to: '/lab', search: { ...search, ...patch }, replace: true })
  const selected = specimen(state.compare && state.probe === 'a' ? 'b' : state.probe, state.reader, generated)
  const specimens = state.compare ? [specimen('a', state.reader), selected] : [selected]
  return <div className="lab-workbench" data-focus={state.focus}><LabIcons /><div className="wb">
    <nav className="rail" aria-label="Werkzeuge" />
    <SpecimenPanel state={state} update={update} generated={generated} />
    <main id="main" className="stage" aria-label="PDF Lab · Dokumentbühne"><StageBar state={state} update={update} xray={state.xray} /><div className={`table ${state.compare ? 'cmp' : ''}`} style={{ '--z': state.zoom / 100 } as CSSProperties} tabIndex={0} aria-label="Dokumentansicht">{error && <p role="alert">{error}</p>}{state.probe === 'meine' && !generated ? <p role="status">{building ? 'Lesart wird wiederhergestellt …' : 'Keine erzeugte Lesart vorhanden. Ein vollständiges Rezept fehlt im Link.'}</p> : specimens.map(s => <Sheet key={s.id} specimen={s} view={state.view} line={state.line} xray={state.xray} compare={state.compare} pulse={false} onSelect={line => update({ zeile: line + 1 })} />)}</div><FloatingToolbar state={state} update={update} reveal={() => update({ probe: 'b', ansicht: 'seite', durchsicht: 100 })} reset={() => void navigate({ to: '/lab', search: {}, replace: true })} /></main>
    <aside className="rp" inert={state.focus || undefined}><LineInspector specimen={selected} line={state.line} rawOpen={rawOpen} onRaw={setRawOpen} /><RecipeEditor recipe={search.rezept} urls={urls} onGenerated={rezept => update({ rezept, probe: 'meine', ansicht: 'text', vergleich: undefined })} /></aside>
    <EvidenceStrip selected={selected} compare={state.compare} original={selected.generated ? urls.pdf : undefined} />
  </div></div>
}

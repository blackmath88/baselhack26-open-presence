import { useNavigate } from '@tanstack/react-router'
import { Badge } from '../../components/aurora/Primitives'
import { LabIcons } from './LabIcon'
import { specimen, drawnLines, measuredLine } from './model'
import { labState, type LabSearch } from './state'
import { Sheet } from './Sheet'
import { SpecimenPanel, StageBar, FloatingToolbar, EvidenceStrip } from './Controls'
import type { CSSProperties } from 'react'
import './workbench.css'
import './RealPage.css'
export function Workbench({ search }: { search: LabSearch }) {
  const state = labState(search)
  const navigate = useNavigate()
  const update = (patch: Partial<LabSearch>) => void navigate({ to: '/lab', search: { ...search, ...patch }, replace: true })
  const selected = specimen(state.compare && state.probe === 'a' ? 'b' : state.probe, state.reader)
  const specimens = state.compare ? [specimen('a', state.reader), selected] : [selected]
  return <div className="lab-workbench" data-focus={state.focus}><LabIcons /><div className="wb">
    <nav className="rail" aria-label="Werkzeuge" />
    <SpecimenPanel state={state} update={update} />
    <main id="main" className="stage" aria-label="PDF Lab · Dokumentbühne"><StageBar state={state} update={update} xray={state.xray} /><div className={`table ${state.compare ? 'cmp' : ''}`} style={{ '--z': state.zoom / 100 } as CSSProperties} tabIndex={0} aria-label="Dokumentansicht">{specimens.map(s => <Sheet key={s.id} specimen={s} view={state.view} line={state.line} xray={state.xray} compare={state.compare} pulse={false} onSelect={line => update({ zeile: line + 1 })} />)}</div><FloatingToolbar state={state} update={update} reveal={() => update({ probe: 'b', ansicht: 'seite', durchsicht: 100 })} reset={() => void navigate({ to: '/lab', search: {}, replace: true })} /></main>
    <aside className="rp" inert={state.focus || undefined}><section className="box"><h6>Diese Stelle <Badge tone="acc">Zeile {state.line + 1}</Badge></h6><p>{drawnLines()[state.line]}</p><p>{measuredLine(selected, state.line) ?? 'nicht erfasst'}</p></section></aside>
    <EvidenceStrip selected={selected} compare={state.compare} />
  </div></div>
}

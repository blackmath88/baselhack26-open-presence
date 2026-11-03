import { useNavigate } from '@tanstack/react-router'
import { Badge } from '../../components/aurora/Primitives'
import { LabIcons } from './LabIcon'
import { specimen } from './model'
import { labState, type LabSearch } from './state'
import './workbench.css'
export function Workbench({ search }: { search: LabSearch }) {
  const state = labState(search)
  const navigate = useNavigate()
  const selected = specimen(state.probe, state.reader)
  return <div className="lab-workbench"><LabIcons /><div className="wb">
    <nav className="rail" aria-label="Werkzeuge" />
    <aside className="lp"><section className="box"><h6>Proben</h6>{(['a', 'b'] as const).map(id => <button key={id} className={`spec ${state.probe === id ? 'on gb' : ''}`} onClick={() => void navigate({ to: '/lab', search: { ...search, probe: id } })}><span className="thumb" /><span>Gedicht {id.toUpperCase()}<small>{specimen(id, state.reader).file}</small></span></button>)}</section></aside>
    <main id="main" className="stage"><h1>PDF Lab · Gedichtpaar</h1><div className="table">{selected.preview && <img src={selected.preview} alt="Gespeichertes Rendering des Gedichts" style={{ width: 'min(100%, 400px)', height: 'auto', alignSelf: 'start' }} />}</div></main>
    <aside className="rp"><section className="box"><h6>Diese Stelle</h6><Badge tone="ok">Gespeicherte Messung</Badge><p>{selected.run?.instrument.wrapper} {selected.run?.instrument.version}</p></section></aside>
    <footer className="foot">Gemessen · Laufdatum nicht erfasst · {selected.file}</footer>
  </div></div>
}

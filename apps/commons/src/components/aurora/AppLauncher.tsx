import { useEffect, useRef, useState } from 'react'
import { shell } from '../../mock/commons'
import { Icon } from './Icon'
import './AppLauncher.css'
export function AppLauncher({open, onOpen, onClose, onTool}: {open: boolean; onOpen: () => void; onClose: () => void; onTool: (label: string) => void}) {
  const [query, setQuery] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? onClose() : onOpen() } }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open, onOpen, onClose])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    setQuery(''); search.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab') {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('input,button,a[href]') ?? []).filter(el => !el.hasAttribute('disabled'))
        const first = items[0], last = items.at(-1)
        if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last?.focus()}
        else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first?.focus()}
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); previous?.focus() }
  }, [open])
  if (!open) return null
  return <div ref={panel} className="overlay on" role="dialog" aria-modal="true" aria-label="Alle Werkzeuge"><div className="ov-search"><Icon name="search" size={20} /><input ref={search} aria-label="Werkzeuge suchen" placeholder="Werkzeuge, Sammlungen und Favoriten suchen …" value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌘ K</kbd><button aria-label="Werkzeuge schließen" onClick={onClose}><Icon name="x" size={20} /></button></div><div className="ov-cols">{shell.launcher.map(group => <div key={group.title}><h4>{group.title}</h4>{group.items.filter(([, label]) => label.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))).map(([icon, label]) => <button key={label} className={`ov-item ${label === 'Start' ? 'on gb' : ''}`} onClick={() => onTool(label)}><Icon name={icon} />{label}{['Finden','Prüfen','Vergleichen','PDF Lab','Observatory'].includes(label) && <Icon name="pin" className="pin" />}</button>)}</div>)}<div><h4><Icon name="star" size={18} />Favoriten</h4><p className="ov-empty">Noch keine Favoriten</p><button className="navitem favorite-add" onClick={() => search.current?.focus()}>Favorit hinzufügen<Icon name="plus" /></button></div></div></div>
}

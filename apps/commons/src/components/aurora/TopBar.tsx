import { useLocation } from '@tanstack/react-router'
import { Icon } from './Icon'
import { shell } from '../../mock/commons'
import './TopBar.css'
export function TopBar({
  onLauncher,
  onTool,
}: {
  onLauncher: () => void
  onTool: (label: string) => void
}) {
  const isLab = useLocation({ select: (s) => s.pathname === '/lab' })
  const items = isLab ? shell.pinned.filter(([, label]) => ['Start', 'Finden', 'PDF Lab', 'Observatory'].includes(label)) : shell.pinned
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">.p</div>
        <span className="full">Commons</span>
      </div>
      <div className="sep" />
      <button
        className="ws"
        aria-label="Arbeitsbereich auswählen"
        onClick={onLauncher}
      >
        <span>{isLab ? 'PDF Lab · Gedichtpaar' : shell.workspace}</span>
        <Icon name="down" />
      </button>
      <button
        className="waffle"
        id="waffle"
        aria-label="Alle Werkzeuge"
        onClick={onLauncher}
      >
        <Icon name="grid" size={20} />
      </button>
      <nav className="tabs" aria-label="Werkzeuge">
        {items.map(([icon, label], i) => (
          <button
            key={label}
            className={`tab ${(isLab ? label === 'PDF Lab' : i === 0) ? 'on gb' : ''}`}
            onClick={() => (label === '+3' ? onLauncher() : onTool(label))}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>
      <div className="util">
        <button aria-label="Hilfe" onClick={onLauncher}>
          <Icon name="help" size={20} />
        </button>
        <button aria-label="Mitteilungen" onClick={() => onTool('Prüfen')}>
          <Icon name="bell" size={20} />
          {!isLab && <span className="dot" />}
        </button>
        <button aria-label="Profil" onClick={onLauncher}>
          <Icon name="user" size={20} />
        </button>
      </div>
    </header>
  )
}

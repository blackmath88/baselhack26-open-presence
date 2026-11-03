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
        <span>{shell.workspace}</span>
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
        {shell.pinned.map(([icon, label], i) => (
          <button
            key={label}
            className={`tab ${i === 0 ? 'on gb' : ''}`}
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
          <span className="dot" />
        </button>
        <button aria-label="Profil" onClick={onLauncher}>
          <Icon name="user" size={20} />
        </button>
      </div>
    </header>
  )
}

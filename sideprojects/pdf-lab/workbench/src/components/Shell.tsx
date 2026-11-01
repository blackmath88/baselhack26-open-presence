// Narrow stable navigation and the main region. Only usable destinations are listed.
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { legacyCabinetUrl, useClientValue } from '../features/legacy'

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => setOpen(false), [pathname])
  const legacy = useClientValue(() => legacyCabinetUrl(), '')
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <nav className="nav" aria-label="Workbench" data-open={open}>
        <Link to="/" className="nav-brand">
          <strong>PDF LAB</strong>
          <span>Workbench</span>
        </Link>
        <button className="btn quiet nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close menu' : 'Menu'}
        </button>
        <div className="nav-links" id="nav-links">
          <Link to="/" className="nav-item" activeOptions={{ exact: true }} activeProps={{ 'aria-current': 'page' }}>Cabinet</Link>
          <div className="nav-section">Specimens</div>
          <Link to="/specimens/$specimenId" params={{ specimenId: 'a01-two-poems' }} search={{}} className="nav-item" activeProps={{ className: 'nav-item active' }}>A01 · Two poems</Link>
          <div className="nav-section">Elsewhere</div>
          <a className="nav-item" href={import.meta.env.VITE_PHF_STORY_URL || "https://blackmath88.github.io/baselhack26-open-presence/story/#past"}>← .phf story</a>
          <a className="nav-item" href={legacy || undefined} target="_blank" rel="noreferrer">Legacy cabinet ↗</a>
        </div>
        <p className="nav-foot">Recorded evidence. No uploads, no live engines in this version.</p>
      </nav>
      <main className="main" id="main" tabIndex={-1}>{children}</main>
    </div>
  )
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { parseRoute } from '../../commons/client/router'
import { IconSprite, Icon } from './Icon'
import { TopBar } from './TopBar'
import { AppLauncher } from './AppLauncher'
import { investigationId, shell } from '../../mock/commons'
import './AppShell.css'

type InvestigationContext = { id: string; setId: (id: string) => void }
const Investigation = createContext<InvestigationContext>({
  id: investigationId,
  setId: () => {},
})
export const useInvestigation = () => useContext(Investigation)
export function AppShell({ children }: { children: ReactNode }) {
  const [id, setId] = useState(investigationId)
  const [launcher, setLauncher] = useState(false)
  const navigate = useNavigate()
  // Keep copied read links from the existing CLI/API useful after the router migration.
  useEffect(() => {
    const follow = () => {
      let route
      try {
        route = parseRoute(window.location.hash)
      } catch {
        return
      }
      if (route.view === 'search')
        void navigate({
          to: '/find',
          search: { query: route.query, compare: route.compare },
          replace: true,
        })
      if (route.view === 'problem')
        void navigate({
          to: '/find',
          search: { query: route.query, selected: route.problemId },
          replace: true,
        })
      if (route.view === 'compare')
        void navigate({
          to: '/find',
          search: { query: route.query, compare: [route.a, route.b] },
          replace: true,
        })
    }
    follow()
    window.addEventListener('hashchange', follow)
    return () => window.removeEventListener('hashchange', follow)
  }, [navigate])
  const openTool = (label: string) => {
    setLauncher(false)
    if (label === 'Start') void navigate({ to: '/' })
    else if (label === 'Finden') void navigate({ to: '/find' })
    else if (label === 'Vergleichen')
      void navigate({ to: '/find', search: { query: 'frame' } })
    else if (label === 'PDF Lab')
      void navigate({ to: '/lab' })
    else if (label === 'Observatory')
      window.location.assign(
        'https://blackmath88.github.io/baselhack26-open-presence/',
      )
    else if (label === 'Prüfen') void navigate({ to: '/actions' })
    else
      void navigate({
        to: '/canvas/$investigationId',
        params: { investigationId: id },
      })
  }
  return (
    <Investigation.Provider value={{ id, setId }}>
      <IconSprite />
      <a className="skip-link" href="#main">
        Zum Inhalt
      </a>
      <div className="shell" inert={launcher || undefined}>
        <TopBar onLauncher={() => setLauncher((v) => !v)} onTool={openTool} />
        {children}
      </div>
      <AppLauncher
        open={launcher}
        onOpen={() => setLauncher(true)}
        onClose={() => setLauncher(false)}
        onTool={openTool}
      />
    </Investigation.Provider>
  )
}
export function AppLayout({
  aside,
  children,
}: {
  aside: ReactNode
  children: ReactNode
}) {
  const pathname = useLocation({ select: (s) => s.pathname })
  const mode = pathname.startsWith('/canvas/')
    ? 'canvas'
    : pathname.startsWith('/actions')
      ? 'actions'
      : 'assistant'
  return (
    <div className="app">
      <aside>
        <ModeSwitch />
        <div className="panel" data-view={mode}>
          {aside}
        </div>
      </aside>
      <main id="main">{children}</main>
    </div>
  )
}
export function ModeSwitch() {
  const path = useLocation({ select: (s) => s.pathname })
  const { id } = useInvestigation()
  const props = [
    { to: '/' as const },
    {
      to: '/canvas/$investigationId' as const,
      params: { investigationId: id },
    },
    { to: '/actions' as const },
  ]
  return (
    <nav className="modes" aria-label="Ansicht">
      {shell.modes.map(([icon, label], i) => (
        <Link
          key={label}
          {...props[i]}
          className={`mode ${(i === 0 ? path === '/' : i === 1 ? path.startsWith('/canvas/') : path.startsWith('/actions')) ? 'on' : ''}`}
        >
          <Icon name={icon} />
          {label}
          {i === 2 && <span className="dot" />}
        </Link>
      ))}
    </nav>
  )
}

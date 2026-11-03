import type { ReactNode } from 'react'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { AppShell } from '../components/aurora/AppShell'
import '@fontsource/geist/latin-400.css'
import '@fontsource/geist/latin-500.css'
import '@fontsource/geist/latin-600.css'
import '@fontsource/geist/latin-700.css'
import '@fontsource/geist-mono/latin-400.css'
import '@fontsource/geist-mono/latin-500.css'
import '../styles/tokens.css'
import '../styles/supplemental/tokens.css'
import '../styles/base.css'
import '../components/aurora/Responsive.css'

export const Route = createRootRoute({
  head: () => ({ meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: '.phf Commons – Aurora' }] }),
  shellComponent: RootDocument,
  component: () => <AppShell><Outlet /></AppShell>,
  notFoundComponent: () => <main><h1>Nicht gefunden</h1><a href="/">Zurück zum Assistenten</a></main>,
})
function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="de"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}

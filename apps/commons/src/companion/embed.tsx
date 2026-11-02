import { createRoot } from 'react-dom/client'
import { ECompanion } from './ECompanion'
// One mount per document; the portal itself remains mounted across hash navigation.
if (!document.querySelector('[data-e-companion]') && !document.getElementById('phf-e-mount')) {
  const script = document.currentScript as HTMLScriptElement | null
  const baseUrl = script?.src ? new URL('../', script.src).href : undefined
  const mount = document.createElement('div')
  mount.id = 'phf-e-mount'
  document.body.append(mount)
  createRoot(mount).render(<ECompanion baseUrl={baseUrl} />)
}

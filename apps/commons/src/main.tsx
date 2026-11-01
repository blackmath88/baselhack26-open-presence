import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './styles/cloud-control.css'

// Phase 0 visual checkpoint. Review switches only, read from the query string and never stored:
// `?look=classic` shows the previous look, `?theme=light` the light counterpart of the dark default.
const look = new URLSearchParams(location.search)
document.documentElement.dataset.look = look.get('look') === 'classic' ? 'classic' : 'cloud'
document.documentElement.dataset.theme = look.get('theme') === 'light' ? 'light' : 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { EOpening } from '../src/components/EOpening'
import { EGuide } from '../src/components/EGuide'
import { EPixelSprite, E_POSES } from '../src/components/EPixelSprite'
import '../src/styles.css'
import './preview.css'

function Preview() {
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => setReducedMotion(query.matches)
    const visibility = () => setVisible(!document.hidden)
    query.addEventListener('change', motion)
    document.addEventListener('visibilitychange', visibility)
    return () => { query.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  const [missionIndex, setMissionIndex] = useState(0)
  return <main className="e-preview">
    <a href="https://blackmath88.github.io/baselhack26-open-presence/">← Project Observatory</a>
    <p className="preview-kicker">.phf · portable human format</p>
    <h1>a dope e.</h1>
    <p className="preview-lede">Adobe. A dobe e. A dope e. a dope e. Watch the whole meaning find its way into one letter.</p>
    <section className="wordmark-film" aria-label="The evolution of e">
      <EOpening variant="wordmark" size={740} paused={paused} reducedMotion={reducedMotion} visible={visible} />
      <button className="button" type="button" onClick={() => setPaused(v => !v)} aria-pressed={paused}>{paused ? 'Resume' : 'Pause'}</button>
    </section>
    <EGuide missionIndex={missionIndex} surface="auto" />
    <details className="companion-controls"><summary>e’s side quest settings</summary>
    <label className="preview-select">Side mission <select value={missionIndex} onChange={e => setMissionIndex(Number(e.target.value))}><option value={0}>PDF Lab</option><option value={1}>PDF history</option></select></label>
    </details>
    <section aria-labelledby="poses"><h2 id="poses">Seven expressions</h2><div className="pose-grid">{E_POSES.map(pose => <figure key={pose}><EPixelSprite pose={pose} size={112} smoking /><figcaption>{pose.replaceAll('-', ' ')}</figcaption></figure>)}</div></section>
    <p className="preview-note">Live component preview · the same E component used in Commons. Side missions open the published PDF experiences. The opening now exhales smoke and shifts into a slouched, red-eyed e. The persistent e can be moved with its handle or keyboard arrows. Closing its bubble keeps e visible. This page does not connect to the Commons backend.</p>
    <a href="https://github.com/blackmath88/baselhack26-open-presence/blob/main/docs/design/DOPE-E.md">Character vision and deployment guide ↗</a>
  </main>
}
createRoot(document.getElementById('root')!).render(<Preview />)

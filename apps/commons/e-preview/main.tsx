import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { EGuide } from '../src/components/EGuide'
import { EPixelSprite, E_POSES } from '../src/components/EPixelSprite'
import '../src/styles.css'
import './preview.css'

function Preview() {
  const [missionIndex, setMissionIndex] = useState(0)
  return <main className="e-preview">
    <a href="../">← Project Observatory</a>
    <p className="preview-kicker">.phf · portable human format</p>
    <h1>A dope E.</h1>
    <p className="preview-lede">Our easily distracted pixel companion. Try a side mission, pause the ambient poses, or hide E and bring it back.</p>
    <EGuide key={missionIndex} missionIndex={missionIndex} />
    <label className="preview-select">Side mission <select value={missionIndex} onChange={e => setMissionIndex(Number(e.target.value))}><option value={0}>PDF Lab</option><option value={1}>PDF history</option></select></label>
    <section aria-labelledby="poses"><h2 id="poses">Seven expressions</h2><div className="pose-grid">{E_POSES.map(pose => <figure key={pose}><EPixelSprite pose={pose} size={96} /><figcaption>{pose.replaceAll('-', ' ')}</figcaption></figure>)}</div></section>
    <p className="preview-note">Live component preview · the same E component used in Commons. Side missions currently open repository sources. Walking, multi-frame animation and presentation choreography are still planned. This page does not connect to the Commons backend.</p>
    <a href="https://github.com/blackmath88/baselhack26-open-presence/pull/34">Implementation and build notes ↗</a>
  </main>
}
createRoot(document.getElementById('root')!).render(<Preview />)

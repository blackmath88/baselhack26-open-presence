import { useEffect, useState } from 'react'
import { Button, Chip } from '../../components/aurora/Primitives'
import { generateReading, mappedLine, specimen } from './model'
import type { LabSearch } from './state'
export function RecipeEditor({ recipe, onGenerated, urls }: { recipe: LabSearch['rezept']; onGenerated: (lines: [string, string, string, string]) => void; urls: { pdf?: string; recipe?: string } }) {
  const defaults = () => [0, 1, 2, 3].map(i => mappedLine(specimen('b', 'pdftotext'), i) ?? '')
  const [lines, setLines] = useState<string[]>(recipe ?? defaults)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const key = JSON.stringify(recipe)
  useEffect(() => { setLines(recipe ?? defaults()); setError('') }, [key])
  return <section className="box recipe" id="lab-recipe"><h6>Eigene Lesart <Chip>4 Zeilen</Chip></h6>
    <form onSubmit={async e => {
      e.preventDefault()
      const invalid = lines.findIndex(line => !/^[\x20-\x7E]{1,32}$/.test(line))
      if (invalid >= 0) { setError(`Zeile ${invalid + 1}: Bitte 1–32 druckbare ASCII-Zeichen eingeben.`); return }
      setBusy(true); setError('')
      try {
        const four = lines as [string, string, string, string]
        await generateReading(four) // Verify parent, writer result and unchanged drawing before changing URL.
        onGenerated(four)
      } catch { setError('PDF konnte nicht erzeugt werden. Ausgangsdatei und Zuordnung konnten nicht geprüft werden.') }
      finally { setBusy(false) }
    }}>
      {lines.map((text, i) => <label key={i}><span>{i + 1}</span><input aria-label={`Lesart Zeile ${i + 1}`} value={text} maxLength={32} required onChange={e => setLines(old => old.map((v, j) => i === j ? e.target.value : v))} /></label>)}
      <div className="row"><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Erzeuge PDF …' : 'PDF erzeugen'}</Button></div>
    </form>
    {error && <p className="hint" role="alert">{error}</p>}
    <p className="hint">Die Seite bleibt gleich. Nur die Zuordnung ändert sich.</p>
    <p className="glyph-limit">Vier ASCII-Zeilen, jeweils 1–32 Zeichen. Nach dem Erzeugen stehen diese Zeilen im teilbaren Link.</p>
    {urls.pdf && <div className="recipe-downloads"><a href={urls.pdf} download="meine-lesart.pdf">PDF herunterladen</a><a href={urls.recipe} download="meine-lesart.rezept.json">Rezept herunterladen</a></div>}
  </section>
}

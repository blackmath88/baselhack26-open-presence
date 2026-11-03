import { useEffect, useState } from 'react'
import { generateReading, type GeneratedReading } from './model'
import type { LabSearch } from './state'
export function useGenerated(recipe: LabSearch['rezept']) {
  const [generated, setGenerated] = useState<GeneratedReading>()
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState('')
  const [urls, setUrls] = useState<{ pdf?: string; recipe?: string }>({})
  const key = JSON.stringify(recipe)
  useEffect(() => {
    let active = true
    if (!recipe) { setGenerated(undefined); setError(''); setBuilding(false); return }
    setGenerated(undefined); setBuilding(true); setError('')
    void generateReading(recipe).then(result => { if (active) setGenerated(result) }).catch(() => {
      if (active) setError('Die Lesart konnte nicht wiederhergestellt werden. Ausgangsdatei und Rezept konnten nicht geprüft werden.')
    }).finally(() => { if (active) setBuilding(false) })
    return () => { active = false }
    // URL recipe identity, rather than a new array instance on each route update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => {
    if (!generated) { setUrls({}); return }
    const pdf = URL.createObjectURL(new Blob([Uint8Array.from(generated.bytes)], { type: 'application/pdf' }))
    const recipeUrl = URL.createObjectURL(new Blob([JSON.stringify(generated.recipe, null, 2)], { type: 'application/json' }))
    setUrls({ pdf, recipe: recipeUrl })
    return () => { URL.revokeObjectURL(pdf); URL.revokeObjectURL(recipeUrl) }
  }, [generated])
  return { generated, building, error, urls }
}

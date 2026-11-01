// The working legacy cabinet (sideprojects/pdf-lab/index.html) stays the fallback for every exhibit
// the workbench does not support yet. It is served separately (python3 -m http.server from
// sideprojects/pdf-lab); the workbench never serves the whole folder.
import { useEffect, useState } from 'react'

/** Default: port 8000 on the host serving this page, so a phone is not sent to its own localhost. */
export function legacyCabinetUrl(anchor?: string): string {
  const configured = import.meta.env.VITE_LEGACY_CABINET_URL
  const base = configured || 'https://blackmath88.github.io/baselhack26-open-presence/pdf-lab/index.html'
  return anchor ? `${base}#${anchor}` : base
}

/** A value that needs the browser (location) and must not differ between server and first render. */
export function useClientValue<T>(compute: () => T, fallback: T): T {
  const [value, setValue] = useState(fallback)
  useEffect(() => setValue(compute()), [])
  return value
}

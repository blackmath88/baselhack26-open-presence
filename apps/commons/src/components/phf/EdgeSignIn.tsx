import { useState } from 'react'
export function EdgeSignIn({ busy, onSignIn }: { busy: boolean; onSignIn: (code: string) => Promise<void> }) {
  const [code, setCode] = useState('')
  return <section className="phf-entry">
    <h2>Explore publicly. Share with your contributor access code.</h2>
    <p>Shared contributions and replies are public. Access codes identify invited demo contributors; they do not verify real-world identity.</p>
    <form onSubmit={event => { event.preventDefault(); void onSignIn(code).then(() => setCode('')) }}>
      <label>Contributor access code <input type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} /></label>
      <button className="button" disabled={busy || code.length < 32}>Sign in to contribute</button>
      <button className="button" type="button" disabled={busy} onClick={() => void onSignIn('public')}>Read without signing in / sign out</button>
    </form>
  </section>
}

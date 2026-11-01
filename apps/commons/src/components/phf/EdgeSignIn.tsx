import { useRef, useState } from 'react'

export function EdgeSignIn({ busy, onSignIn }: { busy: boolean; onSignIn: (code: string) => Promise<boolean> }) {
  // Keep bearer credentials out of React-rendered value attributes and snapshots.
  const input = useRef<HTMLInputElement>(null)
  const [length, setLength] = useState(0)
  const enter = async (publicReader = false) => {
    const code = publicReader ? 'public' : input.current?.value.trim() ?? ''
    if (input.current) input.current.value = ''
    setLength(0)
    await onSignIn(code)
  }
  return <section className="phf-entry">
    <h2>Explore publicly. Share with your contributor access code.</h2>
    <p>Shared contributions and replies are public. Access codes identify invited demo contributors; they do not verify real-world identity.</p>
    <form onSubmit={event => { event.preventDefault(); void enter() }}>
      <label>Contributor access code <input ref={input} type="password" autoComplete="off" spellCheck={false} onChange={e => setLength(e.target.value.trim().length)} /></label>
      <button className="button" disabled={busy || length < 32}>Sign in to contribute</button>
      <button className="button" type="button" disabled={busy} onClick={() => void enter(true)}>Read without signing in / sign out</button>
    </form>
  </section>
}

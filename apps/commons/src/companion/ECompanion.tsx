import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { EPixelSprite, type EPose } from '../components/EPixelSprite'
import { authoredPosition, BODY_SIZE, clampPosition, pageContext, replyTo, restorePosition, type Point } from './model'
import { startIdleCycle } from './idle'
import './companion.css'

const POSITION_KEY = 'phf.e.position.v1'
const PAUSE_KEY = 'phf.e.paused.v1'
const viewport = () => ({ width: window.innerWidth, height: window.innerHeight })
function read(key: string): string | null { try { return localStorage.getItem(key) } catch { return null } }
function write(key: string, value: string | null) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value) } catch { /* Storage is optional. */ } }
function savedPoint(): Point | null { try { return restorePosition(JSON.parse(read(POSITION_KEY) ?? 'null'), viewport()) } catch { return null } }
const DEFAULT_BASE = 'https://blackmath88.github.io/baselhack26-open-presence/'

export function ECompanion({ baseUrl = DEFAULT_BASE, missionIndex = 0, surface = 'auto' }: { baseUrl?: string; missionIndex?: number; surface?: 'auto' | 'commons' }) {
  const [context, setContext] = useState(() => pageContext(surface === 'commons' ? '/commons/' : location.pathname, location.hash))
  const [point, setPoint] = useState<Point>(() => savedPoint() ?? authoredPosition(viewport()))
  const pointRef = useRef(point)
  const manual = useRef(savedPoint() !== null)
  const host = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(() => read(PAUSE_KEY) === 'true')
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [pose, setPose] = useState<EPose>('idle')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<{ role: 'you' | 'e'; text: string }[]>([])
  const drag = useRef<{ id: number; start: Point; origin: Point; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const activeAnimation = useRef<Animation | null>(null)
  const pendingFrame = useRef<number | null>(null)
  const base = new URL(baseUrl, location.href)
  const sideQuest = (context.id === 'pdf' || missionIndex % 2 === 1) ? (import.meta.env.VITE_PHF_HISTORY_URL || new URL('pdf-history/', base).href) : (import.meta.env.VITE_PHF_PDF_URL || new URL('pdf-lab/', base).href)

  const place = useCallback((next: Point, animate = false) => {
    const p = clampPosition(next, viewport())
    const rect = host.current?.getBoundingClientRect()
    const old = rect ? { x: rect.left, y: rect.top } : pointRef.current
    pointRef.current = p
    activeAnimation.current?.cancel()
    setPoint(p)
    if (animate && !reduced && !paused && host.current) activeAnimation.current = host.current.animate([
      { transform: `translate(${old.x}px,${old.y}px)` }, { transform: `translate(${p.x}px,${p.y}px)` },
    ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' })
  }, [reduced, paused])
  const findAnchor = useCallback(() => {
    const candidates = context.anchors.flatMap(selector => Array.from(document.querySelectorAll<HTMLElement>(selector)))
    return candidates.find(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 40 && r.top < innerHeight - 120 })
  }, [context])
  const returnHome = useCallback(() => {
    manual.current = false
    write(POSITION_KEY, null)
    place(authoredPosition(viewport(), findAnchor()?.getBoundingClientRect(), context.side), true)
  }, [findAnchor, place, context.side])
  const save = useCallback(() => {
    manual.current = true
    write(POSITION_KEY, JSON.stringify({ x: pointRef.current.x / innerWidth, y: pointRef.current.y / innerHeight }))
  }, [])

  useEffect(() => {
    const onRoute = () => setContext(pageContext(surface === 'commons' ? '/commons/' : location.pathname, location.hash))
    window.addEventListener('hashchange', onRoute)
    window.addEventListener('popstate', onRoute)
    return () => { window.removeEventListener('hashchange', onRoute); window.removeEventListener('popstate', onRoute) }
  }, [surface])
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const update = (event?: Event) => {
      if (pendingFrame.current !== null) window.clearTimeout(pendingFrame.current)
      pendingFrame.current = window.setTimeout(() => {
        pendingFrame.current = null
        if (drag.current) return
        if (manual.current) place(pointRef.current)
        else place(authoredPosition(viewport(), findAnchor()?.getBoundingClientRect(), context.side), true)
      }, event?.type === 'scroll' ? 140 : 0)
    }
    update()
    addEventListener('resize', update)
    addEventListener('scroll', update, { passive: true })
    return () => { removeEventListener('resize', update); removeEventListener('scroll', update); if (pendingFrame.current !== null) window.clearTimeout(pendingFrame.current); pendingFrame.current = null; activeAnimation.current?.cancel() }
  }, [context, findAnchor, place])
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    setPose('idle')
    if (paused || reduced || !visible) return
    return startIdleCycle(setPose, () => !document.hidden && !drag.current)
  }, [paused, reduced, visible])
  useEffect(() => { if (paused || reduced) activeAnimation.current?.cancel() }, [paused, reduced])

  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('keydown', escape, true)
    return () => document.removeEventListener('keydown', escape, true)
  }, [open])

  const add = (text: string, question?: string) => setMessages(old => [...old, ...(question ? [{ role: 'you' as const, text: question }] : []), { role: 'e' as const, text }].slice(-20))
  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    suppressClick.current = false
    const rect = host.current?.getBoundingClientRect()
    if (rect) place({ x: rect.left, y: rect.top })
    activeAnimation.current?.cancel()
    drag.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: pointRef.current, moved: false }
  }
  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    const dx = event.clientX - d.start.x, dy = event.clientY - d.start.y
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
    if (!d.moved) return
    const p = clampPosition({ x: d.origin.x + dx, y: d.origin.y + dy }, viewport())
    pointRef.current = p
    // Pointer motion updates the compositor transform, not React state every frame.
    if (host.current) host.current.style.transform = `translate(${p.x}px,${p.y}px)`
  }
  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setPoint(pointRef.current)
    if (d.moved) { save(); if (event.currentTarget === trigger.current) suppressClick.current = true }
  }
  const moveWithKeys = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Home') { event.preventDefault(); returnHome(); return }
        const step = event.shiftKey ? 32 : 12
        const moves: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } }
        if (moves[event.key]) { event.preventDefault(); const d = moves[event.key]; place({ x: pointRef.current.x + d.x, y: pointRef.current.y + d.y }); save() }
  }
  const panelLeft = Math.min(Math.max(12, point.x - 220), Math.max(12, innerWidth - 348))
  const panelAbove = point.y > (innerHeight - BODY_SIZE) / 2
  const panelStyle: CSSProperties = { left: panelLeft, maxHeight: Math.max(60, panelAbove ? point.y - 20 : innerHeight - point.y - BODY_SIZE - 20), ...(panelAbove ? { bottom: innerHeight - point.y + 8 } : { top: point.y + BODY_SIZE + 8 }) }

  return createPortal(<div className="phf-e-layer" data-e-companion="persistent">
    <div ref={host} className="phf-e-dock" data-paused={paused || reduced || !visible} data-cue={pose} style={{ transform: `translate(${point.x}px,${point.y}px)` }}>
      <button ref={trigger} type="button" className="phf-e-character" aria-label="Talk with e" aria-expanded={open} aria-controls="phf-e-panel" aria-description="Drag to move, or use arrow keys. Home returns to e’s place." aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home" onKeyDown={moveWithKeys} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onClick={event => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return }; setOpen(v => !v) }}><EPixelSprite size={96} pose={pose} smoking /></button>
      <span className="phf-e-puff" aria-hidden="true" />

    </div>
    {open && <section id="phf-e-panel" className="phf-e-panel" aria-label="Conversation with e" style={panelStyle} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() } }}>
      <header><div><strong>hey. i’m e.</strong><small>{context.title} · authored page guide</small></div><button type="button" aria-label="Close conversation" onClick={() => { setOpen(false); trigger.current?.focus() }}>×</button></header>
      <p>{context.explanation}</p>
      <div className="phf-e-actions">
        <button type="button" onClick={() => add(context.explanation)}>Explain this</button>
        <button type="button" onClick={() => {
          const anchor = findAnchor() ?? context.anchors.map(selector => document.querySelector<HTMLElement>(selector)).find(Boolean)
          if (anchor) {
            anchor.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
            anchor.animate([{ outline: '3px solid #aa6fff' }, { outline: '3px solid transparent' }], { duration: reduced ? 0 : 1800 })
            returnHome()
          }
          add(anchor ? 'Here is the main experience on this page. Follow its source and evidence links to inspect it yourself.' : 'I do not have a guide point for this screen yet. The visible source and evidence links are a good place to start.')
        }}>Show me around</button>
        <a href={sideQuest}>Side quest ↗</a>
      </div>
      <div className="phf-e-messages" aria-live="polite" aria-relevant="additions">{messages.map((message, i) => <p key={i} className={`from-${message.role}`}><strong>{message.role === 'you' ? 'You' : 'e'}</strong> {message.text}</p>)}</div>
      <form onSubmit={event => { event.preventDefault(); const question = draft.trim().slice(0, 500); if (!question) return; add(replyTo(question, context), question); setDraft('') }}><label htmlFor="phf-e-question">Ask about this page</label><div><input id="phf-e-question" value={draft} maxLength={500} onChange={event => setDraft(event.target.value)} autoComplete="off" /><button type="submit">Ask</button></div></form>
      <footer><button type="button" onClick={() => { setPaused(v => !v); write(PAUSE_KEY, String(!paused)) }} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button><button type="button" onClick={returnHome}>Return to e’s place</button></footer>
    </section>}
  </div>, document.body)
}

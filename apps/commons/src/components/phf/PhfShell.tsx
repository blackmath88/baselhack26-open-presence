/**
 * The .phf product frame around Photo Frame Commons: identity, the way back
 * to the presentation, the entry and service-unavailable states, and the
 * presenter's journey guide. Product copy only; every action below still goes
 * through the real Commons service.
 */
import { ArrowLeft, Check, FolderGit2, MessageSquare, RotateCcw, Search } from 'lucide-react'
import type { Participant } from '../../lib/api'
import type { Route } from '../../commons/client/router'
import { appLinks } from '../../commons/contracts'
import { JOURNEY_STEPS, journey, presentationUrl, useJourney, type JourneyStep } from '../../commons/client/journey'

export const DEMO_QUESTION = 'My Mac cannot see my frame'

export function PhfHeader({ actorName, onSwitchVoice }: { actorName?: string; onSwitchVoice?: () => void }) {
  return (
    <header className="phf-header">
      <a className="phf-back" href={presentationUrl()}><ArrowLeft size={14} /> Presentation</a>
      <a className="phf-brand" href={appLinks.search('')} aria-label=".phf home">
        <span className="phf-mark">.phf</span>
        <span className="phf-brand-lines">
          <span className="phf-brand-name">portable human format</span>
          <span className="phf-brand-line">Human context that travels with the answer.</span>
        </span>
      </a>
      {actorName && (
        <button className="phf-voice" onClick={onSwitchVoice} aria-label={`Acting as ${actorName}. Switch participant`}>
          <span className="phf-voice-label">Voice</span> {actorName}
        </button>
      )}
    </header>
  )
}

/** Before a participant is chosen: the question, the dataset, and who you will speak as. */
export function PhfEntry({ participants, onSelect, busy }: { participants: Participant[]; onSelect: (id: string) => void; busy: boolean }) {
  return (
    <section className="phf-entry" aria-labelledby="phf-entry-title">
      <p className="phf-kicker">Photo Frame Commons · a real-source demonstration of .phf</p>
      <h1 id="phf-entry-title">“{DEMO_QUESTION}.”</h1>
      <p className="phf-lede">
        An answer is easy to produce. Knowing whether it applies to you is harder. Here every account keeps its person,
        their circumstances, the exact source passage and how it was prepared — and stays open to replies and corrections.
      </p>
      <div className="phf-entry-pick">
        <h2>Choose a prototype participant to enter</h2>
        <div className="phf-chips">
          {participants.map((p) => (
            <button key={p.id} className="button phf-chip" disabled={busy} onClick={() => onSelect(p.id)}>{p.name}</button>
          ))}
        </div>
        <p className="phf-note">
          Prototype sign-in: the server issues a session token and attributes everything to it. Participants are demo
          identities; source records come from a pinned public snapshot of <code>wesbos/photo-frame-dashboard</code>.
        </p>
      </div>
    </section>
  )
}

export function PhfUnavailable({ error }: { error: string | null }) {
  return (
    <section className="phf-entry" role="alert" aria-labelledby="phf-down-title">
      <p className="phf-kicker">Photo Frame Commons</p>
      <h1 id="phf-down-title">The Commons service is not reachable.</h1>
      <p className="phf-lede">Nothing is shown rather than something invented. Start the local service and reload:</p>
      <pre className="phf-cmd">cd apps/commons{'\n'}npm run dev:server   # API on :8787{'\n'}npm run dev          # this UI on :5173</pre>
      {error && <p className="phf-note">Reported: {error}</p>}
      <p><a className="button" href={presentationUrl()}><ArrowLeft size={14} /> Back to the presentation</a></p>
    </section>
  )
}

/** Documents are browsed by path; issue, pull and discussion threads by object id. */
const repoLink = (objectId: string) =>
  objectId.startsWith('doc/') ? appLinks.repository(objectId.slice(4)) : `#/repo?object=${encodeURIComponent(objectId)}`

const STEP_LABEL: Record<JourneyStep, string> = {
  find: 'Find', inspect: 'Inspect', contribute: 'Contribute', reply: 'Reply', rediscover: 'Rediscover',
}

function currentStep(route: Route, done: JourneyStep[]): JourneyStep {
  if (route.view === 'repo') return 'rediscover'
  if (route.view === 'thread' || route.view === 'contribution') return done.includes('reply') ? 'rediscover' : 'reply'
  if (route.view === 'problem') return done.includes('contribute') ? 'reply' : done.includes('inspect') ? 'contribute' : 'inspect'
  return done.includes('reply') ? 'rediscover' : 'find'
}

/** Presenter guide: where we are in find → inspect → contribute → reply → rediscover, and the next move. */
export function JourneyBar({ route }: { route: Route }) {
  const state = useJourney()
  const step = currentStep(route, state.done)
  const f = state.followed
  const hint: Record<JourneyStep, React.ReactNode> = {
    find: <>Search the situation a person would type. Each result says <strong>when it applies</strong> — device, conditions — and where it may not.</>,
    inspect: <>Open the record. A quote is the <strong>original author's words</strong>; the reading under it is the <strong>agent's interpretation</strong>, unreviewed.</>,
    contribute: <>Choose <strong>Respond to this passage</strong>. The preview shows exactly what leaves this browser, which passage it cites, and where it goes.</>,
    reply: f
      ? <>Switch <strong>Voice</strong> to another participant, open <a href={appLinks.thread(f.contributionId)}>{f.author}'s observation</a> and reply or correct it. The original stays.</>
      : <>Switch <strong>Voice</strong> to another participant and reply to or correct an observation. The original stays.</>,
    rediscover: f
      ? <>Arrive another way: <a href={repoLink(f.cites[0] ?? '')}>the cited repository object</a> or <a href={appLinks.search(f.excerpt)}>a search for its words</a> finds the same observation, author and source.</>
      : <>Arrive another way — the <a href={appLinks.repository()}>repository</a> or search — and the same contributions appear with author and source.</>,
  }
  return (
    <nav className="phf-journey" aria-label="Demo journey">
      <ol>
        {JOURNEY_STEPS.map((s, i) => {
          const isDone = state.done.includes(s)
          return (
            <li key={s} className={`${s === step ? 'current' : ''} ${isDone ? 'done' : ''}`} aria-current={s === step ? 'step' : undefined}>
              <span className="phf-step-num" aria-hidden="true">{isDone ? <Check size={12} /> : i + 1}</span>
              {STEP_LABEL[s]}
              {isDone && <span className="sr-only"> (done)</span>}
            </li>
          )
        })}
      </ol>
      <p className="phf-hint">{hint[step]}</p>
      {state.done.length > 0 && (
        <button className="phf-reset" onClick={() => journey.reset()} title="Clears this browser's guide only; the shared room is unchanged">
          <RotateCcw size={12} /> Reset guide
        </button>
      )}
    </nav>
  )
}

export function EntranceTabs({ route }: { route: Route }) {
  const at = (v: Route['view'][]) => (v.includes(route.view) ? 'active' : '')
  return (
    <nav className="phf-entrances" aria-label="Entrances">
      <span className="phf-entrances-label">Entrances</span>
      <a className={`phf-tab ${at(['home', 'search'])}`} href={appLinks.search('')} aria-current={at(['home', 'search']) ? 'page' : undefined}><Search size={14} /> Search</a>
      <a className={`phf-tab ${at(['repo'])}`} href={appLinks.repository()} aria-current={at(['repo']) ? 'page' : undefined}><FolderGit2 size={14} /> Repository</a>
      {(route.view === 'contribution' || route.view === 'thread') && <span className="phf-tab active" aria-current="page"><MessageSquare size={14} /> Direct link</span>}
      <span className="phf-entrances-note">Also CLI and MCP — one shared Commons.</span>
    </nav>
  )
}

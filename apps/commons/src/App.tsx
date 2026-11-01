/**
 * .phf — portable human format, over Photo Frame Commons. The Commons journey
 * leads; the br-ai-nstorm v0.3 "Real Shared Room" views stay one click away as
 * the room workbench.
 *
 * The frontend holds no canonical state. Everything on screen is read from the
 * backend, and every contribution and review is written through it, so what a
 * participant sees is what the shared room actually contains.
 *
 * State stays canonical. Map and Timeline are projections over the same data.
 */
import { useEffect, useMemo, useState } from 'react'
import { BrainCircuit, GitBranch, History, LayoutList, ListChecks, RefreshCw, Sparkles } from 'lucide-react'
import { useRoom } from './state/useRoom'
import { ProblemTabs } from './components/ProblemTabs'
import { StateView } from './components/StateView'
import { MapView } from './components/MapView'
import { TimelineView } from './components/TimelineView'
import { CurationPanel } from './components/CurationPanel'
import { SideRail } from './components/SideRail'
import { ApertureModal } from './components/ApertureModal'
import { ParticipantSwitcher } from './components/ParticipantSwitcher'
import { createContextPackage, validateContributionPackage } from './lib/aperture'
import { api } from './lib/api'
import { CommonsHub } from './components/commons/CommonsHub'
import { commonsReader } from './commons/reader'
import { useRoute } from './commons/client/router'
import { importedProblemSpaceId } from './commons/contracts'
import { journey } from './commons/client/journey'
import { EntranceTabs, JourneyBar, PhfEntry, PhfHeader, PhfUnavailable } from './components/phf/PhfShell'

type ViewMode = 'state' | 'map' | 'timeline' | 'curation'
type ModalMode = 'export' | 'import' | null

export default function App() {
  const room = useRoom()
  const [view, setView] = useState<ViewMode>('state')
  const [selectedId, setSelectedId] = useState<string>()
  const [draft, setDraft] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [modalValue, setModalValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [workbench, setWorkbench] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const route = useRoute()

  // Presenter guide: reaching a step marks it in this browser only.
  useEffect(() => {
    const state = journey.read()
    if (route.view === 'search' && route.query) journey.mark(state.done.includes('reply') ? 'rediscover' : 'find')
    if (route.view === 'repo' && state.followed) journey.mark('rediscover')
  }, [route])

  // A problem deep link (from search, the repository or a shared URL) opens that room, once the session exists.
  const routedProblem = route.view === 'problem' ? importedProblemSpaceId(route.problemId) : null
  useEffect(() => {
    if (!routedProblem || !room.token || room.problemId === routedProblem) return
    void room.openProblem(routedProblem)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routedProblem, room.token])

  const data = room.data
  const problem = data?.state.problem
  const selected = useMemo(
    () => data?.state.contributions.find((c) => c.id === selectedId),
    [data, selectedId],
  )
  const pendingCount = data?.proposals.filter((p) => p.status === 'pending').length ?? 0
  const openConflicts = data?.conflicts.open.length ?? 0

  /**
   * The seed data carries an editorial summary string ("3 approaches · 2
   * tensions"). Now that state is real it can drift from what is on screen, so
   * the header counts the projection instead of quoting the seed.
   */
  const stateSummary = useMemo(() => {
    if (!data) return ''
    const active = data.state.contributions.filter((c) => c.status === 'active')
    const count = (kind: string) => active.filter((c) => c.kind === kind).length
    const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
    const parts = [
      plural(count('approach'), 'approach', 'approaches'),
      plural(count('question'), 'open question', 'open questions'),
      plural(data.conflicts.open.length, 'unresolved conflict', 'unresolved conflicts'),
    ]
    if (pendingCount > 0) parts.push(`${pendingCount} awaiting review`)
    return parts.join(' · ')
  }, [data, pendingCount])

  const openExport = async (privateDraft = '') => {
    if (!data || !room.actor) return
    // The bounded candidate set is what lets the external model act as curator
    // in participant mode. If it cannot be fetched, export without it.
    const context = room.token
      ? await api.context(room.token, data.state.problem.id, privateDraft).catch(() => undefined)
      : undefined
    setModalValue(JSON.stringify(createContextPackage(data.state, room.actor, privateDraft, context), null, 2))
    setImportError(null)
    setModalMode('export')
  }

  const openImport = () => {
    if (!problem || !room.actor) return
    setModalValue(
      JSON.stringify(
        {
          $type: 'ai.bridgework.brainstorm.contributionPackage',
          schemaVersion: '0.2',
          problemId: problem.id,
          participantId: room.actor.actorId,
          contributions: [],
          privateProcessDisclosed: false,
        },
        null,
        2,
      ),
    )
    setImportError(null)
    setModalMode('import')
  }

  const handleModalPrimary = async () => {
    if (!problem) return
    if (modalMode === 'export') {
      try {
        await navigator.clipboard.writeText(modalValue)
        setImportError('Copied to clipboard.')
      } catch {
        setImportError('Clipboard unavailable — select the text and copy manually.')
      }
      return
    }
    try {
      const parsed = validateContributionPackage(JSON.parse(modalValue), problem.id)
      // Written through the backend like any other contribution, and attributed
      // to the session's participant — not to the participantId in the package.
      for (const item of parsed.contributions) {
        await room.addContribution({
          content: item.content,
          kind: item.kind,
          source: 'external_llm',
          preparedBy: 'ai:external-llm',
          sourceDetail: item.relationTo?.length ? `relates to ${item.relationTo.join(', ')}` : undefined,
          ...(item.proposals?.length ? { proposals: item.proposals } : {}),
        })
      }
      setModalMode(null)
      setImportError(null)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Could not import package.')
    }
  }

  const handleAdd = async () => {
    const content = draft.trim()
    if (!content) return
    await room.addContribution({ content, source: 'direct' })
    setDraft('')
  }

  return (
    <div className="app-shell">
      <PhfHeader actorName={room.actor?.displayName} onSwitchVoice={() => setVoiceOpen((v) => !v)} />

      {room.actor && voiceOpen && (
        <ParticipantSwitcher
          participants={room.participants}
          actor={room.actor}
          onSelect={(id) => { setVoiceOpen(false); void room.signIn(id) }}
          busy={room.busy}
        />
      )}

      {room.error && room.participants.length > 0 && (
        <div className="banner error" role="alert">
          {room.error}
        </div>
      )}
      {room.notice && !room.error && (
        <div className="banner notice" role="status" onClick={room.dismissNotice}>
          {room.notice}
        </div>
      )}

      {room.phase === 'connecting' && <div className="empty-state">Connecting to the Commons service…</div>}

      {room.phase === 'error' && room.participants.length === 0 && <PhfUnavailable error={room.error} />}

      {room.phase !== 'connecting' && !room.actor && room.participants.length > 0 && (
        <PhfEntry participants={room.participants} onSelect={(id) => void room.signIn(id)} busy={room.busy} />
      )}

      {room.actor && room.token && (
        <>
          <EntranceTabs route={route} />
          <JourneyBar route={route} />
          <CommonsHub
            route={route}
            token={room.token}
            actorId={room.actor.actorId}
            actorName={room.actor.displayName}
            canReview={room.actor.scopes.includes('memory:review')}
            reader={commonsReader}
            onSubmitted={(id) => {
              setSelectedId(undefined)
              setView('state')
              void room.openProblem(id)
            }}
          />
        </>
      )}

      {room.actor && (
        <div className="phf-workbench-toggle">
          <button className="button" onClick={() => setWorkbench((v) => !v)} aria-expanded={workbench}>
            <LayoutList size={14} /> {workbench ? 'Hide room workbench' : 'Room workbench (state, map, timeline, curation)'}
          </button>
          {workbench && (
            <span className="top-actions">
              <button className="button" onClick={() => void room.refresh()} disabled={room.busy || !data}>
                <RefreshCw size={15} /> {room.busy ? 'Refreshing…' : 'Refresh'}
              </button>
              <button className="button aperture" onClick={() => void openExport('')} disabled={!data}>
                <BrainCircuit size={16} /> Think with my AI ↗
              </button>
              <button className="button" onClick={openImport} disabled={!data}>
                Import AI result
              </button>
            </span>
          )}
        </div>
      )}

      {workbench && room.actor && room.problems.length > 0 && (
        <ProblemTabs
          problems={room.problems}
          activeId={room.problemId ?? room.problems[0].id}
          onSelect={(id) => {
            room.selectProblem(id)
            setSelectedId(undefined)
          }}
        />
      )}

      {workbench && room.actor && !data && room.phase !== 'error' && <div className="empty-state">Loading problem…</div>}

      {workbench && data && problem && (
        <main className="workspace">
          <section className="main-panel">
            <div className="problem-header">
              <div>
                <div className="section-kicker">Shared problem</div>
                <h1>{problem.title}</h1>
                <p>{problem.description}</p>
              </div>
              <div className="state-summary">{stateSummary}</div>
            </div>

            <div className="view-switcher" role="tablist">
              <button className={view === 'state' ? 'active' : ''} onClick={() => setView('state')}>
                <LayoutList size={15} /> State
                {openConflicts > 0 && <span className="badge conflict">{openConflicts}</span>}
              </button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
                <GitBranch size={15} /> Map
              </button>
              <button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}>
                <History size={15} /> Timeline
              </button>
              <button className={view === 'curation' ? 'active' : ''} onClick={() => setView('curation')}>
                <ListChecks size={15} /> Curation
                {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
              </button>
            </div>

            <div className="view-body">
              {view === 'state' && (
                <StateView
                  contributions={data.state.contributions}
                  conflicts={data.conflicts.all}
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                />
              )}
              {view === 'map' && (
                <MapView
                  contributions={data.state.contributions}
                  relations={data.state.relations}
                  conflicts={data.conflicts.all}
                  onSelect={setSelectedId}
                />
              )}
              {view === 'timeline' && (
                <TimelineView events={data.events} contributions={data.state.contributions} />
              )}
              {view === 'curation' && (
                <CurationPanel
                  proposals={data.proposals}
                  contributions={data.state.contributions}
                  onReview={(proposalId, accept) => void room.review(proposalId, accept)}
                  busy={room.busy}
                  actorId={room.actor?.actorId ?? null}
                  orchestration={problem.orchestration}
                  orchestrationOptions={data.orchestrationOptions}
                  onSetOrchestration={(mode, reason) => void room.setOrchestration(mode, reason)}
                />
              )}
            </div>
          </section>

          <SideRail
            updates={data.updates}
            selected={selected}
            draft={draft}
            setDraft={setDraft}
            onAdd={() => void handleAdd()}
            onThinkPrivate={() => void openExport(draft)}
            busy={room.busy}
            canContribute={Boolean(room.actor)}
          />
        </main>
      )}

      <footer className="footer-note">
        <Sparkles size={14} /> .phf is a proposal for portable human context, not a file format, humanity check or truth
        certificate. Built on Photo Frame Commons (br-ai-nstorm, Open Presence). AI may interpret and propose; only a
        participant makes something part of the shared record.
      </footer>

      {modalMode && (
        <ApertureModal
          title={modalMode === 'export' ? 'Think with your AI' : 'Import AI contribution'}
          help={
            modalMode === 'export'
              ? 'Copy this canonical state package into any LLM. Think privately there. When ready, ask it to return only the contributionPackage JSON.'
              : 'Paste the contributionPackage returned by your external LLM. Contributions are written through the backend, attributed to your session, and marked as AI-prepared and unreviewed.'
          }
          value={modalValue}
          setValue={setModalValue}
          primaryLabel={modalMode === 'export' ? 'Copy JSON' : 'Validate & contribute'}
          onPrimary={() => void handleModalPrimary()}
          onClose={() => {
            setModalMode(null)
            setImportError(null)
          }}
          status={importError}
        />
      )}
    </div>
  )
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AppLayout, useInvestigation } from './AppShell'
import { Badge, Button, Chip, Severity } from './Primitives'
import { Icon } from './Icon'
import {
  actions,
  actionId as defaultActionId,
  review,
  type ReviewAction,
} from '../../mock/commons'
import './Actions.css'
type ReviewStatus = (typeof review.tabs)[number]
const Reviews = createContext<{
  status: Record<string, ReviewStatus>
  update: (id: string, status: ReviewStatus) => void
}>({ status: {}, update: () => {} })
export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Record<string, ReviewStatus>>({})
  return (
    <Reviews.Provider
      value={{
        status,
        update: (id, s) => setStatus((v) => ({ ...v, [id]: s })),
      }}
    >
      {children}
    </Reviews.Provider>
  )
}
export function ActionList({ selectedId }: { selectedId: string }) {
  const [tab, setTab] = useState<ReviewStatus>('Offen')
  const [source, setSource] = useState('')
  const [owner, setOwner] = useState('')
  const { status } = useContext(Reviews)
  const filtered = actions.filter(
    (a) =>
      (status[a.id] ?? 'Offen') === tab &&
      (!source || a.sources.includes(source)),
  )
  return (
    <>
      <div className="subtabs" role="tablist" aria-label="Prüfstatus">
        {review.tabs.map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'on' : ''}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="filters">
        <label className="btn">
          <select
            aria-label="Kategorie"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Kategorie</option>
            <option>PDF Lab</option>
            <option>Commons</option>
            <option>Observatory</option>
          </select>
          <Icon name="down" />
        </label>
        <label className="btn">
          <select
            aria-label="Zuständig"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">Zuständig</option>
            <option>Nicht zugewiesen</option>
          </select>
          <Icon name="down" />
        </label>
      </div>
      {filtered.map((a) => (
        <Link
          to="/actions/$actionId"
          params={{ actionId: a.id }}
          key={a.id}
          className={`act ${selectedId === a.id ? 'on gb' : ''}`}
        >
          <div className="t">
            <Severity level={a.severity} />
            {a.title}
            <time>{a.time}</time>
          </div>
          <p>{a.description}</p>
          {a.sources.map((s, i) => (
            <span key={s}>
              {i > 0 && ' '}
              <Chip>{s}</Chip>
            </span>
          ))}
        </Link>
      ))}
      {filtered.length === 0 && <p className="sub">Keine Prüfungen</p>}
    </>
  )
}
export function SignalTable() {
  return (
    <div className="card sec">
      <div className="card-h">
        <h4>Zugehörige Signale</h4>
        <div className="tools">
          <Chip>PDF Lab</Chip>
          <Chip>Observatory</Chip>
          <Chip>+2</Chip>
        </div>
      </div>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabelle, horizontal scrollbar"
      >
        <table aria-label="Zugehörige Signale">
          <tbody>
            {review.signals.map((row) => (
              <tr key={row[0]}>
                {row.map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export function ReviewPlan({ action }: { action: ReviewAction }) {
  const [editing, setEditing] = useState(false)
  const [plan, setPlan] = useState(
    review.plan.map((p) => `${p.title} ${p.text}`).join('\n'),
  )
  const [approved, setApproved] = useState(false)
  const { update } = useContext(Reviews)
  return (
    <div className="sec">
      <h5>Vorgeschlagener Prüfplan</h5>
      {editing ? (
        <textarea
          aria-label="Prüfplan anpassen"
          className="plan-editor"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      ) : (
        <ol className="plan">
          {plan.split('\n').map((p, i) => (
            <li key={i}>
              <span>
                <b>{p.split(':')[0]}:</b>
                {p.slice(p.indexOf(':') + 1)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="approve">
        <span>
          {approved
            ? 'Prüfplan in dieser Vorschau freigegeben. Quellen bleiben unverändert.'
            : review.approval}
        </span>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? 'Plan speichern' : 'Plan anpassen'}
        </Button>
        <Button
          variant="primary"
          disabled={approved}
          onClick={() => {
            setApproved(true)
            update(action.id, 'Erledigt')
          }}
        >
          Plan freigeben
        </Button>
      </div>
    </div>
  )
}
export function ActionDetail({ action }: { action: ReviewAction }) {
  const navigate = useNavigate()
  const { setId } = useInvestigation()
  useEffect(
    () => setId(action.investigationId),
    [action.investigationId, setId],
  )
  const { status, update } = useContext(Reviews)
  return (
    <div className="detail">
      <div className="detail-h">
        <Severity level={action.severity} />
        <h2>{action.title}</h2>
        <div className="right">
          <Button
            onClick={() => update(action.id, 'Verworfen')}
            disabled={status[action.id] === 'Verworfen'}
          >
            {status[action.id] === 'Verworfen' ? 'Verworfen' : 'Verwerfen'}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setId(action.investigationId)
              void navigate({
                to: '/canvas/$investigationId',
                params: { investigationId: action.investigationId },
              })
            }}
          >
            Im Canvas öffnen
          </Button>
        </div>
      </div>
      <div className="metarow">
        <Badge tone={action.severity}>
          {action.severity === 'crit' ? 'Hoch' : 'Mittel'}
        </Badge>
        <span>{action.time}</span>
        <span>Nicht zugewiesen</span>
      </div>
      <div className="sec">
        <h5>
          <Icon name="spark" /> Einschätzung
        </h5>
        <p>{action.assessment}</p>
      </div>
      {action.id === defaultActionId ? (
        <>
          <SignalTable />
          <ReviewPlan key={action.id} action={action} />
        </>
      ) : (
        <p className="sub">Noch kein Prüfplan</p>
      )}
    </div>
  )
}
export function Actions({ actionId = defaultActionId }: { actionId?: string }) {
  const action = actions.find((a) => a.id === actionId)
  return (
    <AppLayout aside={<ActionList selectedId={actionId} />}>
      {action ? (
        <ActionDetail action={action} />
      ) : (
        <h2>Prüfung nicht gefunden</h2>
      )}
    </AppLayout>
  )
}

import { useId, type ComponentType } from 'react'
import type { EvidenceData } from '../../mock/commons'
import { Badge } from './Primitives'

export function EvidenceTable({ data }: { data: EvidenceData['table'] }) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Tabelle, horizontal scrollbar"
    >
      <table>
        <thead>
          <tr>
            {data.columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j}>
                  {typeof value === 'string' ? (
                    value
                  ) : value.href ? (
                    <a href={value.href}>{value.text}</a>
                  ) : (
                    <Badge tone={value.tone}>{value.text}</Badge>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function StatTiles({ data }: { data: EvidenceData['stats'] }) {
  return (
    <div className="tiles">
      {data.items.map((item) => (
        <div className="tile" key={item.label}>
          <b>{item.value}</b>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  )
}
export function LineChart({ data }: { data: EvidenceData['line'] }) {
  const gradient = useId()
  return (
    <>
      <svg
        viewBox="0 0 600 180"
        className="chart"
        role="img"
        aria-label={`${data.marker}, ${data.tooltip}`}
      >
        <g stroke="var(--border)">
          {[20, 70, 120, 160].map((y) => (
            <line key={y} x1="40" y1={y} x2="590" y2={y} />
          ))}
        </g>
        <g fill="var(--text-muted)" fontSize="11" fontFamily="var(--font)">
          <text x="8" y="24">
            100%
          </text>
          <text x="14" y="74">
            60%
          </text>
          <text x="14" y="124">
            20%
          </text>
          {data.xLabels.map((x) => (
            <text key={x.x} x={x.x} y="176">
              {x.label}
            </text>
          ))}
        </g>
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#${gradient})`}
          points={`${data.series[0].points} 590,160 40,160`}
        />
        {data.series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={`var(--${s.tone})`}
            strokeWidth="2"
            points={s.points}
          />
        ))}
        <line
          x1="340"
          y1="20"
          x2="340"
          y2="160"
          stroke="var(--text-muted)"
          strokeDasharray="3 3"
        />
        <circle cx="340" cy="90" r="4" fill="var(--accent)" />
        <circle cx="340" cy="92" r="4" fill="var(--crit)" />
        <g transform="translate(352,26)">
          <rect
            width="150"
            height="54"
            rx="8"
            fill="var(--surface)"
            stroke="var(--border-strong)"
          />
          <text
            x="12"
            y="20"
            fill="var(--text)"
            fontSize="12"
            fontFamily="var(--font)"
          >
            {data.marker}
          </text>
          <text
            x="12"
            y="40"
            fill="var(--accent-ink)"
            fontSize="12"
            fontFamily="var(--font)"
          >
            {data.tooltip}
          </text>
        </g>
      </svg>
      <Legend items={data.series} />
    </>
  )
}
export function ChainGraph({ data }: { data: EvidenceData['chain'] }) {
  return (
    <svg
      viewBox="0 0 300 190"
      className="chart"
      role="img"
      aria-label="Weitergabekette vom Interview 2019; die Verbindung zu Blog (B) ist ungesichert"
    >
      <g stroke="var(--border-strong)" strokeWidth="1.5">
        {data.edges.map((e, i) => (
          <line
            key={i}
            x1={data.nodes[e.from].x}
            y1={data.nodes[e.from].y}
            x2={data.nodes[e.to].x}
            y2={data.nodes[e.to].y}
            stroke={e.disputed ? 'var(--crit)' : undefined}
            strokeDasharray={e.disputed ? '4 3' : undefined}
          />
        ))}
      </g>
      {data.nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={`var(--${n.tone})`} />
      ))}
      <g fill="var(--text-muted)" fontSize="10.5" fontFamily="var(--font)">
        {data.labels.map((l) => (
          <text key={l.text} x={l.x} y={l.y}>
            {l.text}
          </text>
        ))}
      </g>
    </svg>
  )
}
function Legend({ items }: { items: { label: string; tone: string }[] }) {
  return (
    <div className="legend">
      {items.map((s) => (
        <span key={s.label}>
          <i style={{ background: `var(--${s.tone})` }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}
export function StackBar({ data }: { data: EvidenceData['stack'] }) {
  return (
    <>
      <div
        className="stack"
        role="img"
        aria-label={data.segments
          .map((s) => `${s.label}: ${s.value}%`)
          .join(', ')}
      >
        {data.segments.map((s) => (
          <div
            key={s.label}
            style={{ flex: s.value, background: `var(--${s.tone})` }}
          >
            {s.value}%
          </div>
        ))}
      </div>
      <Legend items={data.segments} />
    </>
  )
}
export const evidenceBodies: {
  [K in keyof EvidenceData]: ComponentType<{ data: EvidenceData[K] }>
} = {
  table: EvidenceTable,
  stats: StatTiles,
  line: LineChart,
  chain: ChainGraph,
  stack: StackBar,
}
export function EvidenceBody<K extends keyof EvidenceData>({
  kind,
  data,
}: {
  kind: K
  data: EvidenceData[K]
}) {
  const Body: ComponentType<{ data: EvidenceData[K] }> = evidenceBodies[kind]
  return <Body data={data} />
}

import type { IconName } from '../components/aurora/Icon'
export const investigationId = 'schwamm-zitat'
export const actionId = 'zuschreibung-14'
export const shell = {
  workspace: 'Basel Gemeingut',
  pinned: [
    ['home', 'Start'],
    ['search', 'Finden'],
    ['eye', 'Prüfen'],
    ['compare', 'Vergleichen'],
    ['doc', 'PDF Lab'],
    ['graph', 'Observatory'],
    ['pin', '+3'],
  ] as [IconName, string][],
  modes: [
    ['spark', 'Assistent'],
    ['canvas', 'Canvas'],
    ['bolt', 'Prüfungen'],
  ] as [IconName, string][],
  launcher: [
    {
      title: 'Plattform',
      items: [
        ['home', 'Start'],
        ['search', 'Finden'],
        ['eye', 'Prüfen'],
        ['compare', 'Vergleichen'],
        ['voices', 'Stimmen'],
      ] as [IconName, string][],
    },
    {
      title: 'Werkzeuge',
      items: [
        ['doc', 'PDF Lab'],
        ['graph', 'Observatory'],
        ['doc', '.phf-Export'],
        ['home', 'Demo zurücksetzen'],
      ] as [IconName, string][],
    },
    {
      title: 'Sammlungen',
      items: [
        ['canvas', 'Schwammstadt-Dossier'],
        ['canvas', 'Basler Lesungen'],
        ['canvas', 'Rheinlicht'],
      ] as [IconName, string][],
    },
  ],
}

export const assistant = {
  greeting: 'Guten Tag, Achim.',
  pendingReviews: 12,
  placeholder:
    'Frag nach Stimmen, Quellen, Korrekturen – / für Vorlagen, # für Sammlungen, @ für Agenten',
  suggestions: [
    'Woher stammt dieses Zitat?',
    'Welche Korrekturen sind noch nicht überall angekommen?',
    'Zeig mir Quellen mit ungesicherter Zuschreibung',
    'Vergleiche zwei Fassungen eines Textes',
    'Welche Stimmen fehlen in diesem Dossier?',
    'Erstelle eine .phf-Datei aus diesem PDF',
  ],
  disclaimer: 'Der Assistent kann Fehler machen. Prüfe die Belege.',
  privacy: 'So geht Commons mit Daten um',
}
export interface Thread {
  id: string
  title: string
  hasCanvas?: boolean
  hasAction?: boolean
}
export const threads: Thread[] = [
  {
    id: investigationId,
    title: 'Herkunft: «Stadt als Schwamm»-Zitat',
    hasCanvas: true,
  },
  { id: 'basler-rede', title: 'Wer hat die Basler Rede zuerst zitiert?' },
  {
    id: actionId,
    title: 'Zuschreibung widersprüchlich: Essay 14',
    hasAction: true,
    hasCanvas: true,
  },
  { id: 'korrekturen', title: 'Korrekturen dieser Woche' },
  { id: 'stimmen', title: 'Welche Stimmen fehlen im Dossier?' },
  {
    id: 'quellenvertrauen',
    title: 'Quellenvertrauen PDF-Sammlung',
    hasCanvas: true,
  },
  { id: 'gedichtfassungen', title: 'Zwei Gedichtfassungen vergleichen' },
  { id: 'rheinlicht', title: 'Paratext von «Rheinlicht» prüfen' },
]
export type TextPart = string | { text: string; cardId: string }
export interface Message {
  author: string
  initials?: string
  time?: string
  paragraphs: TextPart[][]
}
export const conversation: Message[] = [
  {
    author: 'Du',
    initials: 'AI',
    paragraphs: [
      [
        'Woher stammt das Zitat «Die Stadt als Schwamm» – und wer hat es seither verändert?',
      ],
    ],
  },
  {
    author: 'Assistent',
    time: '11:05',
    paragraphs: [
      [
        'Das Zitat geht auf ein ',
        { text: 'Interview von 2019', cardId: 'c-origin' },
        ' zurück. Seitdem erscheint es in 23 Quellen, davon 4 mit ',
        { text: 'ungesicherter Zuschreibung', cardId: 'c-trust' },
        '.',
      ],
      [
        'Zwei Fassungen weichen im Wortlaut ab; die ',
        { text: 'Korrektur vom 12. März', cardId: 'c-timeline' },
        ' ist noch nicht in allen Kopien angekommen.',
      ],
      [
        'Empfehlung: Fassung B prüfen und die ',
        { text: 'Weitergabekette', cardId: 'c-graph' },
        ' ergänzen.',
      ],
    ],
  },
]
export const canvas = {
  title: 'Herkunft: «Die Stadt als Schwamm»',
  shared: 'Geteilt',
  participants: [
    { initials: 'AI', tone: 'violet' },
    { initials: 'JB', tone: 'ok' },
    { initials: 'KG', tone: 'warn' },
  ],
  followup: '＋ Frag weiter, / für Vorlagen, # für Sammlungen',
}
export type Tone = 'ok' | 'warn' | 'crit' | 'violet' | 'acc'
export type Cell = string | { text: string; tone: Tone; href?: string }
export interface EvidenceData {
  table: { columns: string[]; rows: Cell[][] }
  stats: { items: { value: string; label: string }[] }
  line: {
    series: { label: string; tone: string; points: string }[]
    xLabels: { x: number; label: string }[]
    marker: string
    tooltip: string
  }
  chain: {
    nodes: { x: number; y: number; r: number; tone: string }[]
    edges: { from: number; to: number; disputed?: boolean }[]
    labels: { x: number; y: number; text: string }[]
  }
  stack: { segments: { label: string; value: number; tone: string }[] }
}
interface CardFrame {
  id: string
  title: string
  source: string
  badge?: { text: string; tone: Tone }
  span: 4 | 6 | 8 | 12
  subtitle?: string
}
export type Evidence = {
  [K in keyof EvidenceData]: CardFrame & { kind: K; data: EvidenceData[K] }
}[keyof EvidenceData]
export const evidence: Evidence[] = [
  {
    id: 'c-origin',
    title: 'Früheste Belege',
    source: 'PDF Lab',
    badge: { text: 'Quellen', tone: 'acc' },
    span: 6,
    kind: 'table',
    data: {
      columns: ['Datum', 'Quelle', 'Fassung', 'Status'],
      rows: [
        [
          '14.05.2019',
          'Interview, Basler Zeitung',
          'A',
          { text: 'Belegt', tone: 'ok' },
        ],
        [
          '02.11.2020',
          'Vortrag ETH, Folie 12',
          'A',
          { text: 'Belegt', tone: 'ok' },
        ],
        [
          '19.01.2022',
          'Blogbeitrag, anonym',
          'B',
          { text: 'Offen', tone: 'warn' },
        ],
      ],
    },
  },
  {
    id: 'c-trust',
    title: 'Quellenvertrauen',
    source: 'Commons',
    badge: { text: 'Übersicht', tone: 'ok' },
    subtitle: 'Alle Fundstellen des Zitats',
    span: 6,
    kind: 'stats',
    data: {
      items: [
        { value: '23', label: 'Fundstellen' },
        { value: '15', label: 'belegt' },
        { value: '4', label: 'ungesichert' },
        { value: '2', label: 'Fassungen' },
      ],
    },
  },
  {
    id: 'c-timeline',
    title: 'Verbreitung der Korrektur',
    source: 'Observatory',
    badge: { text: 'Verlauf', tone: 'violet' },
    span: 8,
    kind: 'line',
    data: {
      series: [
        {
          label: 'Korrigierte Kopien',
          tone: 'accent',
          points:
            '40,150 120,148 200,146 300,140 340,90 380,70 440,58 520,46 590,40',
        },
        {
          label: 'Alte Fassung im Umlauf',
          tone: 'crit',
          points:
            '40,30 120,32 200,34 300,40 340,92 380,110 440,120 520,132 590,138',
        },
      ],
      xLabels: [
        { x: 60, label: '1. Mär' },
        { x: 200, label: '8. Mär' },
        { x: 330, label: '12. Mär' },
        { x: 460, label: '20. Mär' },
      ],
      marker: '12. März · Korrektur',
      tooltip: '● 58% aktualisiert',
    },
  },
  {
    id: 'c-graph',
    title: 'Weitergabekette',
    source: 'Commons',
    span: 4,
    kind: 'chain',
    data: {
      nodes: [
        { x: 150, y: 30, r: 12, tone: 'accent' },
        { x: 70, y: 95, r: 9, tone: 'ok' },
        { x: 230, y: 95, r: 9, tone: 'ok' },
        { x: 40, y: 160, r: 7, tone: 'text-muted' },
        { x: 120, y: 160, r: 7, tone: 'text-muted' },
        { x: 200, y: 160, r: 7, tone: 'text-muted' },
        { x: 265, y: 160, r: 7, tone: 'crit' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 2, to: 6, disputed: true },
      ],
      labels: [
        { x: 168, y: 34, text: 'Interview 2019' },
        { x: 236, y: 182, text: 'Blog (B)' },
      ],
    },
  },
  {
    id: 'c-voices',
    title: 'Stimmen im Dossier',
    source: 'Commons',
    badge: { text: 'Vielfalt', tone: 'violet' },
    subtitle: 'Anteil zitierter Stimmen nach Rolle',
    span: 12,
    kind: 'stack',
    data: {
      segments: [
        { label: 'Fachleute', value: 48, tone: 'accent-ink' },
        { label: 'Anwohnende', value: 22, tone: 'violet' },
        { label: 'Verwaltung', value: 18, tone: 'warn' },
        { label: 'Kunst & Kultur', value: 12, tone: 'rose' },
      ],
    },
  },
]
export interface ReviewAction {
  id: string
  investigationId: string
  title: string
  time: string
  description: string
  sources: string[]
  severity: 'crit' | 'warn'
  assessment: string
}
export const actions: ReviewAction[] = [
  {
    id: actionId,
    investigationId,
    title: 'Zuschreibung widersprüchlich',
    time: 'Heute, 9:41',
    description:
      'Essay 14 nennt zwei unterschiedliche Urheber:innen für dieselbe Passage.',
    sources: ['PDF Lab', 'Commons', '+2'],
    severity: 'crit',
    assessment:
      'Essay 14 nennt für die Passage «Wasser hat ein Gedächtnis» zwei verschiedene Urheber:innen. Die ältere Quelle (Lesung 2018) ist belegt, die jüngere stützt sich auf eine Transkription ohne Paratext.',
  },
  {
    id: 'korrektur-rheinlicht',
    investigationId: 'rheinlicht',
    title: 'Korrektur nicht übernommen',
    time: 'Mo, 16:02',
    description: '3 Kopien von «Rheinlicht» zeigen noch die alte Fassung.',
    sources: ['Observatory'],
    severity: 'warn',
    assessment: '3 Kopien von «Rheinlicht» zeigen noch die alte Fassung.',
  },
  {
    id: 'quelle-paratext',
    investigationId: 'paratext',
    title: 'Quelle ohne Paratext',
    time: 'Mo, 10:15',
    description: 'Neu eingereichtes PDF enthält keine Herkunftsangaben.',
    sources: ['PDF Lab'],
    severity: 'warn',
    assessment: 'Neu eingereichtes PDF enthält keine Herkunftsangaben.',
  },
]
export const review = {
  tabs: ['Offen', 'Erledigt', 'Verworfen'] as const,
  signals: [
    [
      'PDF Lab',
      'Paratext fehlt',
      'Transkription ohne Herkunftsangabe',
      'Heute, 9:12',
    ],
    [
      'Commons',
      'Doppelte Zuschreibung',
      '2 Urheber:innen für eine Passage',
      'Heute, 9:40',
    ],
    [
      'Observatory',
      'Verbreitung',
      '7 Kopien übernehmen Fassung B',
      'Heute, 9:41',
    ],
  ],
  plan: [
    {
      title: 'Quelle sichern:',
      text: 'Lesungsaufnahme 2018 mit Zeitstempel verknüpfen.',
    },
    {
      title: 'Transkription prüfen:',
      text: 'Herkunft der zweiten Fassung erfragen.',
    },
    {
      title: 'Korrektur vorschlagen:',
      text: 'Zuschreibung in Essay 14 anpassen, Kopien benachrichtigen.',
    },
  ],
  approval: 'Nichts wird ohne deine Freigabe geändert.',
}

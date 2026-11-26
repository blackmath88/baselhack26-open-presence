import { Array, Effect, Number, Option, Schema } from 'effect'
import { Command, Runtime, type Update } from 'foldkit'
import { Document, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { modifyFields } from 'foldkit/struct'

// ---------------------------------------------------------------------------
// Domain data: a tiny static file system the Explorer windows browse.
// ---------------------------------------------------------------------------

const FileEntry = Schema.Struct({
  name: Schema.String,
  kind: Schema.Literals(['folder', 'file']),
  size: Schema.optional(Schema.Number),
})
type FileEntry = typeof FileEntry.Type

const FS: Record<string, ReadonlyArray<FileEntry>> = {
  '/': [{ name: 'Users', kind: 'folder' }],
  '/Users': [{ name: 'scott', kind: 'folder' }],
  '/Users/scott': [
    { name: 'Desktop', kind: 'folder' },
    { name: 'projects', kind: 'folder' },
    { name: 'notes.txt', kind: 'file', size: 2048 },
  ],
  '/Users/scott/Desktop': [{ name: 'rack-photo.jpg', kind: 'file', size: 4821376 }],
  '/Users/scott/projects': [
    { name: 'baselhack26-knowledge-lab', kind: 'folder' },
    { name: 'baselhack26-open-presence', kind: 'folder' },
    { name: 'ideas.md', kind: 'file', size: 512 },
  ],
  '/Users/scott/projects/baselhack26-knowledge-lab': [
    { name: 'src', kind: 'folder' },
    { name: 'README.md', kind: 'file', size: 3120 },
    { name: 'pyproject.toml', kind: 'file', size: 640 },
  ],
  '/Users/scott/projects/baselhack26-open-presence': [
    { name: 'apps', kind: 'folder' },
    { name: 'modules', kind: 'folder' },
    { name: 'README.md', kind: 'file', size: 2210 },
  ],
}

const FAVORITES: ReadonlyArray<string> = ['/', '/Users/scott', '/Users/scott/projects']

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WINDOW_WIDTH = 460
const WINDOW_HEIGHT = 300
const ZOOM_MIN = 0.25
const ZOOM_MAX = 4
const ZOOM_FACTOR = 1.25
const AGENT_STEP_MS = 800

interface AgentStep {
  readonly path: string
  readonly note: string
}

const AGENT_STEPS: ReadonlyArray<AgentStep> = [
  { path: '/', note: 'map the machine layout' },
  { path: '/Users/scott', note: 'list the home directory' },
  { path: '/Users/scott/projects', note: 'list the projects' },
  { path: '/Users/scott/projects/baselhack26-open-presence', note: 'inspect the hackathon repo' },
]
const AGENT_STEP_FALLBACK: AgentStep = { path: '/', note: 'noop' }

// ---------------------------------------------------------------------------
// MODEL
// ---------------------------------------------------------------------------

const Camera = Schema.Struct({
  x: Schema.Number,
  y: Schema.Number,
  zoom: Schema.Number,
})

const ExplorerWindow = Schema.Struct({
  id: Schema.Number,
  path: Schema.String,
  x: Schema.Number,
  y: Schema.Number,
  z: Schema.Number,
})
type ExplorerWindow = typeof ExplorerWindow.Type

const Drag = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal('pan'),
    startClientX: Schema.Number,
    startClientY: Schema.Number,
    startCameraX: Schema.Number,
    startCameraY: Schema.Number,
  }),
  Schema.Struct({
    kind: Schema.Literal('window'),
    windowId: Schema.Number,
    startClientX: Schema.Number,
    startClientY: Schema.Number,
    startX: Schema.Number,
    startY: Schema.Number,
  }),
])

export const Model = Schema.Struct({
  camera: Camera,
  windows: Schema.Array(ExplorerWindow),
  nextId: Schema.Number,
  nextZ: Schema.Number,
  drag: Schema.Option(Drag),
  log: Schema.Array(Schema.String),
  agentRunning: Schema.Boolean,
})
export type Model = typeof Model.Type

// ---------------------------------------------------------------------------
// MESSAGE
// ---------------------------------------------------------------------------

export const Message = defineMessageUnion({
  BackgroundPointerDown: { x: Schema.Number, y: Schema.Number },
  TitlebarPointerDown: { windowId: Schema.Number, x: Schema.Number, y: Schema.Number },
  WindowPointerDown: { windowId: Schema.Number },
  PointerMoved: { x: Schema.Number, y: Schema.Number },
  PointerUp: {},
  Zoomed: { direction: Schema.Number, centerX: Schema.Number, centerY: Schema.Number },
  ZoomReset: { centerX: Schema.Number, centerY: Schema.Number },
  ClickedSpawnExplorer: { centerX: Schema.Number, centerY: Schema.Number },
  ClickedCloseWindow: { windowId: Schema.Number },
  ClickedNavigate: { windowId: Schema.Number, path: Schema.String },
  ClickedEntry: { windowId: Schema.Number, name: Schema.String },
  ClickedRunAgent: { centerX: Schema.Number, centerY: Schema.Number },
  AgentSpawnedExplorer: {
    path: Schema.String,
    note: Schema.String,
    x: Schema.Number,
    y: Schema.Number,
    step: Schema.Number,
    total: Schema.Number,
    baseX: Schema.Number,
    baseY: Schema.Number,
  },
})
export type Message = typeof Message.Type

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

export const init: Runtime.ApplicationInit<Model, Message> = () => ({
  model: {
    camera: { x: 40, y: 80, zoom: 1 },
    windows: [
      { id: 0, path: '/', x: 90, y: 120, z: 1 },
      { id: 1, path: '/Users/scott/projects', x: 640, y: 260, z: 2 },
    ],
    nextId: 2,
    nextZ: 3,
    drag: Option.none(),
    log: [],
    agentRunning: false,
  },
})

// ---------------------------------------------------------------------------
// COMMAND
// ---------------------------------------------------------------------------

export const RunAgentStep = Command.define('RunAgentStep', {
  args: {
    step: Schema.Number,
    total: Schema.Number,
    baseX: Schema.Number,
    baseY: Schema.Number,
  },
  messages: [Message.AgentSpawnedExplorer],
  execute: ({ step, total, baseX, baseY }) =>
    Effect.gen(function* () {
      yield* Effect.sleep(AGENT_STEP_MS)
      const agentStep = Option.getOrElse(Array.get(AGENT_STEPS, step), () => AGENT_STEP_FALLBACK)
      return Message.AgentSpawnedExplorer({
        path: agentStep.path,
        note: agentStep.note,
        x: baseX + step * 150,
        y: baseY + step * 90,
        step,
        total,
        baseX,
        baseY,
      })
    }),
})

// ---------------------------------------------------------------------------
// UPDATE helpers
// ---------------------------------------------------------------------------

const clampZoom = (zoom: number): number => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))

const worldFromScreen = (
  screenX: number,
  screenY: number,
  camera: typeof Camera.Type,
): { x: number; y: number } => ({
  x: (screenX - camera.x) / camera.zoom,
  y: (screenY - camera.y) / camera.zoom,
})

const raiseWindow = (model: Model, windowId: number): Model =>
  modifyFields(model, {
    windows: Array.map(win => (win.id === windowId ? { ...win, z: model.nextZ } : win)),
    nextZ: Number.increment,
  })

const addWindow = (model: Model, path: string, x: number, y: number): Model =>
  modifyFields(model, {
    windows: Array.append({ id: model.nextId, path, x, y, z: model.nextZ }),
    nextId: Number.increment,
    nextZ: Number.increment,
  })

const joinPath = (dir: string, name: string): string =>
  dir === '/' ? `/${name}` : `${dir}/${name}`

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    BackgroundPointerDown: ({ x, y }) => ({
      model: modifyFields(model, {
        drag: () =>
          Option.some({
            kind: 'pan',
            startClientX: x,
            startClientY: y,
            startCameraX: model.camera.x,
            startCameraY: model.camera.y,
          }),
      }),
    }),

    TitlebarPointerDown: ({ windowId, x, y }) => {
      const win = Array.findFirst(model.windows, w => w.id === windowId)
      return {
        model: modifyFields(raiseWindow(model, windowId), {
          drag: () =>
            Option.map(win, w => ({
              kind: 'window' as const,
              windowId,
              startClientX: x,
              startClientY: y,
              startX: w.x,
              startY: w.y,
            })),
        }),
      }
    },

    WindowPointerDown: ({ windowId }) => ({ model: raiseWindow(model, windowId) }),

    PointerMoved: ({ x, y }) => {
      if (Option.isNone(model.drag)) {
        return { model }
      }
      const drag = model.drag.value
      if (drag.kind === 'pan') {
        return {
          model: modifyFields(model, {
            camera: () => ({
              ...model.camera,
              x: drag.startCameraX + (x - drag.startClientX),
              y: drag.startCameraY + (y - drag.startClientY),
            }),
          }),
        }
      }
      return {
        model: modifyFields(model, {
          windows: Array.map(win =>
            win.id === drag.windowId
              ? {
                  ...win,
                  x: drag.startX + (x - drag.startClientX) / model.camera.zoom,
                  y: drag.startY + (y - drag.startClientY) / model.camera.zoom,
                }
              : win,
          ),
        }),
      }
    },

    PointerUp: () => ({ model: modifyFields(model, { drag: () => Option.none() }) }),

    Zoomed: ({ direction, centerX, centerY }) => {
      const zoom = clampZoom(model.camera.zoom * (direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR))
      const ratio = zoom / model.camera.zoom
      return {
        model: modifyFields(model, {
          camera: () => ({
            zoom,
            x: centerX - (centerX - model.camera.x) * ratio,
            y: centerY - (centerY - model.camera.y) * ratio,
          }),
        }),
      }
    },

    ZoomReset: ({ centerX, centerY }) => {
      const ratio = 1 / model.camera.zoom
      return {
        model: modifyFields(model, {
          camera: () => ({
            zoom: 1,
            x: centerX - (centerX - model.camera.x) * ratio,
            y: centerY - (centerY - model.camera.y) * ratio,
          }),
        }),
      }
    },

    ClickedSpawnExplorer: ({ centerX, centerY }) => {
      const world = worldFromScreen(centerX, centerY, model.camera)
      return {
        model: addWindow(model, '/', world.x - WINDOW_WIDTH / 2, world.y - WINDOW_HEIGHT / 2),
      }
    },

    ClickedCloseWindow: ({ windowId }) => ({
      model: modifyFields(model, { windows: Array.filter(win => win.id !== windowId) }),
    }),

    ClickedNavigate: ({ windowId, path }) => ({
      model: modifyFields(model, {
        windows: Array.map(win => (win.id === windowId ? { ...win, path } : win)),
      }),
    }),

    ClickedEntry: ({ windowId, name }) => {
      const win = Array.findFirst(model.windows, w => w.id === windowId)
      if (Option.isNone(win)) {
        return { model }
      }
      const target = win.value
      const entry = Array.findFirst(FS[target.path] ?? [], e => e.name === name)
      if (Option.isNone(entry)) {
        return { model }
      }
      const e = entry.value
      if (e.kind === 'folder') {
        const path = joinPath(target.path, e.name)
        return {
          model: modifyFields(model, {
            windows: Array.map(w => (w.id === windowId ? { ...w, path } : w)),
          }),
        }
      }
      return {
        model: modifyFields(model, {
          log: Array.append(`opened file ${joinPath(target.path, e.name)}`),
        }),
      }
    },

    ClickedRunAgent: ({ centerX, centerY }) => {
      const world = worldFromScreen(centerX, centerY, model.camera)
      return {
        model: modifyFields(model, { agentRunning: () => true }),
        commands: [
          RunAgentStep({
            step: 0,
            total: AGENT_STEPS.length,
            baseX: world.x - WINDOW_WIDTH / 2,
            baseY: world.y - WINDOW_HEIGHT / 2,
          }),
        ],
      }
    },

    AgentSpawnedExplorer: ({ path, note, x, y, step, total, baseX, baseY }) => {
      const spawned = addWindow(model, path, x, y)
      const logged = modifyFields(spawned, {
        log: Array.append(`opus-5.5 · ${note} → Explorer at ${path}`),
      })
      if (step + 1 < total) {
        return {
          model: logged,
          commands: [RunAgentStep({ step: step + 1, total, baseX, baseY })],
        }
      }
      return { model: modifyFields(logged, { agentRunning: () => false }) }
    },
  })

// ---------------------------------------------------------------------------
// VIEW
// ---------------------------------------------------------------------------

const viewportCenter = (): { x: number; y: number } => ({
  x: (typeof window === 'undefined' ? 1280 : window.innerWidth) / 2,
  y: (typeof window === 'undefined' ? 800 : window.innerHeight) / 2,
})

const zoomMessage = (direction: number): Message => {
  const c = viewportCenter()
  return Message.Zoomed({ direction, centerX: c.x, centerY: c.y })
}

const resetMessage = (): Message => {
  const c = viewportCenter()
  return Message.ZoomReset({ centerX: c.x, centerY: c.y })
}

const spawnMessage = (): Message => {
  const c = viewportCenter()
  return Message.ClickedSpawnExplorer({ centerX: c.x, centerY: c.y })
}

const runAgentMessage = (): Message => {
  const c = viewportCenter()
  return Message.ClickedRunAgent({ centerX: c.x, centerY: c.y })
}

const handleKeyDown = (key: string): Option.Option<Message> => {
  if (key === '+' || key === '=') {
    return Option.some(zoomMessage(1))
  }
  if (key === '-') {
    return Option.some(zoomMessage(-1))
  }
  if (key === '0') {
    return Option.some(resetMessage())
  }
  return Option.none()
}

const handlePointerDown = (
  button: number,
  clientX: number,
  clientY: number,
  target: EventTarget | null,
): Option.Option<Message> => {
  if (button !== 0) {
    return Option.none()
  }
  const el = target instanceof HTMLElement ? target : null
  const titlebar = el?.closest('[data-titlebar]')
  if (titlebar instanceof HTMLElement) {
    return Option.some(
      Message.TitlebarPointerDown({
        windowId: globalThis.Number(titlebar.dataset.titlebar),
        x: clientX,
        y: clientY,
      }),
    )
  }
  const win = el?.closest('[data-window]')
  if (win instanceof HTMLElement) {
    return Option.some(
      Message.WindowPointerDown({ windowId: globalThis.Number(win.dataset.window) }),
    )
  }
  return Option.some(Message.BackgroundPointerDown({ x: clientX, y: clientY }))
}

const trafficLight = (
  color: string,
  label: string,
  message: Option.Option<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.Class('light'),
      h.Style({ background: color }),
      h.AriaLabel(label),
      ...(Option.isSome(message) ? [h.OnClick(message.value)] : []),
    ],
    [],
  )

const titlebarView = (win: ExplorerWindow, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('window-titlebar'), h.DataAttribute('titlebar', String(win.id))],
    [
      h.div([h.Class('lights')], [
        trafficLight('#ff5f57', 'close', Option.some(Message.ClickedCloseWindow({ windowId: win.id })), h),
        trafficLight('#febc2e', 'minimize', Option.none(), h),
        trafficLight('#28c840', 'zoom', Option.none(), h),
      ]),
      h.span([h.Class('window-title')], [win.path]),
    ],
  )

const sidebarView = (win: ExplorerWindow, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('sidebar')],
    [
      h.div([h.Class('sidebar-heading')], ['Favorites']),
      ...FAVORITES.map(path =>
        h.div(
          [
            h.Class(win.path === path ? 'sidebar-item active' : 'sidebar-item'),
            h.OnClick(Message.ClickedNavigate({ windowId: win.id, path })),
          ],
          [path],
        ),
      ),
    ],
  )

const entryRow = (win: ExplorerWindow, entry: FileEntry, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class('entry'),
      h.OnClick(Message.ClickedEntry({ windowId: win.id, name: entry.name })),
    ],
    [
      h.span([h.Class('entry-icon')], [entry.kind === 'folder' ? '📁' : '📄']),
      h.span([h.Class('entry-name')], [entry.name]),
      h.span(
        [h.Class('entry-size')],
        [entry.kind === 'file' && entry.size !== undefined ? `${entry.size} B` : ''],
      ),
    ],
  )

const bodyView = (win: ExplorerWindow, h: HtmlBuilder<Message>): Html => {
  const entries = FS[win.path] ?? []
  return h.div([h.Class('window-body')], [
    sidebarView(win, h),
    h.div([h.Class('entries')], entries.map(entry => entryRow(win, entry, h))),
  ])
}

const statusBarView = (win: ExplorerWindow, h: HtmlBuilder<Message>): Html => {
  const entries = FS[win.path] ?? []
  return h.div([h.Class('status-bar')], [`${entries.length} items · ${win.path}`])
}

const windowView = (win: ExplorerWindow, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class('window'),
      h.DataAttribute('window', String(win.id)),
      h.Style({
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${WINDOW_WIDTH}px`,
        height: `${WINDOW_HEIGHT}px`,
        zIndex: String(win.z),
      }),
    ],
    [titlebarView(win, h), bodyView(win, h), statusBarView(win, h)],
  )

const hudButton = (
  label: string,
  message: Message,
  h: HtmlBuilder<Message>,
): Html => h.button([h.Class('btn'), h.OnClick(message)], [label])

const hudView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('hud')], [
    h.span([h.Class('hud-title')], ['Opus Canvas']),
    hudButton('−', zoomMessage(-1), h),
    h.span([h.Class('hud-zoom')], [`${Math.round(model.camera.zoom * 100)}%`]),
    hudButton('+', zoomMessage(1), h),
    hudButton('Reset', resetMessage(), h),
    hudButton('+ Explorer window', spawnMessage(), h),
    hudButton(model.agentRunning ? 'Agent running…' : '▶ Run agent task', runAgentMessage(), h),
    h.span([h.Class('hud-hint')], [
      'drag background to pan · drag a titlebar to move · click a window to raise · +/−/0 zoom',
    ]),
  ])

const logView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('log')], [
    h.div([h.Class('log-heading')], ['agent log']),
    ...Array.takeRight(model.log, 6).map(line => h.div([h.Class('log-line')], [line])),
  ])

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const cam = model.camera
  const gridSize = 24 * cam.zoom
  return {
    title: `Opus Canvas (${model.windows.length} windows)`,
    body: h.div(
      [
        h.Class('viewport'),
        h.Tabindex(0),
        h.Style({
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.35) 1px, transparent 1px)',
          backgroundPosition: `${cam.x}px ${cam.y}px`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }),
        h.OnPointerDown((_pointerType, button, _sx, _sy, _ts, clientX, clientY, _pid, target) =>
          handlePointerDown(button, clientX, clientY, target),
        ),
        h.OnPointerMove((screenX, screenY, _pointerType) =>
          Option.isSome(model.drag)
            ? Option.some(Message.PointerMoved({ x: screenX, y: screenY }))
            : Option.none(),
        ),
        h.OnPointerUp((_sx, _sy, _pointerType, _ts) =>
          Option.isSome(model.drag) ? Option.some(Message.PointerUp()) : Option.none(),
        ),
        h.OnKeyDownPreventDefault(handleKeyDown),
      ],
      [
        h.div(
          [
            h.Class('world'),
            h.Style({
              transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.zoom})`,
              transformOrigin: '0 0',
            }),
          ],
          model.windows.map(win => windowView(win, h)),
        ),
        hudView(model, h),
        logView(model, h),
      ],
    ),
  }
}

import { Option } from 'effect'
import { describe, expect, it } from 'vitest'

import { Message, init, update } from './main'

const base = () => init().model

describe('infinite canvas model', () => {
  it('spawns an Explorer window centered on the viewport in world coords', () => {
    const model = base()
    const result = update(model, Message.ClickedSpawnExplorer({ centerX: 640, centerY: 400 }))
    expect(result.model.windows).toHaveLength(3)
    const spawned = result.model.windows[2]
    expect(spawned?.path).toBe('/')
    expect(spawned?.x).toBeCloseTo(640 - 40 - 230)
    expect(spawned?.y).toBeCloseTo(400 - 80 - 150)
    expect(spawned?.z).toBe(3)
  })

  it('pans the camera while dragging the background and clears the drag on pointer up', () => {
    let model = base()
    model = update(model, Message.BackgroundPointerDown({ x: 100, y: 100 })).model
    expect(Option.isSome(model.drag)).toBe(true)
    model = update(model, Message.PointerMoved({ x: 160, y: 130 })).model
    expect(model.camera.x).toBeCloseTo(100)
    expect(model.camera.y).toBeCloseTo(110)
    model = update(model, Message.PointerUp()).model
    expect(Option.isNone(model.drag)).toBe(true)
  })

  it('moves a window by titlebar drag, scaled by zoom, and raises it', () => {
    let model = base()
    model = update(model, Message.TitlebarPointerDown({ windowId: 0, x: 10, y: 10 })).model
    expect(model.windows[0]?.z).toBe(3)
    model = update(model, Message.PointerMoved({ x: 60, y: 40 })).model
    expect(model.windows[0]?.x).toBeCloseTo(90 + 50)
    expect(model.windows[0]?.y).toBeCloseTo(120 + 30)
  })

  it('divides window drag deltas by zoom', () => {
    let model = base()
    model = update(
      model,
      Message.Zoomed({ direction: 1, centerX: 0, centerY: 0 }),
    ).model
    const zoom = model.camera.zoom
    model = update(model, Message.TitlebarPointerDown({ windowId: 0, x: 0, y: 0 })).model
    model = update(model, Message.PointerMoved({ x: 50, y: 0 })).model
    expect(model.windows[0]?.x).toBeCloseTo(90 + 50 / zoom)
  })

  it('zooms around the given center and clamps', () => {
    let model = base()
    model = update(model, Message.Zoomed({ direction: 1, centerX: 640, centerY: 400 })).model
    expect(model.camera.zoom).toBeCloseTo(1.25)
    expect(model.camera.x).toBeCloseTo(640 - (640 - 40) * 1.25)
    for (let i = 0; i < 20; i++) {
      model = update(model, Message.Zoomed({ direction: -1, centerX: 0, centerY: 0 })).model
    }
    expect(model.camera.zoom).toBeCloseTo(0.25)
  })

  it('resets zoom to 1 keeping the center fixed', () => {
    let model = base()
    model = update(model, Message.Zoomed({ direction: 1, centerX: 0, centerY: 0 })).model
    expect(model.camera.x).toBeCloseTo(50)
    model = update(model, Message.ZoomReset({ centerX: 100, centerY: 100 })).model
    expect(model.camera.zoom).toBe(1)
    expect(model.camera.x).toBeCloseTo(60)
    expect(model.camera.y).toBeCloseTo(100)
  })

  it('closes a window', () => {
    const result = update(base(), Message.ClickedCloseWindow({ windowId: 0 }))
    expect(result.model.windows).toHaveLength(1)
    expect(result.model.windows[0]?.id).toBe(1)
  })

  it('navigates into a folder and logs when a file is opened', () => {
    let model = base()
    model = update(
      model,
      Message.ClickedEntry({ windowId: 1, name: 'baselhack26-open-presence' }),
    ).model
    expect(model.windows[1]?.path).toBe('/Users/scott/projects/baselhack26-open-presence')
    model = update(model, Message.ClickedEntry({ windowId: 1, name: 'README.md' })).model
    expect(model.log).toHaveLength(1)
    expect(model.log[0]).toContain('README.md')
  })

  it('runs the agent: chains steps and clears agentRunning at the end', () => {
    let model = base()
    const start = update(model, Message.ClickedRunAgent({ centerX: 640, centerY: 400 }))
    expect(start.model.agentRunning).toBe(true)
    expect(start.commands).toHaveLength(1)

    let result = update(
      start.model,
      Message.AgentSpawnedExplorer({
        path: '/Users',
        note: 'list home',
        x: 0,
        y: 0,
        step: 0,
        total: 4,
        baseX: 0,
        baseY: 0,
      }),
    )
    expect(result.model.windows).toHaveLength(3)
    expect(result.model.log).toHaveLength(1)
    expect(result.commands).toHaveLength(1)

    result = update(
      result.model,
      Message.AgentSpawnedExplorer({
        path: '/Users/scott/projects/baselhack26-open-presence',
        note: 'inspect repo',
        x: 450,
        y: 270,
        step: 3,
        total: 4,
        baseX: 0,
        baseY: 0,
      }),
    )
    expect(result.model.windows).toHaveLength(4)
    expect(result.model.agentRunning).toBe(false)
    expect(result.commands ?? []).toHaveLength(0)
  })
})

import { Command, click, expect, given, role, scene, text } from 'foldkit/scene'
import { describe, test } from 'vitest'

import { Message, RunAgentStep, init, update, view } from './main'

describe('view', () => {
  test('renders the HUD and the initial Explorer windows', () => {
    scene(
      { update, view },
      given(init().model),
      expect(text('Opus Canvas')).toExist(),
      expect(role('button', { name: '+ Explorer window' })).toExist(),
      expect(role('button', { name: '▶ Run agent task' })).toExist(),
      expect(role('button', { name: 'Reset' })).toExist(),
      expect(text('/Users/scott/projects')).toExist(),
      expect(text('3 items · /Users/scott/projects')).toExist(),
      expect(text('1 items · /')).toExist(),
    )
  })

  test('running the agent spawns an Explorer window and returns to idle', () => {
    scene(
      { update, view },
      given(init().model),
      click(role('button', { name: '▶ Run agent task' })),
      expect(role('button', { name: 'Agent running…' })).toExist(),
      Command.resolve(
        RunAgentStep,
        Message.AgentSpawnedExplorer({
          path: '/Users/scott/projects/baselhack26-open-presence',
          note: 'inspect the hackathon repo',
          x: 450,
          y: 270,
          step: 3,
          total: 4,
          baseX: 0,
          baseY: 0,
        }),
      ),
      expect(role('button', { name: '▶ Run agent task' })).toExist(),
      expect(text('/Users/scott/projects/baselhack26-open-presence')).toExist(),
      expect(text('3 items · /Users/scott/projects/baselhack26-open-presence')).toExist(),
      expect(text('opus-5.5 · inspect the hackathon repo → Explorer at /Users/scott/projects/baselhack26-open-presence')).toExist(),
    )
  })
})

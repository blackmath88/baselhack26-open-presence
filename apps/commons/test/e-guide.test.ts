import { describe, expect, it } from 'vitest'
import { pickLine, SIDE_MISSIONS } from '../src/components/EGuide'

describe('E guide', () => {
  it('picks a deterministic line from the seed', () => {
    expect(pickLine(['a', 'b', 'c'], 0)).toBe('a')
    expect(pickLine(['a', 'b', 'c'], 4)).toBe('b')
    expect(pickLine(['a', 'b', 'c'], -2)).toBe('c')
  })

  it('offers the side missions as sidetrack targets', () => {
    const ids = SIDE_MISSIONS.map((m) => m.id)
    expect(ids).toContain('pdf-lab')
    expect(ids).toContain('pdf-history')
    for (const mission of SIDE_MISSIONS) {
      expect(mission.href).toContain('github.com/blackmath88/baselhack26-open-presence')
      expect(mission.title.length).toBeGreaterThan(0)
      expect(mission.blurb.length).toBeGreaterThan(0)
    }
  })
})

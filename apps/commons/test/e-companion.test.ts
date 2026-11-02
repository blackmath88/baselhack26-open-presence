import { describe, expect, it } from 'vitest'
import { authoredPosition, clampPosition, pageContext, replyTo, restorePosition } from '../src/companion/model'
describe('persistent e placement', () => {
  it('keeps dragged positions reachable after a desktop-to-phone resize', () => {
    const p = restorePosition({ x: .99, y: .99 }, { width: 390, height: 700 })!
    expect(p.x).toBeLessThanOrEqual(278)
    expect(p.y).toBeLessThanOrEqual(588)
    expect(p.x).toBeGreaterThanOrEqual(12)
  })
  it('rejects corrupted storage rather than placing e outside the viewport', () => {
    for (const value of [null, {}, { x: '0.5', y: .5 }, { x: Infinity, y: 0 }]) expect(restorePosition(value, { width: 400, height: 800 })).toBeNull()
    expect(clampPosition({ x: NaN, y: -900 }, { width: 400, height: 800 })).toEqual({ x: 288, y: 12 })
  })
  it('chooses the free side of an authored anchor and docks on narrow screens', () => {
    const anchor = { left: 20, right: 500, top: 100, bottom: 300 }
    expect(authoredPosition({ width: 1000, height: 800 }, anchor)).toEqual({ x: 516, y: 112 })
    expect(authoredPosition({ width: 390, height: 700 }, anchor, 'left')).toEqual({ x: 24, y: 576 })
  })
  it('gives search, evidence, story and lab their own context and admits authored limits', () => {
    expect(pageContext('/commons/', '#/compare?a=x&b=y').explanation).toContain('shared cause')
    expect(pageContext('/pdf-lab/', '').side).toBe('left')
    expect(pageContext('/story/', '#past').side).toBe('left')
    expect(pageContext('/story/', '#future').side).toBe('right')
    expect(replyTo('make a reservation', pageContext('/e/', ''))).toContain('not connected')
  })
})

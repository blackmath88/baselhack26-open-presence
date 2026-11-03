import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearDemoStorage, DOCK_FLAG } from '../src/features/lab/presenterReset'

function storage(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  }
}
afterEach(() => vi.unstubAllGlobals())

describe('presenter reset storage boundary', () => {
  it('removes all photo-frame drafts, preserving other problems and other storage', () => {
    const keep = { problemId: 'reset-after-uboot', parentId: 'other-reply', text: 'Keep this draft.' }
    const local = storage({
      'commons.drafts.v1': JSON.stringify([
        { problemId: 'usb-c-no-data', text: 'Root draft' },
        { problemId: 'usb-c-no-data', parentId: 'reply-target', text: 'Reply draft' },
        keep,
      ]),
      unrelated: 'untouched',
    })
    const session = storage({ [DOCK_FLAG]: '1', unrelated: 'also untouched' })
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', session)
    clearDemoStorage()
    expect(JSON.parse(local.getItem('commons.drafts.v1')!)).toEqual([keep])
    expect(local.getItem('unrelated')).toBe('untouched')
    expect(session.getItem(DOCK_FLAG)).toBeNull()
    expect(session.getItem('unrelated')).toBe('also untouched')
  })
  it.each(['not json', '{"unexpected":"shape"}'])('preserves unreadable drafts: %s', (raw) => {
    const local = storage({ 'commons.drafts.v1': raw })
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', storage({}))
    clearDemoStorage()
    expect(local.getItem('commons.drafts.v1')).toBe(raw)
  })
  it('tolerates unavailable storage without preventing route reset', () => {
    vi.stubGlobal('sessionStorage', { removeItem: () => { throw new Error('blocked') } })
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked') } })
    expect(() => clearDemoStorage()).not.toThrow()
  })
})

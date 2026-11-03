import { describe, expect, it } from 'vitest'
import { notIncluded, outgoingCommand } from '../../src/commons/client/outgoing'
import type { PreparedContribution } from '../../src/commons/client/api'
import { rediscoveryWords } from '../../src/components/commons/ProblemPanel'

const prepared = (command?: Partial<NonNullable<PreparedContribution['command']>>): PreparedContribution => ({
  ok: Boolean(command), errors: command ? [] : ['text is required.'], warnings: [],
  destination: { roomId: 'commons:usb-c-no-data', problemId: 'usb-c-no-data', link: '#/problems/usb-c-no-data', visibility: 'local shared room', publication: 'none' },
  ...(command ? { command: { commandId: 'prepared:x', problemId: 'usb-c-no-data', text: 'Works with a data cable', sourceRefs: ['issue-3'], kind: 'observation', assistance: 'none', ...command } } : {}),
})

describe('outgoing contribution', () => {
  it('is the prepared command unchanged, keyed by the draft id', () => {
    const p = prepared({ circumstances: 'macOS 15', evidenceIds: ['e2'] })
    const body = outgoingCommand(p, 'draft-1')!
    const { commandId, entrance, ...rest } = body
    const { commandId: _prepared, ...previewed } = p.command!
    expect(rest).toEqual(previewed)
    expect(commandId).toBe('draft-1')
    expect(entrance).toBe('browser')
  })

  it('sends nothing when the preview has errors', () => {
    expect(outgoingCommand(prepared(), 'draft-1')).toBeUndefined()
  })

  it('names search words and other drafts as staying in the browser only when the body does not contain them', () => {
    const body = outgoingCommand(prepared({}), 'd')!
    const other = { id: 'o', problemId: 'x', text: 'private note about my home network', sourceRefs: [], savedAt: '' }
    const kept = notIncluded(body, { query: 'My Mac cannot see my frame', otherDrafts: [other] })
    expect(kept.map((k) => k.label)).toEqual(['Your search words', 'Your other draft in this browser', 'Browser history, chat and the record pages you opened'])
    expect(JSON.stringify(body)).not.toContain('Mac cannot')
    expect(JSON.stringify(body)).not.toContain('home network')
  })

  it('does not claim search words stay private when the participant typed them into the draft', () => {
    const body = outgoingCommand(prepared({ text: 'My Mac cannot see my frame either; a data cable fixed it' }), 'd')!
    expect(notIncluded(body, { query: 'My Mac cannot see my frame', otherDrafts: [] }).map((k) => k.label)).not.toContain('Your search words')
  })

  it('finds a contribution again by its first words, without a leading tag', () => {
    expect(rediscoveryWords('[Demo, staged] Phase 0 screenshot data with more words after')).toBe('Phase 0 screenshot data with more')
  })
})

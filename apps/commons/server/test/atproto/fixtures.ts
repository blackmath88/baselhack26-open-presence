import type { CommonsContribution } from '../../../src/commons/contracts.js'
import type { RecordBuildInput } from '../../commons/atproto/contract.js'

export const contribution = (overrides: Partial<CommonsContribution> = {}): CommonsContribution => ({
  id: 'contrib_000042',
  revision: 1,
  problemId: 'usb-c-no-data',
  roomId: 'commons:usb-c-no-data',
  entrance: 'http',
  kind: 'observation',
  text: 'Same on my M2 Mac: the frame charges but never mounts. Zebra-quartz-7719 phrase for search.',
  circumstances: 'macOS 15, USB-C cable',
  sourceRefs: [{
    snapshotId: 'commons-001@0bff55ef3fb2', objectId: 'issue/62', permalink: 'https://github.com/wesbos/photo-frame-dashboard/issues/62',
    author: 'someone', sourceTime: '2026-10-01T00:00:00Z', retrievedAt: '2026-10-29T16:19:22.411Z', digest: 'abc123', locator: null, availability: 'unavailable',
  }],
  actor: { id: 'person:kai', displayName: 'Kai', kind: 'participant' },
  submittedBy: 'person:kai',
  assistance: { declared: 'none' },
  createdAt: '2026-10-31T15:00:00.000Z',
  origin: { kind: 'local' },
  publication: null,
  links: { app: '#/problems/usb-c-no-data' },
  ...overrides,
})

export const buildInput = (overrides: Partial<RecordBuildInput> = {}): RecordBuildInput => ({
  contribution: contribution(),
  problemUrl: 'http://localhost:5173/#/problems/usb-c-no-data',
  source: { repository: 'wesbos/photo-frame-dashboard', revision: '0bff55ef3fb2a3bfdab05bc8e3bd0c9d69f63189', snapshotId: 'commons-001@0bff55ef3fb2' },
  resolved: {},
  ...overrides,
})

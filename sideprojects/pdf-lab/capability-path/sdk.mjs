import { createRequire } from 'node:module'
// Reuse the installed, pinned Commons SDK; do not install or change Commons dependencies.
export const sdkRequire = createRequire(new URL('../../../apps/commons/package.json', import.meta.url))

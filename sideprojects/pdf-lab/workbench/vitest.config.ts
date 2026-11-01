import { defineConfig } from 'vitest/config'

// Adapter and domain tests are pure; they do not need the Start or React plugins.
export default defineConfig({ test: { environment: 'node', include: ['test/**/*.test.ts'] } })

import { defineConfig } from 'vitest/config';
// The coordinator owns the root config, which currently includes server tests only.
export default defineConfig({ test: { environment: 'node', include: ['test/corpus/**/*.test.ts'] } });

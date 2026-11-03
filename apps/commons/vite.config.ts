import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'

// Based on TanStack/router examples/react/start-basic. The existing API owns data/auth.
export default defineConfig({
  plugins: [tanstackStart({ spa: { enabled: true, prerender: { outputPath: '/index.html' } } }), react()],
  server: {
    proxy: {
      '/api': { target: process.env.BRAINSTORM_API ?? 'http://localhost:8787', changeOrigin: true },
      '/mcp': { target: process.env.BRAINSTORM_API ?? 'http://localhost:8787', changeOrigin: true },
    },
  },
})

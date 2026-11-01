import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: { port: 3100, host: '127.0.0.1', strictPort: true },
  plugins: [
    tanstackStart(),
    // React's plugin must come after Start's.
    viteReact(),
  ],
})

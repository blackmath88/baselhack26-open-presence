import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend-independent preview of the production E component, published on Pages.
export default defineConfig({
  root: 'e-preview',
  base: './',
  plugins: [react()],
  build: { outDir: '../dist-e', emptyOutDir: true },
})

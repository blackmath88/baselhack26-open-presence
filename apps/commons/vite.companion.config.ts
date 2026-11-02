import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: { minify: 'esbuild', outDir: 'dist-companion', emptyOutDir: true, lib: { entry: 'src/companion/embed.tsx', name: 'PhfE', formats: ['iife'], fileName: () => 'companion.js', cssFileName: 'companion' } },
})

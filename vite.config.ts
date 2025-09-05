/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use explicit base for GitHub Pages deployment
  base: '/cellular-automaton/',
  plugins: [react()],
  // Output built files to `docs` so GitHub Pages can serve them
  build: {
    outDir: 'docs',
  },
  test: {
    environment: 'node',
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)

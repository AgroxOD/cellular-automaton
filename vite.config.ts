/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use a relative base so that built assets can be served from any path
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)

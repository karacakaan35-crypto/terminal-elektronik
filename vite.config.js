import { copyFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function sitesBundle(mode) {
  return {
    name: 'terminal-elektronik-sites-bundle',
    apply: 'build',
    async buildStart() {
      if (mode === 'sites') {
        await rm(resolve('dist'), { recursive: true, force: true })
      }
    },
    async closeBundle() {
      if (mode !== 'sites') {
        return
      }

      const serverDirectory = resolve('dist/server')
      await mkdir(serverDirectory, { recursive: true })
      await copyFile(new URL('./worker/sites-worker.js', import.meta.url), resolve(serverDirectory, 'index.js'))
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), sitesBundle(mode)],
  build: {
    outDir: mode === 'sites' ? 'dist/client' : 'dist',
    emptyOutDir: true,
  },
}))

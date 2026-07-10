import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function sitesBundle(mode) {
  return {
    name: 'terminal-elektronik-sites-bundle',
    apply: 'build',
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
  define: {
    'import.meta.env.VITE_PUBLIC_HOSTED': JSON.stringify(mode === 'sites' ? 'true' : 'false'),
  },
}))

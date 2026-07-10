import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker/sites-worker.js'

function createAssets() {
  return {
    async fetch(request) {
      const path = new URL(request.url).pathname

      if (path === '/index.html') {
        return new Response('<!doctype html><title>Terminal Elektronik</title>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      return new Response('Not found', { status: 404 })
    },
  }
}

test('hosted assistant status disables the unavailable local model', async () => {
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant/status'),
    { ASSETS: createAssets() },
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    provider: 'browser',
    connected: false,
    configuredModel: 'gemma4',
    modelAvailable: false,
    models: [],
  })
})

test('hosted worker falls back to the SPA shell for navigation', async () => {
  const response = await worker.fetch(
    new Request('https://terminal.example/diagnostics', {
      headers: { accept: 'text/html' },
    }),
    { ASSETS: createAssets() },
  )

  assert.equal(response.status, 200)
  assert.match(await response.text(), /Terminal Elektronik/)
})

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
    configuredModel: 'gemma4:e2b-it-qat',
    modelAvailable: false,
    models: [],
  })
})

test('hosted assistant status proxies the configured Gemma bridge without exposing its token', async () => {
  let authorization = ''
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant/status', {
      headers: { 'CF-Connecting-IP': '198.51.100.7' },
    }),
    {
      ASSETS: createAssets(),
      ASTRA_BRIDGE_URL: 'https://astra.example',
      ASTRA_BRIDGE_TOKEN: 'server-secret',
      ASTRA_BRIDGE_FETCH: async (_url, options) => {
        authorization = options.headers.Authorization
        return new Response(JSON.stringify({
          provider: 'ollama-bridge',
          connected: true,
          configuredModel: 'gemma4',
          modelAvailable: true,
          models: ['gemma4:latest'],
        }), { headers: { 'Content-Type': 'application/json' } })
      },
    },
  )

  assert.equal(response.status, 200)
  assert.equal(authorization, 'Bearer server-secret')
  assert.equal((await response.json()).modelAvailable, true)
})

test('hosted assistant streams the bridge response and model header', async () => {
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Türk kahvesi nasıl yapılır?' }),
    }),
    {
      ASSETS: createAssets(),
      ASTRA_BRIDGE_URL: 'https://astra.example',
      ASTRA_BRIDGE_TOKEN: 'server-secret',
      ASTRA_BRIDGE_FETCH: async () => new Response('Bir fincan su ve kahveyi cezvede karıştır.', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Assistant-Model': 'gemma4',
        },
      }),
    },
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('X-Assistant-Model'), 'gemma4')
  assert.match(await response.text(), /cezvede/)
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

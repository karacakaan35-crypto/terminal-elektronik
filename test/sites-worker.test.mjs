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

test('hosted assistant status disables Gemini when the API key is missing', async () => {
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant/status'),
    { ASSETS: createAssets() },
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    provider: 'gemini',
    connected: false,
    configuredModel: 'gemini-3.1-flash-lite',
    modelAvailable: false,
    models: [],
  })
})
test('hosted assistant status checks Gemini without exposing its API key', async () => {
  let apiKey = ''
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant/status', {
      headers: { 'CF-Connecting-IP': '198.51.100.7' },
    }),
    {
      ASSETS: createAssets(),
      GEMINI_API_KEY: 'server-secret',
      GEMINI_FETCH: async (_url, options) => {
        apiKey = options.headers['x-goog-api-key']
        return new Response(JSON.stringify({ name: 'models/gemini-3.1-flash-lite' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  )

  assert.equal(response.status, 200)
  assert.equal(apiKey, 'server-secret')
  assert.equal((await response.json()).modelAvailable, true)
})

test('hosted assistant returns the Gemini response and model header', async () => {
  let requestBody
  let apiKey = ''
  const response = await worker.fetch(
    new Request('https://terminal.example/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Türk kahvesi nasıl yapılır?' }),
    }),
    {
      ASSETS: createAssets(),
      GEMINI_API_KEY: 'server-secret',
      GEMINI_FETCH: async (_url, options) => {
        apiKey = options.headers['x-goog-api-key']
        requestBody = JSON.parse(options.body)
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Bir fincan su ve kahveyi cezvede karıştır.' }] } }],
        }), { headers: { 'Content-Type': 'application/json' } })
      },
    },
  )

  assert.equal(response.status, 200)
  assert.equal(apiKey, 'server-secret')
  assert.equal(requestBody.contents[0].role, 'user')
  assert.equal(response.headers.get('X-Assistant-Model'), 'gemini-3.1-flash-lite')
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

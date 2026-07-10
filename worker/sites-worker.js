const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/assistant/status') {
      return new Response(JSON.stringify({
        provider: 'browser',
        connected: false,
        configuredModel: 'gemma4',
        modelAvailable: false,
        models: [],
      }), { headers: jsonHeaders })
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: 'Yerel Gemma4 yalnızca Terminal Elektronik servis bilgisayarında kullanılabilir.',
      }), { status: 503, headers: jsonHeaders })
    }

    const response = await env.ASSETS.fetch(request)
    const acceptsHtml = request.headers.get('accept')?.includes('text/html')

    if (response.status === 404 && request.method === 'GET' && acceptsHtml) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request))
    }

    return response
  },
}

export default worker

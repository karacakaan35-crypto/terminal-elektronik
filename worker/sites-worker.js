const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const maxAssistantBodyBytes = 64 * 1024

function unavailableStatus() {
  return {
    provider: 'browser',
    connected: false,
    configuredModel: 'gemma4:e2b-it-qat',
    modelAvailable: false,
    models: [],
  }
}

async function proxyAssistant(request, env, path) {
  if (!env.ASTRA_BRIDGE_URL || !env.ASTRA_BRIDGE_TOKEN) {
    if (path.endsWith('/status')) {
      return new Response(JSON.stringify(unavailableStatus()), { headers: jsonHeaders })
    }

    return new Response(JSON.stringify({ error: 'Gemma 4 köprüsü yapılandırılmamış.' }), { status: 503, headers: jsonHeaders })
  }

  const bridgeFetch = env.ASTRA_BRIDGE_FETCH || fetch
  const headers = {
    Authorization: `Bearer ${env.ASTRA_BRIDGE_TOKEN}`,
    'X-Client-IP': request.headers.get('CF-Connecting-IP') || 'unknown',
  }
  const options = {
    method: request.method,
    headers,
    redirect: 'manual',
  }

  if (request.method === 'POST') {
    const body = await request.arrayBuffer()
    if (body.byteLength > maxAssistantBodyBytes) {
      return new Response(JSON.stringify({ error: 'İstek çok büyük.' }), { status: 413, headers: jsonHeaders })
    }
    headers['Content-Type'] = 'application/json'
    options.body = body
  }

  try {
    const target = new URL(path, `${env.ASTRA_BRIDGE_URL.replace(/\/$/, '')}/`)
    const upstream = await bridgeFetch(target, options)
    const responseHeaders = {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }
    const model = upstream.headers.get('X-Assistant-Model')
    if (model) {
      responseHeaders['X-Assistant-Model'] = model
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch {
    if (path.endsWith('/status')) {
      return new Response(JSON.stringify(unavailableStatus()), { headers: jsonHeaders })
    }

    return new Response(JSON.stringify({ error: 'Gemma 4 köprüsüne ulaşılamıyor.' }), { status: 503, headers: jsonHeaders })
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/assistant/status') {
      return proxyAssistant(request, env, '/api/assistant/status')
    }

    if (url.pathname === '/api/assistant' && request.method === 'POST') {
      return proxyAssistant(request, env, '/api/assistant')
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

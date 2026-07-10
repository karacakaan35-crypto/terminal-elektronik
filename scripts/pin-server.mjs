import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = resolve(rootDir, 'dist')
const port = Number(process.env.PORT || 4174)
const host = process.env.HOST || '127.0.0.1'
const pin = process.env.FIXBOARD_PIN || '1559'
const secret = process.env.FIXBOARD_SECRET || randomBytes(32).toString('hex')
const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const ollamaModel = process.env.FIXBOARD_AI_MODEL || 'gemma4'
const cookieName = 'fixboard_session'
const maxAgeSeconds = 60 * 60 * 8

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
}

function sign(value) {
  return createHmac('sha256', secret).update(value).digest('hex')
}

function makeToken() {
  const payload = `${Date.now()}.${randomBytes(16).toString('hex')}`
  return `${payload}.${sign(payload)}`
}

function isValidToken(token = '') {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  const payload = `${parts[0]}.${parts[1]}`
  const expected = sign(payload)
  const ageMs = Date.now() - Number(parts[0])

  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeSeconds * 1000) {
    return false
  }

  if (Buffer.byteLength(parts[2]) !== Buffer.byteLength(expected)) {
    return false
  }

  return timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie || ''
  const cookies = cookieHeader.split(';').map((item) => item.trim())
  const match = cookies.find((item) => item.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...headers,
  })
  response.end(body)
}

function loginPage(error = '') {
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terminal Elektronik - PIN</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          linear-gradient(135deg, rgba(244, 63, 94, .18), transparent 34%),
          linear-gradient(225deg, rgba(20, 184, 166, .16), transparent 34%),
          #0a0d14;
        color: #f4f4f5;
      }
      main {
        width: min(430px, 100%);
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 12px;
        padding: 28px;
        background: rgba(14, 17, 27, .86);
        box-shadow: 0 24px 80px rgba(0,0,0,.44);
      }
      .kicker { color: #67e8f9; font: 700 12px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; }
      h1 { margin: 12px 0 8px; font-size: 30px; line-height: 1.05; }
      p { margin: 0 0 22px; color: #a1a1aa; line-height: 1.6; }
      label { display: block; margin-bottom: 10px; color: #d4d4d8; font-weight: 800; }
      input {
        width: 100%;
        min-height: 58px;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 8px;
        padding: 0 16px;
        background: rgba(0,0,0,.24);
        color: #fff;
        font: 900 28px ui-monospace, SFMono-Regular, Menlo, monospace;
        outline: none;
        letter-spacing: .18em;
        text-align: center;
      }
      input:focus { border-color: rgba(251, 191, 36, .85); box-shadow: 0 0 0 4px rgba(251, 191, 36, .13); }
      button {
        width: 100%;
        min-height: 52px;
        margin-top: 14px;
        border: 1px solid rgba(251, 191, 36, .52);
        border-radius: 8px;
        background: linear-gradient(90deg, rgba(244, 63, 94, .32), rgba(245, 158, 11, .26), rgba(20, 184, 166, .24));
        color: white;
        font-weight: 900;
        cursor: pointer;
      }
      .error { margin-top: 14px; color: #fecaca; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <div class="kicker">TERMINAL ELEKTRONIK SECURE ACCESS</div>
      <h1>Servis Konsolu</h1>
      <p>Terminal Elektronik'e erişmek için PIN girin.</p>
      <form method="post" action="/auth">
        <label for="pin">PIN</label>
        <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="12" autofocus />
        <button type="submit">Giriş Yap</button>
      </form>
      ${error ? `<div class="error">${error}</div>` : ''}
    </main>
  </body>
</html>`
}

function safeStaticPath(requestUrl) {
  const parsedUrl = new URL(requestUrl, 'http://localhost')
  const decodedPath = decodeURIComponent(parsedUrl.pathname)
  const cleanPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  const requestedPath = cleanPath === '/' ? '/index.html' : cleanPath
  const fullPath = resolve(join(distDir, requestedPath))

  if (!fullPath.startsWith(`${distDir}/`) && fullPath !== distDir) {
    return null
  }

  if (existsSync(fullPath) && statSync(fullPath).isFile()) {
    return fullPath
  }

  return resolve(distDir, 'index.html')
}

async function readRequestBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function sendJson(response, status, body) {
  send(response, status, JSON.stringify(body), { 'Content-Type': 'application/json; charset=utf-8' })
}

function modelNameMatches(actualName, configuredName) {
  return actualName === configuredName || actualName === `${configuredName}:latest`
}

function buildAssistantMessages({ message, context }) {
  const profile = context?.selectedProfile?.name || 'Cihaz seçilmedi'
  const currentNode = context?.currentNode?.title || 'Başlangıç'
  const candidates = (context?.candidates || [])
    .slice(0, 5)
    .map((candidate) => `- ${candidate.label}: %${candidate.probability} (${candidate.componentGroup || 'grup yok'})`)
    .join('\n')
  const history = (context?.history || [])
    .slice(-8)
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.answer}${entry.interpretation ? ` - ${entry.interpretation}` : ''}`)
    .join('\n')

  const system = `Sen Terminal Elektronik içindeki Astra adlı yardımcı asistansın.
Dil: Türkçe.
Rol: Önceliğin elektronik kart, CACS, PBX, UPS, yangın paneli, CCTV, bariyer ve otomatik kapı arızalarında deneyimli bir teknisyen gibi yardımcı olmaktır.
Gündelik sorular: Kullanıcı yemek, kahve, plan, moral, matematik veya genel hayat sorusu sorarsa teknik bağlamı zorla dahil etme; normal, doğal ve pratik cevap ver.
Sohbet tonu: İnsanmış gibi sahte kişisel hayat uydurma. "Benim için her şey harika" gibi yapay cümleler kurma. Emoji kullanma. Kısa, sakin, hafif samimi ve doğal konuş.
Örnek sohbet: Kullanıcı "Hayat nasıl gidiyor?" veya "Nasılsın?" derse "Buradayım, sakin sakin devam. Senin tarafta işler nasıl?" gibi kısa ve doğal cevap ver.
Teknik sorular: En olası nedeni, ölçüm/deney sırasını ve beklenen değeri yaz. Gerekirse yüksek voltaj, yangın paneli, kilit ve hareketli mekanizmalar için enerjiyi kesme/izolasyon uyarısı ver.
Tarz: Kısa, net, arkadaş canlısı, sahada uygulanabilir.
Sınır: Emin olmadığında kesin konuşma; nasıl doğrulanacağını söyle.
Yanıt uzunluğu: En fazla 90 kelime. Gereksiz giriş cümlesi yazmadan doğrudan cevap ver.
Yanıtı genelde 3-5 kısa madde veya kısa paragraf halinde ver.`

  const user = `Aktif cihaz: ${profile}
Aktif adım: ${currentNode}
Canlı arıza adayları:
${candidates || '- Henüz aday yok'}

Son işlem geçmişi:
${history || '- Henüz kayıt yok'}

Kullanıcı sorusu:
${message}

Not: Soru teknik değilse aktif cihaz/adım/arıza adaylarını yok say ve günlük yardımcı gibi cevapla.`

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

async function streamOllamaReply({ message, context, onToken, signal }) {
  const messages = buildAssistantMessages({ message, context })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)
  const abortFromClient = () => controller.abort()
  signal?.addEventListener('abort', abortFromClient, { once: true })

  try {
    const result = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        stream: true,
        think: false,
        options: {
          temperature: 0.25,
          top_p: 0.85,
          num_ctx: 2048,
          num_predict: 180,
        },
      }),
      signal: controller.signal,
    })

    if (!result.ok) {
      throw new Error(`Ollama HTTP ${result.status}`)
    }

    if (!result.body) {
      throw new Error('Ollama stream body is unavailable')
    }

    const reader = result.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let reply = ''

    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) {
          continue
        }

        const data = JSON.parse(line)
        const token = String(data.message?.content || data.response || '')
        if (token) {
          reply += token
          onToken(token)
        }
      }

      if (done) {
        break
      }
    }

    if (buffer.trim()) {
      const data = JSON.parse(buffer)
      const token = String(data.message?.content || data.response || '')
      if (token) {
        reply += token
        onToken(token)
      }
    }

    return reply.trim()
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromClient)
  }
}

if (!existsSync(resolve(distDir, 'index.html'))) {
  console.error('dist/index.html bulunamadı. Önce npm run build çalıştırın.')
  process.exit(1)
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === '/health') {
      send(response, 200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' })
      return
    }

    if (request.method === 'POST' && request.url === '/auth') {
      const body = await readRequestBody(request)
      const form = new URLSearchParams(body)

      if (form.get('pin') === pin) {
        const token = makeToken()
        response.writeHead(302, {
          Location: '/',
          'Set-Cookie': `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`,
          'Cache-Control': 'no-store',
        })
        response.end()
        return
      }

      send(response, 401, loginPage('PIN hatalı.'), { 'Content-Type': 'text/html; charset=utf-8' })
      return
    }

    if (request.url === '/logout') {
      response.writeHead(302, {
        Location: '/',
        'Set-Cookie': `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
        'Cache-Control': 'no-store',
      })
      response.end()
      return
    }

    if (!isValidToken(getCookie(request, cookieName))) {
      send(response, 401, loginPage(), { 'Content-Type': 'text/html; charset=utf-8' })
      return
    }

    if (request.method === 'GET' && request.url === '/api/assistant/status') {
      try {
        const result = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
        const data = result.ok ? await result.json() : { models: [] }
        const models = (data.models || []).map((model) => model.name)
        sendJson(response, 200, {
          provider: 'ollama',
          connected: result.ok,
          configuredModel: ollamaModel,
          modelAvailable: models.some((model) => modelNameMatches(model, ollamaModel)),
          models,
        })
      } catch {
        sendJson(response, 200, {
          provider: 'ollama',
          connected: false,
          configuredModel: ollamaModel,
          modelAvailable: false,
          models: [],
        })
      }
      return
    }

    if (request.method === 'POST' && request.url === '/api/assistant') {
      const clientController = new AbortController()
      response.once('close', () => {
        if (!response.writableEnded) {
          clientController.abort()
        }
      })

      try {
        const body = JSON.parse(await readRequestBody(request))
        const message = String(body.message || '').trim()

        if (!message) {
          sendJson(response, 400, { error: 'Mesaj boş olamaz.' })
          return
        }

        let headersSent = false
        const sendStreamHeaders = () => {
          if (headersSent) {
            return
          }

          response.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Assistant-Model': ollamaModel,
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'no-referrer',
          })
          headersSent = true
        }

        const reply = await streamOllamaReply({
          message,
          context: body.context || {},
          onToken(token) {
            sendStreamHeaders()
            response.write(token)
          },
          signal: clientController.signal,
        })

        sendStreamHeaders()
        if (!reply) {
          response.write('Yerel model boş yanıt verdi.')
        }
        response.end()
      } catch (error) {
        if (response.headersSent) {
          if (error?.name === 'AbortError') {
            response.write('\n\n[Derin yanıt süre sınırında durduruldu.]')
          }
          response.end()
        } else {
          sendJson(response, 503, {
            error: 'Yerel model şu anda yanıt vermiyor.',
            detail: error?.message || 'unknown',
          })
        }
      }
      return
    }

    const filePath = safeStaticPath(request.url)
    if (!filePath) {
      send(response, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' })
      return
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': filePath.endsWith('index.html') || filePath.endsWith('sw.js') ? 'no-store' : 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    })
    createReadStream(filePath).pipe(response)
  } catch (error) {
    console.error(error)
    send(response, 500, 'Internal Server Error', { 'Content-Type': 'text/plain; charset=utf-8' })
  }
})

server.listen(port, host, () => {
  console.log(`Terminal Elektronik PIN server: http://${host}:${port}`)
  console.log(`PIN: ${pin}`)
})

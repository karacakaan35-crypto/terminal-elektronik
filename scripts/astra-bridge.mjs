import { timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 4175)
const bridgeToken = process.env.ASTRA_BRIDGE_TOKEN || ''
const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const ollamaModel = process.env.FIXBOARD_AI_MODEL || 'gemma4:e2b-it-qat'
const maxBodyBytes = 64 * 1024
const maxConcurrentRequests = 2
const rateWindowMs = 10 * 60 * 1000
const rateLimit = 30
const requestBuckets = new Map()
let activeRequests = 0

if (bridgeToken.length < 32) {
  console.error('ASTRA_BRIDGE_TOKEN en az 32 karakter olmalıdır.')
  process.exit(1)
}

function secureHeaders(extra = {}) {
  return {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...extra,
  }
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, secureHeaders(headers))
  response.end(body)
}

function sendJson(response, status, body) {
  send(response, status, JSON.stringify(body), { 'Content-Type': 'application/json; charset=utf-8' })
}

function authorized(request) {
  const expected = `Bearer ${bridgeToken}`
  const actual = request.headers.authorization || ''

  if (Buffer.byteLength(actual) !== Buffer.byteLength(expected)) {
    return false
  }

  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}

function clientWithinRateLimit(request) {
  const now = Date.now()
  const clientId = String(request.headers['x-client-ip'] || request.socket.remoteAddress || 'unknown')
  const recent = (requestBuckets.get(clientId) || []).filter((time) => now - time < rateWindowMs)

  if (recent.length >= rateLimit) {
    requestBuckets.set(clientId, recent)
    return false
  }

  recent.push(now)
  requestBuckets.set(clientId, recent)
  return true
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBodyBytes) {
      throw new Error('PAYLOAD_TOO_LARGE')
    }
    chunks.push(chunk)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function modelNameMatches(actualName, configuredName) {
  return actualName === configuredName || actualName === `${configuredName}:latest`
}

function buildRelevantReference(message, node = {}) {
  const normalized = message.toLocaleLowerCase('tr-TR')
  const references = []

  if (/adaptör|smps|besleme|voltaj|reset/.test(normalized)) {
    const range = node.expected ? `${node.expected.min} - ${node.expected.max} ${node.unit || ''}`.trim() : 'üretici toleransı'
    references.push(`Boşta normal DC voltaj beslemenin yükte sağlam olduğunu kanıtlamaz. Gerçek yükte adaptör çıkışı ve cihaz girişini MIN/MAX ile karşılaştır; %5 üzeri düşüm, reset anındaki dip ve ripple/transient kaydı önemlidir. Bu adımın beklenen aralığı ${range}. Adaptör çıkışı yükte bu aralığın altına düşerse adaptör/akım limiti şüphelidir. Adaptör çıkışı normal kalıp yalnız cihaz girişinde düşerse kablo, jak veya klemens direnci şüphelidir. İki nokta da normal kalırken reset sürerse osiloskopla ripple/kısa transient, kalkış akımı ve cihaz içi regülatör-kısa devre araştırılır. Aynı nominal ve yeterli akım kapasiteli sağlam kaynakla A/B testi besleme ile yükü ayırır.`)
  }

  if (/türk kahves|turk kahves/.test(normalized)) {
    references.push('Türk kahvesi temel oranı: fincan başına yaklaşık 60-70 ml soğuk su ve 1 tepeleme çay kaşığı (yaklaşık 6-7 g) kahve. Su, kahve ve istenen şeker cezvede ısıtmadan önce karıştırılır; kısık ateşte köpük yükselince kaynatmadan alınır.')
  }

  return references.join('\n')
}

function buildAssistantMessages({ message, context }) {
  const profile = context?.selectedProfile?.name || 'Cihaz seçilmedi'
  const node = context?.currentNode || {}
  const currentNode = node.title || 'Başlangıç'
  const candidates = (context?.candidates || [])
    .slice(0, 6)
    .map((candidate) => `- ${candidate.label}: %${candidate.probability} (${candidate.componentGroup || 'grup yok'})`)
    .join('\n')
  const history = (context?.history || [])
    .slice(-8)
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.answer}${entry.interpretation ? ` - ${entry.interpretation}` : ''}`)
    .join('\n')
  const expected = node.expected ? `${node.expected.min} - ${node.expected.max} ${node.unit || ''}`.trim() : '- Belirtilmemiş'
  const procedure = (node.testSteps || []).map((step, index) => `${index + 1}. ${step}`).join('\n')
  const relevantReference = buildRelevantReference(message, node)
  const adapterQuestion = /adaptör|smps|besleme/.test(message.toLocaleLowerCase('tr-TR'))

  const system = `Sen Terminal Elektronik uygulamasındaki Astra adlı asistansın.
Türkçe, doğal, sakin ve doğrudan konuş. Emoji kullanma ve kişisel hayatın varmış gibi davranma.
Teknik sorularda deneyimli elektronik servis teknisyeni gibi ilerle: önce güvenlik, sonra en olası nedenler, ölçüm sırası, beklenen değer ve A/B izolasyonu.
UPS, CACS, PBX, yangın paneli, CCTV, bariyer, otomatik kapı ve kart seviyesi teşhiste model etiketi ile üretici kılavuzunu genel eşiklerden üstün tut.
Emin olmadığın değeri uydurma; nasıl doğrulanacağını söyle. Şebeke, yangın sistemi ve hareketli mekanizmada gerekli izolasyon uyarısını ekle.
Gündelik soru teknik değilse aktif cihaz bağlamını tamamen yok say. Kahve, yemek, matematik, planlama ve sohbet sorularını normal bir yardımcı gibi cevapla; tariflerde temel miktarı ve atlanmaması gereken adımı kontrol et.
Sağlanan ölçüm referansını ve test prosedürünü öncelikle kullan, fakat bunları "iç referans" diye adlandırma. DC besleme değerine sinyal deme.
Beklenen aralık sayısal olarak verilmişse yanıtında aynen belirt ve düşük/normal durumda bir sonraki ayrımı açıkla. İlgili kısa referanstaki sayısal eşikleri atlama.
Güvenlik uyarısını yalnız sorudaki işlem gerçekten şebeke, yangın sistemi, yüksek enerji veya hareketli mekanizma içeriyorsa ver. Talimatları "uyarı eklemeyi unutmayın" gibi kullanıcıya geri söyleme.
Yanıtı çoğunlukla kısa paragraf veya 3-6 maddede, en fazla 140 kelimeyle ver. Gereksiz giriş yazma.`

  const user = `Aktif cihaz: ${profile}
Aktif adım: ${currentNode}
Ölçüm cihazı: ${node.meterMode || '-'}
Enerji durumu: ${node.powerState || '-'}
Beklenen aralık: ${expected}
Siyah prob: ${node.probeBlack || '-'}
Kırmızı prob: ${node.probeRed || '-'}
Test prosedürü:
${procedure || '- Belirtilmemiş'}
Testi durdurma koşulları: ${(node.stopConditions || []).join('; ') || '- Belirtilmemiş'}

Canlı arıza adayları:
${candidates || '- Henüz aday yok'}

Son işlem geçmişi:
${history || '- Henüz kayıt yok'}

Kullanıcı sorusu:
${message}

İlgili kısa referans:
${relevantReference || '- Ek referans yok'}

Soru teknik değilse yukarıdaki cihaz bağlamını kullanma.

Yanıt kontrolü:
${node.expected ? `- Yanıtta şu beklenen aralığı aynen yaz: ${expected}.` : '- Uydurma bir sayısal aralık ekleme.'}
${adapterQuestion ? '- Boşta normal voltajın yük altında sağlamlık kanıtı olmadığını açıkça söyle.' : ''}
- "Referans şunu önermektedir" deme; bilgiyi doğrudan, kendi teknik önerin olarak anlat.
- Ölçüm sonucu normal kalırsa hangi alt sistemi; düşük kalırsa hangi alt sistemi kontrol edeceğini söyle.`

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

async function streamOllamaReply({ message, context, onToken, signal }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)
  const abortFromClient = () => controller.abort()
  signal?.addEventListener('abort', abortFromClient, { once: true })

  try {
    const result = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: buildAssistantMessages({ message, context }),
        stream: true,
        think: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_ctx: 4096,
          num_predict: 320,
        },
      }),
      signal: controller.signal,
    })

    if (!result.ok || !result.body) {
      throw new Error(`Ollama HTTP ${result.status}`)
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

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://localhost')

  if (request.method === 'GET' && url.pathname === '/health') {
    send(response, 200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' })
    return
  }

  if (!authorized(request)) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/assistant/status') {
    try {
      const result = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
      const data = result.ok ? await result.json() : { models: [] }
      const models = (data.models || []).map((model) => model.name)
      sendJson(response, 200, {
        provider: 'ollama-bridge',
        connected: result.ok,
        configuredModel: ollamaModel,
        modelAvailable: models.some((model) => modelNameMatches(model, ollamaModel)),
        models,
      })
    } catch {
      sendJson(response, 200, {
        provider: 'ollama-bridge',
        connected: false,
        configuredModel: ollamaModel,
        modelAvailable: false,
        models: [],
      })
    }
    return
  }

  if (request.method !== 'POST' || url.pathname !== '/api/assistant') {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  if (!clientWithinRateLimit(request)) {
    sendJson(response, 429, { error: 'İstek sınırı aşıldı. Birkaç dakika sonra tekrar deneyin.' })
    return
  }

  if (activeRequests >= maxConcurrentRequests) {
    sendJson(response, 429, { error: 'Astra şu anda başka bir yanıt hazırlıyor.' })
    return
  }

  const clientController = new AbortController()
  response.once('close', () => {
    if (!response.writableEnded) {
      clientController.abort()
    }
  })

  activeRequests += 1
  try {
    const body = await readJsonBody(request)
    const message = String(body.message || '').trim().slice(0, 2000)
    if (!message) {
      sendJson(response, 400, { error: 'Mesaj boş olamaz.' })
      return
    }

    let headersSent = false
    const sendStreamHeaders = () => {
      if (!headersSent) {
        response.writeHead(200, secureHeaders({
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Assistant-Model': ollamaModel,
        }))
        headersSent = true
      }
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
      response.write('Gemma 4 boş yanıt verdi.')
    }
    response.end()
  } catch (error) {
    if (response.headersSent) {
      response.end(error?.name === 'AbortError' ? '\n\n[Yanıt süre sınırında durduruldu.]' : '')
    } else if (error?.message === 'PAYLOAD_TOO_LARGE') {
      sendJson(response, 413, { error: 'İstek çok büyük.' })
    } else if (error instanceof SyntaxError) {
      sendJson(response, 400, { error: 'Geçersiz JSON.' })
    } else {
      sendJson(response, 503, { error: 'Gemma 4 şu anda yanıt vermiyor.' })
    }
  } finally {
    activeRequests -= 1
  }
})

server.listen(port, host, () => {
  console.log(`Astra bridge ready: http://${host}:${port}`)
  console.log(`Model: ${ollamaModel}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

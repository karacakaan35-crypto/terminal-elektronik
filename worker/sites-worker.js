const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const maxAssistantBodyBytes = 64 * 1024
const defaultGeminiModel = 'gemini-3.1-flash-lite'
const geminiApiBase = 'https://generativelanguage.googleapis.com/v1beta/models'

function getGeminiModel(env) {
  return env.GEMINI_MODEL || defaultGeminiModel
}

function unavailableStatus(model = defaultGeminiModel) {
  return { provider: 'gemini', connected: false, configuredModel: model, modelAvailable: false, models: [] }
}

function responseHeaders(extra = {}) {
  return { ...jsonHeaders, 'X-Content-Type-Options': 'nosniff', ...extra }
}

function textFromParts(parts = []) {
  return parts.map((part) => String(part?.text || '')).join('').trim()
}

function buildAssistantPrompt(message, context = {}) {
  const selectedProfile = context.selectedProfile?.name || 'Cihaz seçilmedi'
  const currentNode = context.currentNode || {}
  const candidates = (context.candidates || [])
    .slice(0, 6)
    .map((candidate) => `- ${candidate.label}: %${candidate.probability} (${candidate.componentGroup || 'grup yok'})`)
    .join('\n') || '- Henüz aday yok'
  const history = (context.history || [])
    .slice(-8)
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.answer}${entry.interpretation ? ` - ${entry.interpretation}` : ''}`)
    .join('\n') || '- Henüz kayıt yok'
  const expected = currentNode.expected
    ? `${currentNode.expected.min} - ${currentNode.expected.max} ${currentNode.unit || ''}`.trim()
    : '- Belirtilmemiş'
  const procedure = (currentNode.testSteps || []).map((step, index) => `${index + 1}. ${step}`).join('\n') || '- Belirtilmemiş'

  const system = `Sen Terminal Elektronik uygulamasındaki Astra adlı asistansın.
Türkçe, doğal, sakin ve doğrudan konuş. Emoji kullanma ve kişisel hayatın varmış gibi davranma.
Teknik sorularda deneyimli elektronik servis teknisyeni gibi ilerle: önce güvenlik, sonra en olası nedenler, ölçüm sırası, beklenen değer ve A/B izolasyonu.

Aktif cihaz: ${selectedProfile}
Aktif teşhis adımı: ${currentNode.title || 'Başlangıç'}
Beklenen aralık: ${expected}
Önerilen test adımları:
${procedure}

Olası arızalar:
${candidates}

Son işlem geçmişi:
${history}

Yanıt kuralları:
- Soru teknik değilse cihaz bağlamını kullanma.
- Beklenen aralık belirtilmişse yanıtta şu değeri aynen yaz: ${expected}.
- Uydurma sayısal aralık ekleme.
- Boşta normal voltajın yük altında sağlamlık kanıtı olmadığını gerektiğinde açıkça söyle.
- Önce güvenlik, sonra ölçüm ve izolasyon adımlarını ver.
- Yanıtı kısa, uygulanabilir ve Türkçe yaz.`

  const user = `Kullanıcı sorusu:\n${message}\n\nAktif bağlam:\nCihaz: ${selectedProfile}\nAdım: ${currentNode.title || 'Başlangıç'}`
  return { system, user }
}

async function checkGeminiStatus(env, model) {
  if (!env.GEMINI_API_KEY) return unavailableStatus(model)
  const geminiFetch = env.GEMINI_FETCH || fetch

  try {
    const response = await geminiFetch(`${geminiApiBase}/${encodeURIComponent(model)}`, {
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY },
    })
    if (!response.ok) return unavailableStatus(model)
    return { provider: 'gemini', connected: true, configuredModel: model, modelAvailable: true, models: [model] }
  } catch {
    return unavailableStatus(model)
  }
}

async function generateGeminiReply(request, env, model) {
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Gemini API anahtarı yapılandırılmamış.' }), { status: 503, headers: responseHeaders() })
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > maxAssistantBodyBytes) {
    return new Response(JSON.stringify({ error: 'İstek çok büyük.' }), { status: 413, headers: responseHeaders() })
  }

  let payload
  try {
    payload = JSON.parse(new TextDecoder().decode(body))
  } catch {
    return new Response(JSON.stringify({ error: 'Geçersiz istek gövdesi.' }), { status: 400, headers: responseHeaders() })
  }

  const message = String(payload.message || '').trim().slice(0, 2000)
  if (!message) {
    return new Response(JSON.stringify({ error: 'Mesaj boş olamaz.' }), { status: 400, headers: responseHeaders() })
  }

  const prompt = buildAssistantPrompt(message, payload.context || {})
  const geminiFetch = env.GEMINI_FETCH || fetch

  try {
    const response = await geminiFetch(`${geminiApiBase}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 320 },
      }),
    })
    const result = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: result?.error?.message || `Gemini HTTP ${response.status}` }), { status: 502, headers: responseHeaders() })
    }

    const reply = textFromParts(result?.candidates?.[0]?.content?.parts)
    if (!reply) {
      return new Response(JSON.stringify({ error: 'Gemini boş yanıt verdi.' }), { status: 502, headers: responseHeaders() })
    }

    return new Response(reply, {
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8', 'X-Assistant-Model': model }),
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Gemini API’ye ulaşılamıyor.' }), { status: 502, headers: responseHeaders() })
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)
    const model = getGeminiModel(env)

    if (url.pathname === '/api/assistant/status') {
      return new Response(JSON.stringify(await checkGeminiStatus(env, model)), { headers: responseHeaders() })
    }

    if (url.pathname === '/api/assistant' && request.method === 'POST') {
      return generateGeminiReply(request, env, model)
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Bu API yolu desteklenmiyor.' }), { status: 503, headers: responseHeaders() })
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

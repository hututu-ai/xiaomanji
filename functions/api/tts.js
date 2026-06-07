import { createXiaomanSpeech } from '../../api/_openaiTts.js'

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400)
  }

  try {
    const result = await createXiaomanSpeech(payload, env.OPENAI_API_KEY, {
      voice: env.OPENAI_TTS_VOICE,
      model: env.OPENAI_TTS_MODEL,
    })
    return new Response(result.audio, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'private, max-age=86400',
      },
    })
  } catch (err) {
    return json({ error: err.message || 'TTS proxy error' }, err.status || 500)
  }
}

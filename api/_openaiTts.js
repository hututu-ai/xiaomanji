const OPENAI_SPEECH_ENDPOINT = 'https://api.openai.com/v1/audio/speech'

export const XIAOMAN_TTS_MODEL = 'gpt-4o-mini-tts'
export const XIAOMAN_TTS_VOICE = 'shimmer'

const XIAOMAN_VOICE_INSTRUCTIONS = [
  'Speak in Mandarin Chinese.',
  'Use a very cute, bright, soft, young-sounding storybook companion voice.',
  'The character is Xiaoman, a gentle white cat spirit with deer antlers.',
  'Keep the delivery light, warm, clear, and a little playful.',
  'Speak slowly enough to feel intimate, with small natural pauses.',
  'Avoid a robotic announcer style, exaggerated anime acting, or a mature narrator tone.',
].join(' ')

function sanitizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[✦❖●◎▧❍↻✓]/g, '')
    .trim()
    .slice(0, 260)
}

export async function createXiaomanSpeech(payload, apiKey, defaults = {}) {
  if (!apiKey) {
    const e = new Error('缺少 OPENAI_API_KEY。请在部署环境变量里设置。')
    e.status = 500
    throw e
  }

  const input = sanitizeText(payload?.text || payload?.input)
  if (!input) {
    const e = new Error('缺少要朗读的文字。')
    e.status = 400
    throw e
  }

  const voice = payload?.voice || defaults.voice || XIAOMAN_TTS_VOICE
  const instructions = payload?.instructions || defaults.instructions || XIAOMAN_VOICE_INSTRUCTIONS

  const resp = await fetch(OPENAI_SPEECH_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: defaults.model || XIAOMAN_TTS_MODEL,
      voice,
      input,
      instructions,
      response_format: 'mp3',
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    const e = new Error(`TTS 生成失败（${resp.status}）：${detail.slice(0, 240)}`)
    e.status = resp.status
    throw e
  }

  return {
    audio: await resp.arrayBuffer(),
    contentType: resp.headers.get('Content-Type') || 'audio/mpeg',
  }
}

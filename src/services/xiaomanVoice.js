const KEY = 'xmj_voice_enabled_v1'
const TTS_ENDPOINT = import.meta.env.VITE_TTS_ENDPOINT || '/api/tts'

const audioCache = new Map()
let currentAudio = null
let speakSerial = 0

export function isVoiceSupported() {
  return typeof window !== 'undefined' && typeof window.Audio !== 'undefined' && typeof fetch !== 'undefined'
}

export function getVoiceEnabled() {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(KEY) !== '0'
}

export function setVoiceEnabled(on) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // ignore private-mode storage failures
  }
}

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[✦❖●◎▧❍↻✓]/g, '')
    .trim()
    .slice(0, 220)
}

async function fetchAudioUrl(content) {
  if (audioCache.has(content)) return audioCache.get(content)
  const resp = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content }),
  })
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data?.error || `TTS 请求失败（${resp.status}）`)
  }
  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)
  audioCache.set(content, url)
  return url
}

export function primeXiaomanVoice() {
  return isVoiceSupported()
}

export function stopXiaomanVoice() {
  speakSerial += 1
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
}

export async function speakXiaoman(text, options = {}) {
  if (!isVoiceSupported()) return false
  if (!options.force && !getVoiceEnabled()) return false

  const content = cleanText(text)
  if (!content) return false

  const id = ++speakSerial
  try {
    const url = await fetchAudioUrl(content)
    if (id !== speakSerial) return false
    stopXiaomanVoice()
    speakSerial = id
    currentAudio = new Audio(url)
    currentAudio.volume = options.volume ?? 0.92
    await currentAudio.play()
    return true
  } catch (e) {
    console.warn('小满声音生成失败：', e)
    return false
  }
}

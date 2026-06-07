const KEY = 'xmj_voice_enabled_v1'
const TTS_ENDPOINT = import.meta.env.VITE_TTS_ENDPOINT || '/api/tts'

const bufferCache = new Map()
let audioCtx = null
let currentAudio = null
let currentSource = null
let speakSerial = 0

export function isVoiceSupported() {
  return typeof window !== 'undefined' && typeof fetch !== 'undefined' && (
    typeof window.Audio !== 'undefined' ||
    typeof window.AudioContext !== 'undefined' ||
    typeof window.webkitAudioContext !== 'undefined'
  )
}

export function getVoiceEnabled() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(KEY) === '1'
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

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return null
  if (!audioCtx) audioCtx = new AudioContextCtor()
  return audioCtx
}

export async function unlockXiaomanVoice() {
  const ctx = getAudioContext()
  if (!ctx) return false
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx.state === 'running'
}

async function fetchAudioBuffer(content) {
  if (bufferCache.has(content)) return bufferCache.get(content)
  const resp = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content }),
  })
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data?.error || `TTS 请求失败（${resp.status}）`)
  }
  const buffer = await resp.arrayBuffer()
  bufferCache.set(content, buffer)
  return buffer
}

async function playBuffer(buffer, volume) {
  const ctx = getAudioContext()
  if (!ctx) throw new Error('当前浏览器不支持 Web Audio')
  if (ctx.state === 'suspended') await ctx.resume()

  const decoded = await ctx.decodeAudioData(buffer.slice(0))
  const gain = ctx.createGain()
  gain.gain.value = volume
  gain.connect(ctx.destination)

  const source = ctx.createBufferSource()
  source.buffer = decoded
  source.connect(gain)
  currentSource = source
  source.start(0)
  return true
}

async function playWithAudioElement(buffer, volume) {
  const blob = new Blob([buffer], { type: 'audio/mpeg' })
  const url = URL.createObjectURL(blob)
  currentAudio = new Audio(url)
  currentAudio.volume = volume
  currentAudio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  await currentAudio.play()
  return true
}

export function primeXiaomanVoice() {
  return unlockXiaomanVoice()
}

export function stopXiaomanVoice() {
  speakSerial += 1
  if (currentSource) {
    try {
      currentSource.stop(0)
    } catch {
      // source may already have ended
    }
    currentSource = null
  }
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
    const buffer = await fetchAudioBuffer(content)
    if (id !== speakSerial) return false
    stopXiaomanVoice()
    speakSerial = id
    const volume = options.volume ?? 0.92
    try {
      return await playBuffer(buffer, volume)
    } catch {
      return await playWithAudioElement(buffer, volume)
    }
  } catch (e) {
    console.warn('小满声音生成失败：', e)
    return false
  }
}

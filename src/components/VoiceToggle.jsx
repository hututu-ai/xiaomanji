import { useEffect, useState } from 'react'
import {
  getVoiceEnabled,
  isVoiceSupported,
  primeXiaomanVoice,
  setVoiceEnabled,
  speakXiaoman,
  stopXiaomanVoice,
} from '../services/xiaomanVoice.js'
import './VoiceToggle.css'

export default function VoiceToggle({ className = '' }) {
  const [supported, setSupported] = useState(false)
  const [on, setOn] = useState(() => getVoiceEnabled())
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setSupported(isVoiceSupported())
    primeXiaomanVoice()
  }, [])

  if (!supported) return null

  function toggle(e) {
    e.stopPropagation()
    const next = !on
    setOn(next)
    setVoiceEnabled(next)
    if (next) {
      setBusy(true)
      speakXiaoman('嗯，我在呢。以后我轻轻说给你听。', { force: true }).finally(() => setBusy(false))
    } else {
      stopXiaomanVoice()
    }
  }

  return (
    <button
      type="button"
      className={`voice-toggle ${on ? 'is-on' : ''} ${className}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? '关闭 AI 小满声音' : '打开 AI 小满声音'}
      title="AI 生成的小满声音"
    >
      <span className="voice-dot" />
      <span>{busy ? '唤声中' : on ? 'AI 小满声' : '静音'}</span>
    </button>
  )
}

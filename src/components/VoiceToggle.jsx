import { useEffect, useState } from 'react'
import {
  getVoiceEnabled,
  isVoiceSupported,
  setVoiceEnabled,
  speakXiaoman,
  stopXiaomanVoice,
  unlockXiaomanVoice,
} from '../services/xiaomanVoice.js'
import './VoiceToggle.css'

export default function VoiceToggle({ className = '' }) {
  const [supported, setSupported] = useState(false)
  const [on, setOn] = useState(() => getVoiceEnabled())
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSupported(isVoiceSupported())
  }, [])

  if (!supported) return null

  async function toggle(e) {
    e.stopPropagation()
    const next = !on
    setOn(next)
    setVoiceEnabled(next)
    setFailed(false)
    if (next) {
      setBusy(true)
      await unlockXiaomanVoice()
      const ok = await speakXiaoman('嗯，我在呢。以后我轻轻说给你听。', { force: true })
      setBusy(false)
      if (!ok) {
        setOn(false)
        setVoiceEnabled(false)
        setFailed(true)
        window.setTimeout(() => setFailed(false), 2600)
      }
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
      <span>{failed ? '未接通' : busy ? '唤声中' : on ? 'AI 小满声' : '静音'}</span>
    </button>
  )
}

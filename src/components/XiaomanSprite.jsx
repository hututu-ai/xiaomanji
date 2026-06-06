import { useState, useEffect, useRef } from 'react'
import './XiaomanSprite.css'

// 小满逐帧动画。素材在 public/xiaoman/{action}-{n}.png
// action: daiji(待机·循环) / xunwuling(递寻物令·循环·12帧) / duanxiang(端详·一遍) / gaizhang(盖章·一遍·12帧)
const MODES = { daiji: 'loop', xunwuling: 'loop', duanxiang: 'once', shouxia: 'once', gaizhang: 'once' }
const FRAMES = { daiji: 12, xunwuling: 12, duanxiang: 12, shouxia: 6, gaizhang: 12 }
// 默认帧率（放慢一点，更温柔）
const FPS = { daiji: 6, xunwuling: 5, duanxiang: 8, shouxia: 6, gaizhang: 9 }

export default function XiaomanSprite({
  action = 'daiji',
  frameCount,
  fps,
  size = 240,
  onEnd,
}) {
  frameCount = frameCount || FRAMES[action] || 6
  fps = fps || FPS[action] || 7
  const [frames, setFrames] = useState([])
  const [status, setStatus] = useState('loading') // loading | frames | pearl
  const [i, setI] = useState(0)
  const endedRef = useRef(false)
  const mode = MODES[action] || 'loop'

  useEffect(() => {
    let cancelled = false
    endedRef.current = false
    setI(0)
    const load = (src) =>
      new Promise((res, rej) => {
        const img = new Image()
        img.onload = () => res(src)
        img.onerror = () => rej(src)
        img.src = src
      })
    const cands = Array.from({ length: frameCount }, (_, k) => `/xiaoman/${action}-${k + 1}.png`)
    Promise.allSettled(cands.map(load)).then((rs) => {
      if (cancelled) return
      const ok = rs.filter((r) => r.status === 'fulfilled').map((r) => r.value)
      if (ok.length >= 2) {
        setFrames(ok)
        setStatus('frames')
      } else setStatus('pearl')
    })
    return () => {
      cancelled = true
    }
  }, [action, frameCount])

  useEffect(() => {
    if (status !== 'frames') return
    const id = setInterval(() => {
      setI((prev) => {
        const next = prev + 1
        if (next >= frames.length) {
          if (mode === 'once') {
            clearInterval(id)
            if (!endedRef.current) {
              endedRef.current = true
              onEnd && setTimeout(onEnd, 60)
            }
            return frames.length - 1
          }
          return 0
        }
        return next
      })
    }, 1000 / fps)
    return () => clearInterval(id)
  }, [status, frames, fps, mode]) // eslint-disable-line

  const box = { width: size, height: size }
  return (
    <div className="xms" style={box}>
      {status === 'pearl' ? (
        <div className="xms-pearl" style={box} aria-label="小满">满</div>
      ) : status === 'loading' ? (
        <div className="xms-ph" style={box} aria-hidden />
      ) : (
        <img className="xms-img" style={box} src={frames[i] || frames[0]} alt="小满" draggable={false} />
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import './XiaomanSprite.css'

// 小满逐帧动画。素材在 public/xiaoman/{action}-{n}.png
const MODES = { daiji: 'loop', xunwuling: 'loop', duanxiang: 'once', shouxia: 'once', gaizhang: 'once' }
const FRAMES = { daiji: 12, xunwuling: 12, duanxiang: 12, shouxia: 6, gaizhang: 12 }
const FPS = { daiji: 6, xunwuling: 5, duanxiang: 8, shouxia: 6, gaizhang: 9 }

// 全局帧缓存：同一张图只加载一次，跨组件挂载/卸载也不丢
const frameCache = {}

function preloadFrame(src) {
  if (frameCache[src]) return Promise.resolve(src)
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => { frameCache[src] = true; res(src) }
    img.onerror = () => rej(src)
    img.src = src
  })
}

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
  const [i, setI] = useState(0)
  const endedRef = useRef(false)
  const timerRef = useRef(null)
  const mode = MODES[action] || 'loop'

  // 首帧立即显示（用缓存），后续帧后台加载
  useEffect(() => {
    let cancelled = false
    endedRef.current = false
    setI(0)

    const srcs = Array.from({ length: frameCount }, (_, k) => `/xiaoman/${action}-${k + 1}.png`)

    // 立即检查缓存并显示已有的帧
    const cached = srcs.filter((s) => frameCache[s])
    if (cached.length >= 1) {
      setFrames(cached)
    } else {
      // 至少让首帧占位
      setFrames(srcs.slice(0, 1))
    }

    // 后台加载缺失的帧
    Promise.allSettled(srcs.map(preloadFrame)).then(() => {
      if (cancelled) return
      const all = srcs.filter((s) => frameCache[s])
      if (all.length >= 2) setFrames(all)
    })

    return () => { cancelled = true }
  }, [action, frameCount])

  // 帧循环：用 ref 存 interval 避免闭包陷阱
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (frames.length < 2) return

    let idx = 0
    timerRef.current = setInterval(() => {
      idx++
      if (idx >= frames.length) {
        if (mode === 'once') {
          clearInterval(timerRef.current)
          timerRef.current = null
          if (!endedRef.current) {
            endedRef.current = true
            onEnd && setTimeout(onEnd, 60)
          }
          return
        }
        idx = 0
      }
      setI(idx)
    }, 1000 / fps)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [frames, fps, mode]) // eslint-disable-line

  const box = { width: size, height: size }
  const hasFrames = frames.length >= 2
  return (
    <div className="xms" style={box}>
      {hasFrames ? (
        <img
          className="xms-img"
          style={box}
          src={frames[i] || frames[0]}
          alt="小满"
          draggable={false}
        />
      ) : (
        <div className="xms-ph" style={box} aria-hidden />
      )}
    </div>
  )
}

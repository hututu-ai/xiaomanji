import { useState, useEffect, useRef } from 'react'
import './XiaomanSprite.css'

// 小满逐帧动画。素材在 public/xiaoman/{action}-{n}.webp，PNG 仅作老浏览器兜底。
const MODES = { daiji: 'loop', xunwuling: 'loop', duanxiang: 'once', shouxia: 'once', gaizhang: 'once' }
const FRAMES = { daiji: 12, xunwuling: 12, duanxiang: 12, shouxia: 6, gaizhang: 12 }
const FPS = { daiji: 6, xunwuling: 5, duanxiang: 8, shouxia: 6, gaizhang: 9 }

// 全局帧缓存：同一张图只加载一次，跨组件挂载/卸载也不丢
const frameCache = {}

function frameSrc(action, index, ext = 'webp') {
  return `/xiaoman/${action}-${index}.${ext}`
}

function preloadFrame(action, index) {
  const webp = frameSrc(action, index, 'webp')
  const png = frameSrc(action, index, 'png')
  if (frameCache[webp]) return Promise.resolve(webp)
  if (frameCache[png]) return Promise.resolve(png)
  return new Promise((res, rej) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => { frameCache[webp] = webp; res(webp) }
    img.onerror = () => {
      const fallback = new Image()
      fallback.decoding = 'async'
      fallback.onload = () => { frameCache[png] = png; res(png) }
      fallback.onerror = () => rej(png)
      fallback.src = png
    }
    img.src = webp
  })
}

export function warmXiaomanFrames(action, count = 1) {
  const total = FRAMES[action] || 6
  for (let index = 1; index <= Math.min(count, total); index++) {
    preloadFrame(action, index).catch(() => {})
  }
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

    const indices = Array.from({ length: frameCount }, (_, k) => k + 1)
    const cached = indices.map((n) => frameCache[frameSrc(action, n, 'webp')] || frameCache[frameSrc(action, n, 'png')]).filter(Boolean)
    setFrames(cached)

    preloadFrame(action, 1).then((first) => {
      if (!cancelled) setFrames((current) => (current.length ? current : [first]))
    }).catch(() => {})

    Promise.allSettled(indices.map((n) => preloadFrame(action, n))).then((result) => {
      if (cancelled) return
      const all = result.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean)
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
  const hasFrames = frames.length >= 1
  return (
    <div className="xms" style={box}>
      {hasFrames ? (
        <img
          className="xms-img"
          style={box}
          src={frames[i] || frames[0]}
          alt="小满"
          draggable={false}
          decoding="async"
        />
      ) : (
        <div className="xms-ph" style={box} aria-hidden />
      )}
    </div>
  )
}

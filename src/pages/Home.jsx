import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import XunwuScroll from '../components/XunwuScroll.jsx'
import LoadingDots from '../components/LoadingDots.jsx'
import { drawTheme, getThemeById, newThemeFromAI, registerTheme } from '../data/themes.js'
import { generateXunwu } from '../services/ai.js'
import { countJianOnDate, getTodaySign, setTodaySign } from '../services/storage.js'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const seen = useRef([]) // 最近出过的寻物令文案，喂给 AI 避免重复
  const boot = useRef(null)
  if (!boot.current) {
    const pending = getTodaySign()
    const pendingTheme = pending ? getThemeById(pending.themeId) : null
    boot.current = {
      pending: pendingTheme ? pending : null,
      theme: pendingTheme || null,
      revealed: !!pendingTheme,
    }
  }
  const [revealed, setRevealed] = useState(boot.current.revealed)
  const [theme, setTheme] = useState(boot.current.theme)
  const [pending, setPending] = useState(boot.current.pending)
  const [showPending, setShowPending] = useState(!!boot.current.pending)
  const [generating, setGenerating] = useState(false)
  const [completedToday] = useState(() => countJianOnDate(new Date()) > 0)

  // 实时生成一道新寻物令（断网/出错回退到内置）
  async function genTheme() {
    setGenerating(true)
    try {
      const ai = await generateXunwu(seen.current)
      const t = newThemeFromAI(ai)
      seen.current = [...seen.current.slice(-8), t.text]
      setTheme(t)
      if (pending) setPending(setTodaySign(t))
      return t
    } catch (e) {
      console.error('寻物令实时生成失败，回退内置：', e)
      const t = drawTheme([])
      registerTheme(t)
      seen.current = [...seen.current.slice(-8), t.text]
      setTheme(t)
      if (pending) setPending(setTodaySign(t))
      return t
    } finally {
      setGenerating(false)
    }
  }

  function reveal() {
    setRevealed(true)
    if (!theme && !pending) genTheme()
  }
  function startTodaySign(extraState = {}) {
    if (!theme) return
    registerTheme(theme)
    const rec = pending && pending.themeId === theme.id ? pending : setTodaySign(theme)
    setPending(rec)
    navigate(`/capture/${theme.id}`, { state: { todaySignId: rec.id, ...extraState } })
  }

  return (
    <motion.div className="page home2 no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="h2-head">
        <span className="h2-mark calligraphy">小满集</span>
        <span className={`h2-status ${completedToday ? 'done' : pending ? 'pending' : ''}`}>
          {completedToday ? '已盖章' : pending ? '待交' : '今日签'}
        </span>
      </header>

      {!revealed ? (
        <motion.button className="h2-intro" onClick={reveal} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <XiaomanSprite action="xunwuling" size={210} />
          <p className="h2-greet">你来啦。<br />我给你带了今天的寻物令——</p>
          <span className="h2-tap">轻轻点开，看看今天找点什么好 ✦</span>
        </motion.button>
      ) : (
        <>
          {showPending && pending && (
            <motion.div className="h2-pending" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <strong>今日签还没交</strong>
                <span>完成后，日历上才会盖今天的小满印。</span>
              </div>
              <button onClick={() => startTodaySign()}>继续</button>
              <button className="h2-pending-x" onClick={() => setShowPending(false)} aria-label="收起提醒">×</button>
            </motion.div>
          )}

          <div className="h2-stage">
            {generating ? (
              // —— 小满正在"想"今天找什么 ——
              <div className="h2-thinking">
                <XiaomanSprite action="daiji" size={150} />
                <p className="h2-say">小满正在想，今天请你找点什么好……</p>
                <LoadingDots label="灵机一动中" />
              </div>
            ) : theme ? (
              <>
                <XiaomanSprite action="xunwuling" size={120} />
                <p className="h2-say">{pending ? '这张是今天未完成的签。今天交上，日历才会盖章。' : '看，是这个——'}</p>
                <AnimatePresence mode="wait">
                  <XunwuScroll key={theme.id} theme={theme} />
                </AnimatePresence>
              </>
            ) : null}
          </div>

          {!generating && theme && (
            <div className="h2-btns">
              <button className="btn-primary h2-accept" onClick={() => startTodaySign()}>{pending ? '继续完成' : '现在就去找'}</button>
              <button className="h2-redraw" onClick={genTheme}>↻ 换一签</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

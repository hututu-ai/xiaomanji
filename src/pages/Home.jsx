import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import XunwuScroll from '../components/XunwuScroll.jsx'
import { drawTheme, getThemeById } from '../data/themes.js'
import { countJianOnDate, getTodaySign, setTodaySign } from '../services/storage.js'
import './Home.css'

// DEV-ONLY: 样板照片和动作集已移至开发页面，正式首页不显示

export default function Home() {
  const navigate = useNavigate()
  const seen = useRef([])
  const boot = useRef(null)
  if (!boot.current) {
    const pending = getTodaySign()
    const pendingTheme = pending ? getThemeById(pending.themeId) : null
    const t = pendingTheme || drawTheme([])
    seen.current = [t.id]
    boot.current = { pending: pendingTheme ? pending : null, revealed: !!pendingTheme, theme: t }
  }
  const [revealed, setRevealed] = useState(boot.current.revealed)
  const [theme, setTheme] = useState(boot.current.theme)
  const [pending, setPending] = useState(boot.current.pending)
  const [showPending, setShowPending] = useState(!!boot.current.pending)
  const [completedToday] = useState(() => countJianOnDate(new Date()) > 0)

  function redraw() {
    const t = drawTheme(seen.current)
    seen.current = [...seen.current.slice(-6), t.id]
    setTheme(t)
    if (pending) setPending(setTodaySign(t))
  }
  function startTodaySign(extraState = {}) {
    const rec = pending || setTodaySign(theme)
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
        // —— 入场：小满递来寻物令，轻触打开 ——
        <motion.button className="h2-intro" onClick={() => setRevealed(true)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
            <XiaomanSprite action="xunwuling" size={120} />
            <p className="h2-say">{pending ? '这张是今天未完成的签。今天交上，日历才会盖章。' : '看，是这个——'}</p>
            <AnimatePresence mode="wait">
              <XunwuScroll key={theme.id} theme={theme} />
            </AnimatePresence>
          </div>

          <div className="h2-btns">
            <button className="btn-primary h2-accept" onClick={() => startTodaySign()}>{pending ? '继续完成' : '现在就去找'}</button>
            <button className="h2-redraw" onClick={redraw}>↻ 换一签</button>
          </div>
        </>
      )}
    </motion.div>
  )
}

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import XunwuScroll from '../components/XunwuScroll.jsx'
import { drawTheme } from '../data/themes.js'
import { addToJinnang, getJinnang } from '../services/storage.js'
import './Home.css'

const XIAOMAN_ACTIONS = [
  { action: 'daiji', label: '待机' },
  { action: 'xunwuling', label: '寻物令' },
  { action: 'duanxiang', label: '端详' },
  { action: 'gaizhang', label: '盖章' },
  { action: 'shouxia', label: '收下' },
]

export default function Home() {
  const navigate = useNavigate()
  const seen = useRef([])
  const [revealed, setRevealed] = useState(false)
  const [theme, setTheme] = useState(() => {
    const t = drawTheme([])
    seen.current = [t.id]
    return t
  })
  const [accepted, setAccepted] = useState(null)
  const [nangCount, setNangCount] = useState(() => getJinnang().length)

  function redraw() {
    const t = drawTheme(seen.current)
    seen.current = [...seen.current.slice(-6), t.id]
    setAccepted(null)
    setTheme(t)
  }
  function accept() {
    const rec = addToJinnang(theme)
    setAccepted(rec)
    setNangCount((n) => n + 1)
  }

  return (
    <motion.div className="page home2 no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="h2-head">
        <span className="h2-mark calligraphy">小满集</span>
        <button className="h2-nang" onClick={() => navigate('/nang')}>锦囊 {nangCount > 0 ? `· ${nangCount}` : ''}</button>
      </header>

      <div className="h2-xm-strip no-scrollbar" aria-label="小满动作集">
        {XIAOMAN_ACTIONS.map((it) => (
          <div className="h2-xm-card" key={it.action}>
            <XiaomanSprite action={it.action} size={46} fps={it.action === 'gaizhang' ? 8 : 6} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>

      {!revealed ? (
        // —— 入场：小满递来寻物令，轻触打开 ——
        <motion.button className="h2-intro" onClick={() => setRevealed(true)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <XiaomanSprite action="xunwuling" size={210} />
          <p className="h2-greet">你来啦。<br />我给你带了今天的寻物令——</p>
          <span className="h2-tap">轻轻点开，看看今天找点什么好 ✦</span>
        </motion.button>
      ) : (
        <>
          <div className="h2-stage">
            <XiaomanSprite action="xunwuling" size={120} />
            <p className="h2-say">{accepted ? '收好啦，放进你的锦囊了。' : '看，是这个——'}</p>
            <AnimatePresence mode="wait">
              <XunwuScroll key={theme.id} theme={theme} />
            </AnimatePresence>
          </div>

          {!accepted ? (
            <div className="h2-btns">
              <button className="btn-primary h2-accept" onClick={accept}>❖ 收进锦囊</button>
              <button className="h2-redraw" onClick={redraw}>↻ 换一张</button>
            </div>
          ) : (
            <div className="h2-btns">
              <button className="btn-primary h2-accept" onClick={() => navigate(`/capture/${theme.id}`, { state: { nangId: accepted.id } })}>现在就去找</button>
              <button className="h2-redraw" onClick={redraw}>再领一张</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

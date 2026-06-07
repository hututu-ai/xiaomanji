import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import { COPY } from '../data/themes.js'
import { primeXiaomanVoice, speakXiaoman } from '../services/xiaomanVoice.js'
import './Cover.css'

// 封面页：名字 + slogan + 会动的小满。轻触 → 像翻开一本诗笺夹那样进入。
export default function Cover() {
  const navigate = useNavigate()
  const [opening, setOpening] = useState(false)
  const enter = () => {
    if (opening) return
    primeXiaomanVoice()
    speakXiaoman('你来啦。一起翻开小满集吧。')
    setOpening(true)
    const dest = localStorage.getItem('xmj_onboarded') ? '/home' : '/onboarding'
    setTimeout(() => navigate(dest), 720)
  }

  return (
    <motion.div
      className="cover"
      onClick={enter}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="cover-mark" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}>
        <span className="cover-name calligraphy">小满集</span>
        <img className="cover-seal" src="/seal/xiaoman-stamp.png" alt="小满印" />
      </motion.div>

      <motion.div className="cover-sprite" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}>
        <XiaomanSprite action="daiji" size={260} fps={7} />
      </motion.div>

      <motion.div className="cover-slogan calligraphy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7 }}>
        {COPY.slogan}
      </motion.div>

      <motion.div className="cover-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
        <span className="cover-enter-dot" />
        轻触，翻开小满集
      </motion.div>

      {/* 开场：宣纸自中心晕开，朱印轻轻落下 */}
      {opening && (
        <div className="cover-bloom">
          <motion.span
            className="cover-bloom-disc"
            initial={{ scale: 0 }}
            animate={{ scale: 26 }}
            transition={{ duration: 0.66, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.img
            className="cover-bloom-seal"
            src="/seal/xiaoman-stamp.png"
            alt=""
            initial={{ scale: 0.5, opacity: 0, rotate: -16 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ duration: 0.34, delay: 0.16, ease: 'backOut' }}
          />
        </div>
      )}
    </motion.div>
  )
}

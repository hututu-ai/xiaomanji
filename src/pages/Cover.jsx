import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import './Cover.css'

/**
 * 封面页 —— 一本合着的线装书。
 * 轻触后，封面从右向左翻开，露出里面等着你的小满。
 */
export default function Cover() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('closed') // closed → opening

  function enter() {
    if (phase !== 'closed') return
    setPhase('opening')
    const dest = localStorage.getItem('xmj_onboarded') ? '/home' : '/onboarding'
    // 翻书动画共约 1.2s，留 0.6s 给用户看到小满，再跳转
    setTimeout(() => navigate(dest), 1800)
  }

  return (
    <div className="cover-scene" onClick={enter}>
      <div className="cover-glow" />

      {/* ====== 合上的书 ====== */}
      <motion.div
        className="cover-book-closed"
        animate={
          phase === 'opening'
            ? { opacity: 0, scale: 1.03, transition: { duration: 0.3 } }
            : { opacity: 1, scale: 1 }
        }
        style={{ pointerEvents: phase === 'opening' ? 'none' : 'auto' }}
      >
        <div className="book-edge book-edge-3" />
        <div className="book-edge book-edge-2" />
        <div className="book-edge book-edge-1" />

        <div className="book-body">
          <div className="book-half book-back">
            <div className="book-back-texture" />
            <img className="book-back-seal" src="/seal/xiaoman-stamp.png" alt="" />
          </div>
          <div className="book-spine" />
          <div className="book-half book-front">
            <div className="book-front-inner">
              <img className="book-front-seal" src="/seal/xiaoman-stamp.png" alt="小满印" />
              <h1 className="book-title">小满集</h1>
              <p className="book-slogan">物致于此，小得盈满</p>
              <div className="book-tap">
                <span className="book-tap-dot" />
                轻触翻开
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ====== 翻开中 ====== */}
      {phase === 'opening' && (
        <div className="cover-book-opening">
          {/* 内页 —— 小满出现 */}
          <motion.div
            className="book-inside"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <div className="book-page book-page-left">
              <div className="page-inner">
                <XiaomanSprite action="xunwuling" size={140} />
              </div>
            </div>
            <div className="book-page book-page-right">
              <div className="page-inner">
                <p className="page-hello">你来啦。</p>
                <p className="page-msg">我给你带了<br />今天的寻物令——</p>
              </div>
            </div>
            <div className="page-gutter" />
          </motion.div>

          {/* 正在翻开的封面 */}
          <motion.div
            className="book-cover-flipping"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -155 }}
            transition={{ duration: 0.9, ease: [0.32, 0, 0.22, 1], delay: 0.05 }}
          >
            <div className="flip-cover-face">
              <img className="flip-seal" src="/seal/xiaoman-stamp.png" alt="" />
              <span className="flip-title">小满集</span>
            </div>
          </motion.div>

          {/* 左侧封底变暗 */}
          <motion.div
            className="book-back-open"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import { ONBOARDING } from '../data/themes.js'
import './Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const beat = ONBOARDING[i]
  const last = i === ONBOARDING.length - 1

  function done() {
    localStorage.setItem('xmj_onboarded', '1')
    navigate('/home')
  }
  function next() {
    if (last) done()
    else setI(i + 1)
  }

  return (
    <motion.div className="page onb" onClick={next} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="onb-progress">
        {ONBOARDING.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}
      </div>

      <div className="onb-stage">
        <XiaomanSprite action={beat.action} size={176} />
        <AnimatePresence mode="wait">
          <motion.div key={i} className="onb-text" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
            <p className="onb-say">{beat.say}</p>
            <p className="onb-sub">{beat.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onb-foot">
        <button className="btn-primary onb-btn" onClick={(e) => { e.stopPropagation(); next() }}>
          {last ? '好，开始吧' : '轻触继续'}
        </button>
        {!last && (
          <button className="onb-skip" onClick={(e) => { e.stopPropagation(); done() }}>跳过</button>
        )}
      </div>
    </motion.div>
  )
}

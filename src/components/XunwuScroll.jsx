import { motion } from 'framer-motion'
import './XunwuScroll.css'

// 寻物令笺：小满递来的"今天请你找的东西"
export default function XunwuScroll({ theme, delay = 0 }) {
  if (!theme) return null
  const style = theme.accent
    ? {
        '--q-accent': theme.accent.accent,
        '--q-soft': theme.accent.soft,
        '--q-wash': theme.accent.wash,
        '--q-line': theme.accent.line,
      }
    : undefined
  const typeLabel = theme.type === 'moment' ? '一个瞬间' : '一样东西'
  return (
    <motion.div
      className="xw-card"
      style={style}
      key={theme.id}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      <div className="xw-title">
        <span className="xw-line" />
        <span className="xw-name">寻物令</span>
        <span className="xw-line" />
      </div>
      <span className="xw-type">寻 · {typeLabel}</span>
      <h2 className="xw-text">{theme.text}</h2>
      {theme.hint && <p className="xw-hint">{theme.hint}</p>}
      <img className="xw-seal" src="/seal/xiaoman-stamp.png" alt="" aria-hidden />
    </motion.div>
  )
}

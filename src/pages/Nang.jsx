import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getJinnang, removeFromJinnang } from '../services/storage.js'
import { COPY } from '../data/themes.js'
import './Nang.css'

export default function Nang() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getJinnang())

  function drop(id, e) {
    e.stopPropagation()
    if (!confirm('把这道寻物令从锦囊里取出吗？')) return
    setItems(removeFromJinnang(id))
  }

  return (
    <motion.div
      className="page nang no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="nang-head">
        <h1 className="nang-title calligraphy">锦囊</h1>
        <p className="nang-sub">装着你想去找的那些</p>
      </header>

      {items.length === 0 ? (
        <div className="nang-empty">
          <div className="nang-empty-art">☉</div>
          <p>{COPY.jinnangEmpty}</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>去领一道</button>
        </div>
      ) : (
        <div className="nang-list">
          {items.map((it) => {
            const style = it.accent
              ? { '--q-accent': it.accent.accent, '--q-line': it.accent.line, '--q-wash': it.accent.wash }
              : undefined
            return (
              <button
                key={it.id}
                className="nang-card"
                style={style}
                onClick={() => navigate(`/capture/${it.themeId}`, { state: { nangId: it.id } })}
              >
                <span className="nang-type">{it.type === 'moment' ? '一个瞬间' : '一样东西'}</span>
                <span className="nang-text">{it.text}</span>
                {it.hint && <span className="nang-hint">{it.hint}</span>}
                <span className="nang-go">去完成 →</span>
                <span className="nang-del" onClick={(e) => drop(it.id, e)}>取出</span>
              </button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

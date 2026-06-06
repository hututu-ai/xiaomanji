import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PoemCard from '../components/PoemCard.jsx'
import { getJian, deleteJian, getPoetsMet } from '../services/storage.js'
import { COPY } from '../data/themes.js'
import './Shiji.css'

// 有专属故人印（萌化）的头部诗人
const SEALED = new Set(['李白', '杜甫', '苏轼', '李清照', '陆游'])

export default function Shiji() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getJian())
  const [poets] = useState(() => getPoetsMet())
  const [active, setActive] = useState(null)

  function del(id) {
    if (!confirm('把这一笺移出诗集吗？')) return
    setItems(deleteJian(id))
    setActive(null)
  }
  const activeItem = items.find((i) => i.id === active)

  return (
    <motion.div className="page shiji no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="sj-head">
        <h1 className="sj-title calligraphy">小满集</h1>
        <p className="sj-sub calligraphy">{COPY.slogan}</p>
      </header>

      {items.length === 0 ? (
        <div className="sj-empty">
          <div className="sj-empty-art">❖</div>
          <p>诗集还空着呢。<br />去领一道寻物令，找一样东西，让小满替你题首诗。</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>去找找看</button>
        </div>
      ) : (
        <>
          {poets.length > 0 && (
            <section className="sj-zhiyin">
              <h2 className="sj-sec-title">你遇见的古人 · 知音录</h2>
              <div className="sj-poets no-scrollbar">
                {poets.map((p) => (
                  <div className="sj-poet" key={p.author}>
                    {SEALED.has(p.author) ? (
                      <img className="sj-poet-img" src={`/seal/poet-${p.author}.png`} alt={p.author} />
                    ) : (
                      <div className={`sj-poet-seal ${p.author.length > 2 ? 'sj-seal-sm' : ''}`}>{p.author}</div>
                    )}
                    <div className="sj-poet-name">{p.author}</div>
                    <div className="sj-poet-tier">{p.tier} · {p.count}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <h2 className="sj-sec-title">已收 {items.length} 笺</h2>
          <div className="sj-grid">
            {items.map((it) => (
              <button className="sj-thumb" key={it.id} onClick={() => setActive(it.id)}>
                <div className="sj-thumb-img">
                  {it.image ? <img src={it.image} alt="" /> : <div className="sj-thumb-empty" />}
                </div>
                <div className="sj-thumb-verse">{it.poem?.mingju}</div>
              </button>
            ))}
          </div>

          <p className="sj-ending">{COPY.shijiEnding}</p>
        </>
      )}

      {activeItem && (
        <motion.div className="sj-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActive(null)}>
          <motion.div className="sj-modal-inner" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            <PoemCard jian={activeItem} savable onDelete={del} />
            <button className="sj-close" onClick={() => setActive(null)}>收起</button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

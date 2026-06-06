import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PoemCard from '../components/PoemCard.jsx'
import { getJian, deleteJian, getPoetsMet } from '../services/storage.js'
import { COPY } from '../data/themes.js'
import { CARD_LAYOUTS } from '../data/layouts.js'
import './Shiji.css'

// 有专属故人印（萌化）的头部诗人
const SEALED = new Set(['李白', '杜甫', '苏轼', '李清照', '陆游'])

export default function Shiji() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getJian())
  const [poets] = useState(() => getPoetsMet())
  const [active, setActive] = useState(null)

  function del(id) {
    if (!confirm('把这张诗笺移出诗笺夹吗？')) return
    setItems(deleteJian(id))
    setActive(null)
  }
  const activeItem = items.find((i) => i.id === active)
  const stats = useMemo(() => {
    const days = new Set(items.map((it) => new Date(it.createdAt).toDateString())).size
    return [
      { label: '诗笺', value: items.length },
      { label: '可换版式', value: CARD_LAYOUTS.length },
      { label: '记录天数', value: days },
    ]
  }, [items])

  return (
    <motion.div className="page shiji no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="sj-head">
        <span className="sj-kicker">照片入笺 · 明信片收纳</span>
        <h1 className="sj-title calligraphy">诗笺夹</h1>
        <p className="sj-sub">照片不单独躺着，它住进一张明信片里，也可以换成票券或书笺。</p>
      </header>

      {items.length === 0 ? (
        <div className="sj-empty">
          <div className="sj-empty-art">❖</div>
          <p>诗笺夹还空着呢。<br />去领一道寻物令，拍下你找到的东西，让小满把它装进一张明信片。</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>去找找看</button>
        </div>
      ) : (
        <>
          <section className="sj-overview" aria-label="诗笺夹概览">
            {stats.map((s) => (
              <div className="sj-stat" key={s.label}>
                <span className="sj-stat-value">{s.value}</span>
                <span className="sj-stat-label">{s.label}</span>
              </div>
            ))}
          </section>

          {poets.length > 0 && (
            <section className="sj-zhiyin">
              <h2 className="sj-sec-title">诗笺里牵出的古人</h2>
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

          <h2 className="sj-sec-title">已收 {items.length} 张诗笺</h2>
          <div className="sj-grid">
            {items.map((it) => (
              <button className="sj-thumb" key={it.id} onClick={() => setActive(it.id)}>
                <div className="sj-thumb-img">
                  {it.image ? <img src={it.image} alt="" /> : <div className="sj-thumb-empty" />}
                  <span className="sj-thumb-kind">{it.themeType === 'moment' ? '瞬间' : '物件'}</span>
                </div>
                <div className="sj-thumb-body">
                  <span className="sj-thumb-theme">{it.themeText}</span>
                  <span className="sj-thumb-note">明信片里 · {it.poem?.author ? `牵到 ${it.poem.author}` : '等待牵诗'}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="sj-ending">{COPY.shijiEnding}</p>
        </>
      )}

      {activeItem && (
        <motion.div className="sj-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActive(null)}>
          <motion.div className="sj-modal-inner" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="sj-modal-label">
              <span>{activeItem.themeText}</span>
              <small>照片住在这张诗笺里</small>
            </div>
            <PoemCard jian={activeItem} savable onDelete={del} />
            <button className="sj-close" onClick={() => setActive(null)}>收起</button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

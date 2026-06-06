import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PoemCard from '../components/PoemCard.jsx'
import { getJian, deleteJian, getPoetsMet } from '../services/storage.js'
import { COPY } from '../data/themes.js'
import { ARTIFACT_LAYOUTS } from '../data/artifacts.js'
import './Shiji.css'

// 有专属故人印（萌化）的头部诗人
const SEALED = new Set(['李白', '杜甫', '苏轼', '李清照', '陆游'])

export default function Shiji() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getJian())
  const [poets] = useState(() => getPoetsMet())
  const [active, setActive] = useState(null)
  const [view, setView] = useState('photos')

  function del(id) {
    if (!confirm('把这次拍摄和它生成的成品移出相册吗？')) return
    setItems(deleteJian(id))
    setActive(null)
  }
  const activeItem = items.find((i) => i.id === active)
  const stats = useMemo(() => {
    const days = new Set(items.map((it) => new Date(it.createdAt).toDateString())).size
    return [
      { label: '原片', value: items.length },
      { label: '成品样式', value: ARTIFACT_LAYOUTS.length },
      { label: '记录天数', value: days },
    ]
  }, [items])

  return (
    <motion.div className="page shiji no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="sj-head">
        <span className="sj-kicker">任务照片 · 生成成品</span>
        <h1 className="sj-title calligraphy">小满相册</h1>
        <p className="sj-sub">每一格先是一张你拍下的照片，再长成一张明信片、票券或书笺。</p>
      </header>

      {items.length === 0 ? (
        <div className="sj-empty">
          <div className="sj-empty-art">❖</div>
          <p>相册还空着呢。<br />去领一道寻物令，拍下你找到的东西，再让小满替它生成一张成品。</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>去找找看</button>
        </div>
      ) : (
        <>
          <section className="sj-overview" aria-label="相册概览">
            {stats.map((s) => (
              <div className="sj-stat" key={s.label}>
                <span className="sj-stat-value">{s.value}</span>
                <span className="sj-stat-label">{s.label}</span>
              </div>
            ))}
          </section>

          <div className="sj-view-switch" aria-label="查看方式">
            <button className={view === 'photos' ? 'on' : ''} onClick={() => setView('photos')}>照片母本</button>
            <button className={view === 'artifacts' ? 'on' : ''} onClick={() => setView('artifacts')}>导出成品</button>
          </div>

          {poets.length > 0 && (
            <section className="sj-zhiyin">
              <h2 className="sj-sec-title">照片里牵出的古人</h2>
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

          <h2 className="sj-sec-title">{view === 'photos' ? `已收 ${items.length} 张任务照片` : '每张照片都能导出这些成品'}</h2>
          <div className="sj-grid">
            {items.map((it) => (
              <button className="sj-thumb" key={it.id} onClick={() => setActive(it.id)}>
                <div className="sj-thumb-img">
                  {it.image ? <img src={it.image} alt="" /> : <div className="sj-thumb-empty" />}
                  <span className="sj-thumb-kind">{it.themeType === 'moment' ? '瞬间' : '物件'}</span>
                </div>
                <div className="sj-thumb-body">
                  <span className="sj-thumb-theme">{it.themeText}</span>
                  {view === 'photos' ? (
                    <span className="sj-thumb-note">原片已存 · {it.poem?.author ? `牵到 ${it.poem.author}` : '等待牵诗'}</span>
                  ) : (
                    <span className="sj-thumb-note">{(it.artifacts || ARTIFACT_LAYOUTS).map((a) => a.name).join(' / ')}</span>
                  )}
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
              <small>这张照片的生成成品</small>
            </div>
            <PoemCard jian={activeItem} savable onDelete={del} />
            <button className="sj-close" onClick={() => setActive(null)}>收起</button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

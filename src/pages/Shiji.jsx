import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PoemCard from '../components/PoemCard.jsx'
import { getJian, deleteJian, getPoetsMet } from '../services/storage.js'
import { COPY } from '../data/themes.js'
import { displayPoemLines } from '../utils/poemText.js'
import './Shiji.css'

// 有专属故人印（萌化）的头部诗人
// 15 位优先诗人（全有朱红人物印章）
const SEALED = new Set([
  '李白', '杜甫', '白居易', '杜牧', '孟浩然', '柳宗元',
  '苏轼', '李清照', '陆游', '辛弃疾', '欧阳修', '王安石', '晏殊', '柳永',
  '李煜',
])

// 节气 → 季节；用来按时令分卷
const TERM_SEASON = {
  立春: '春', 雨水: '春', 惊蛰: '春', 春分: '春', 清明: '春', 谷雨: '春',
  立夏: '夏', 小满: '夏', 芒种: '夏', 夏至: '夏', 小暑: '夏', 大暑: '夏',
  立秋: '秋', 处暑: '秋', 白露: '秋', 秋分: '秋', 寒露: '秋', 霜降: '秋',
  立冬: '冬', 小雪: '冬', 大雪: '冬', 冬至: '冬', 小寒: '冬', 大寒: '冬',
}
const SEASON_TINT = { 春: '#e2929e', 夏: '#6fb07e', 秋: '#cba35f', 冬: '#6f9aa8' }
function seasonOf(it) {
  if (it.solarTerm && TERM_SEASON[it.solarTerm]) return TERM_SEASON[it.solarTerm]
  const m = new Date(it.createdAt).getMonth() + 1
  return m <= 2 || m === 12 ? '冬' : m <= 5 ? '春' : m <= 8 ? '夏' : '秋'
}

export default function Shiji() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getJian())
  const [poets] = useState(() => getPoetsMet())
  const [active, setActive] = useState(null)
  const [vol, setVol] = useState(null) // 打开的诗卷（季节）

  function del(id) {
    if (!confirm('把这张诗笺移出诗笺夹吗？')) return
    setItems(deleteJian(id))
    setActive(null)
  }
  const activeItem = items.find((i) => i.id === active)
  const days = useMemo(
    () => new Set(items.map((it) => new Date(it.createdAt).toDateString())).size,
    [items]
  )
  // 按季节分卷
  const volumes = useMemo(() => {
    const order = ['春', '夏', '秋', '冬']
    const map = {}
    for (const it of items) {
      const s = seasonOf(it)
      ;(map[s] = map[s] || []).push(it)
    }
    return order.filter((s) => map[s]).map((s) => ({ season: s, items: map[s], cover: map[s][0].image }))
  }, [items])

  function renderCard(it) {
    return (
      <button className="sj-card" key={it.id} onClick={() => setActive(it.id)}>
        <div className="sj-card-photo">
          {it.image ? <img src={it.image} alt="" /> : <div className="sj-card-empty" />}
          {it.poem?.mingju && (
            <span className="sj-card-verse">
              {displayPoemLines(it.poem.mingju || it.poem.full, 3).map((seg, i) => (
                <span className="sj-verse-ln" key={i}>{seg}</span>
              ))}
            </span>
          )}
        </div>
        <div className="sj-card-foot">
          <span className="sj-card-by">{it.poem?.author ? `${it.poem.author}` : it.themeText}</span>
          {it.solarTerm && <span className="sj-card-term">{it.solarTerm}</span>}
        </div>
      </button>
    )
  }

  return (
    <motion.div className="page shiji no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {items.length === 0 ? (
        <>
          <header className="sj-head">
            <h1 className="sj-title calligraphy">诗笺夹</h1>
            <p className="sj-sub">你和古人，在这些瞬间相遇过。</p>
          </header>
          <div className="sj-empty">
            <div className="sj-empty-art">❖</div>
            <p>诗笺夹还空着呢。<br />去完成今日签，拍下你找到的，<br />让小满替你牵一首诗、装进一张笺。</p>
            <button className="btn-primary" onClick={() => navigate('/home')}>去找找看</button>
          </div>
        </>
      ) : vol ? (
        // —— 打开某一卷 ——
        <>
          <div className="sj-vol-head">
            <button className="sj-vol-back" onClick={() => setVol(null)}>‹ 诗卷</button>
            <span className="sj-vol-title" style={{ color: SEASON_TINT[vol] }}>{vol}之卷</span>
            <span className="sj-vol-num">{items.filter((it) => seasonOf(it) === vol).length} 笺</span>
          </div>
          <div className="sj-grid">
            {items.filter((it) => seasonOf(it) === vol).map(renderCard)}
          </div>
        </>
      ) : (
        // —— 诗卷一览（文件夹）——
        <>
          <header className="sj-head">
            <h1 className="sj-title calligraphy">诗笺夹</h1>
            <p className="sj-sub">你和古人，在这些瞬间相遇过。</p>
          </header>

          <div className="sj-meta">
            已收 <b>{items.length}</b> 张 · 记录 <b>{days}</b> 天 · 遇见 <b>{poets.length}</b> 位古人
          </div>

          {/* —— 知音录：15位诗人全部展示，遇见的点亮，未遇的置灰 —— */}
          <section className="sj-zhiyin">
            <h2 className="sj-sec-title">你遇见的古人 · {poets.length}/15</h2>
            <div className="sj-poets no-scrollbar">
              {[...SEALED].sort().map((author) => {
                const met = poets.find((p) => p.author === author)
                return (
                  <div className={`sj-poet ${met ? '' : 'sj-poet--locked'}`} key={author}>
                    <img
                      className="sj-poet-img"
                      src={`/seal/poet-${author}.png`}
                      alt={author}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="sj-poet-name">{author}</div>
                    <div className="sj-poet-tier">{met ? `${met.tier} · ${met.count}` : '未遇'}</div>
                  </div>
                )
              })}
            </div>
          </section>

          <h2 className="sj-sec-title">诗卷 · 按时令</h2>
          <div className="sj-vols">
            {volumes.map((v) => (
              <button className="sj-vol" key={v.season} style={{ '--tint': SEASON_TINT[v.season] }} onClick={() => setVol(v.season)}>
                <span className="sj-vol-sheet sj-vol-sheet2" />
                <span className="sj-vol-sheet sj-vol-sheet1" />
                <span className="sj-vol-cover">
                  {v.cover ? <img src={v.cover} alt="" /> : <span className="sj-vol-empty" />}
                  <span className="sj-vol-tag">{v.season}之卷</span>
                </span>
                <span className="sj-vol-count">{v.items.length} 笺</span>
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

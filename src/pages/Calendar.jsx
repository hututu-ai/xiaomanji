import { useState } from 'react'
import { motion } from 'framer-motion'
import { getMonthStamps, getJian } from '../services/storage.js'
import './Calendar.css'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']
const SEALED = new Set(['李白', '杜甫', '苏轼', '李清照', '陆游'])
const EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function Calendar() {
  const today = new Date()
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const stamps = getMonthStamps(ym.y, ym.m)

  // 本月遇见的古人
  const poets = (() => {
    const map = {}
    for (const j of getJian()) {
      const t = new Date(j.createdAt)
      if (t.getFullYear() === ym.y && t.getMonth() === ym.m && j.poem?.author) {
        ;(map[j.poem.author] = map[j.poem.author] || new Set()).add(j.poem.id)
      }
    }
    return Object.entries(map).map(([author, s]) => ({ author, count: s.size }))
  })()

  const first = new Date(ym.y, ym.m, 1)
  const startCol = (first.getDay() + 6) % 7
  const days = new Date(ym.y, ym.m + 1, 0).getDate()
  const rows = Math.ceil((startCol + days) / 7)
  const cells = []
  for (let i = 0; i < startCol; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length < rows * 7) cells.push(null)

  const recorded = Object.keys(stamps).length
  const isThisMonth = ym.y === today.getFullYear() && ym.m === today.getMonth()
  function shift(delta) {
    let m = ym.m + delta, y = ym.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setYm({ y, m })
  }

  return (
    <motion.div className="page cal no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <header className="cal-head">
        <button className="cal-nav" onClick={() => shift(-1)}>‹</button>
        <div className="cal-title">
          <span className="cal-en">MY {EN[ym.m]}</span>
          <span className="cal-cn">{ym.y} 年 {ym.m + 1} 月</span>
        </div>
        <button className="cal-nav" onClick={() => shift(1)} disabled={isThisMonth}>›</button>
      </header>

      <p className="cal-stat">这个月，你认真看过世界 <b>{recorded}</b> 天</p>

      <div className="cal-table">
        <div className="cal-week">{WEEK.map((w) => <div key={w} className="cal-wd">{w}</div>)}</div>
        <div className="cal-grid" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="cal-cell cal-blank" />
            const st = stamps[`${ym.y}-${ym.m}-${d}`]
            const isToday = isThisMonth && d === today.getDate()
            return (
              <div key={i} className={`cal-cell ${isToday ? 'cal-today' : ''}`}>
                <span className="cal-d">{d}</span>
                {st && (
                  <span className="cal-stamp">
                    <img src="/seal/xiaoman-stamp.png" alt="满" />
                    {st.count > 1 ? <i className="cal-badge">{st.count}</i> : null}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 本月古人图鉴 —— 它也是你的收藏本 */}
      <section className="cal-poets">
        <div className="cal-poets-head">
          <span>本月遇见的古人</span>
          <span className="cal-poets-n">{poets.length} 位</span>
        </div>
        {poets.length === 0 ? (
          <p className="cal-poets-empty">还没遇见谁——去拍一张，让小满替你牵一首诗。</p>
        ) : (
          <div className="cal-poets-row no-scrollbar">
            {poets.map((p) => (
              <div className="cal-poet" key={p.author}>
                {SEALED.has(p.author) ? (
                  <img className="cal-poet-img" src={`/seal/poet-${p.author}.png`} alt={p.author} />
                ) : (
                  <span className="cal-poet-seal">{p.author.length > 2 ? p.author.slice(0, 2) : p.author}</span>
                )}
                <span className="cal-poet-name">{p.author}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

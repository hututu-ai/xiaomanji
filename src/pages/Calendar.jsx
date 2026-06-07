import { useState } from 'react'
import { motion } from 'framer-motion'
import { getMonthStamps, getJian, getJianStats } from '../services/storage.js'
import './Calendar.css'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']
// 有朱红人物印章的诗人（优先展示萌化头像，其余用文字印）
const SEALED = new Set([
  '李白', '杜甫', '白居易', '杜牧', '孟浩然', '柳宗元',
  '苏轼', '李清照', '陆游', '辛弃疾', '欧阳修', '王安石', '晏殊', '柳永',
  '李煜',
])
const EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function Calendar() {
  const today = new Date()
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const stamps = getMonthStamps(ym.y, ym.m)
  const allJian = getJian()
  const stats = getJianStats(allJian)

  // 当前月份里出现过的古人，用来给月历补一句轻提示
  const monthPoets = (() => {
    const map = {}
    for (const j of allJian) {
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

      <div className="cal-stat">
        共盖小满印 <b>{stats.days}</b> 天 · 收 <b>{stats.total}</b> 笺 · 遇见 <b>{stats.poetCount}</b> 位古人
        <span>本月有 {recorded} 天留下印记{monthPoets.length ? ` · ${monthPoets.length} 位古人来过` : ''}</span>
      </div>

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

      {/* 古人图鉴 —— 与诗笺夹使用同一套统计 */}
      <section className="cal-poets">
        <div className="cal-poets-head">
          <span>你遇见的古人</span>
          <span className="cal-poets-n">{stats.poetCount} 位</span>
        </div>
        {stats.poets.length === 0 ? (
          <p className="cal-poets-empty">还没遇见谁——完成寻物令，小满会替你牵一首诗，也在集章记盖上今天的印。</p>
        ) : (
          <div className="cal-poets-row no-scrollbar">
            {stats.poets.map((p) => (
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

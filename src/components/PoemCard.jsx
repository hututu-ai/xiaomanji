import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { COPY } from '../data/themes.js'
import { CARD_LAYOUTS, defaultCardLayout, getCardLayoutName } from '../data/layouts.js'
import './PoemCard.css'

function fmtDate(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}
const novert = (s = '') => s.replace(/[，。、！？；：]/g, ' ')

/**
 * 诗笺成品 —— 照片直接住在明信片 / 书笺 / 票券的卡面里。
 * 导出的图片含：照片 · 寻物令主题 · 诗句 · 出处 · 时令 · 日期 · 小满落款印。
 * 共鸣话 / 跋 在成品下方，作为诗笺夹条目的上下文保存。
 */
export default function PoemCard({ jian, savable = false, onDelete }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const [layout, setLayout] = useState(jian.layout || defaultCardLayout(jian.poem))
  const { image, poem, resonance, postscript, themeText, solarTerm, createdAt } = jian
  if (!poem) return null

  async function save() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2.2, cacheBust: true, backgroundColor: null })
      const a = document.createElement('a')
      const name = (themeText || poem.mingju || '一张照片').replace(/[\\/:*?"<>|]/g, '').slice(0, 12)
      a.download = `小满诗笺夹_${name}_${getCardLayoutName(layout)}.png`
      a.href = url
      a.click()
    } catch (e) {
      console.error(e)
      alert('保存失败了，再试一次好吗～')
    } finally {
      setSaving(false)
    }
  }

  const Seal = () => (
    <img className="pm-seal" src="/seal/xiaoman-stamp.png" alt="小满" onError={(e) => (e.target.style.display = 'none')} />
  )
  const term = solarTerm || ''
  const source = `${poem.author}《${poem.title}》`

  return (
    <div className="pm-outer">
      <div className={`pm-card pm-${layout}`} ref={cardRef}>
        {/* —— 书笺·刻本 —— */}
        {layout === 'shujian' && (
          <div className="sj-paper">
            <div className="sj-border">
              <div className="sj-top">
                <span className="sj-corner">物致于此</span>
                <span className="sj-corner sj-corner-r">小得盈满</span>
              </div>
              <div className="sj-paint">{image ? <img src={image} alt="" crossOrigin="anonymous" /> : <div className="sj-empty" />}</div>
              <div className="sj-versewrap">
                <div className="sj-title-col">{poem.title}</div>
                <div className="sj-verse">{poem.full}</div>
                <div className="sj-sealcol"><Seal /></div>
              </div>
              <div className="sj-bottom">
                <span>{poem.author} · {poem.dynasty}</span>
                <span className="sj-term">{term || themeText}</span>
                <span>{fmtDate(createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* —— 明信片 —— */}
        {layout === 'postcard' && (
          <div className="pc-frame">
            <div className="pc-paint">
              {image ? <img className="pc-photo" src={image} alt="" crossOrigin="anonymous" /> : <div className="pc-photo pc-empty" />}
              <div className="pc-inscribe">
                <span className="pc-verse">{novert(poem.mingju)}</span>
                <Seal />
              </div>
            </div>
            <div className="pc-source">—— {source} · {poem.dynasty}</div>
            <div className="pc-foot">
              <span className="pc-term">{term || themeText}</span>
              <span className="pc-slogan calligraphy">{COPY.slogan}</span>
              <span className="pc-date">{fmtDate(createdAt)}</span>
            </div>
          </div>
        )}

        {/* —— 票券 —— */}
        {layout === 'ticket' && (
          <div className="tk-body">
            <div className="tk-left">
              <div className="tk-show">寻物令 · {themeText}</div>
              <div className="tk-verse">{novert(poem.mingju)}</div>
              <div className="tk-src">{source} · {poem.dynasty}</div>
              <div className="tk-meta"><span className="tk-term">{term}</span><span>{fmtDate(createdAt)}</span></div>
            </div>
            <div className="tk-perf" />
            <div className="tk-right">
              <div className="tk-photo">{image ? <img src={image} alt="" crossOrigin="anonymous" /> : <div className="pc-empty" />}</div>
              <div className="tk-stub"><Seal /><span className="tk-barcode" /></div>
            </div>
          </div>
        )}
      </div>

      {/* 版式切换 */}
      <div className="pm-switch">
        {CARD_LAYOUTS.map((l) => (
          <button key={l.id} className={`pm-sw ${layout === l.id ? 'on' : ''}`} onClick={() => setLayout(l.id)}>{l.name}</button>
        ))}
      </div>

      {/* 小满共鸣话 + 你的跋（不入保存图） */}
      {resonance && (
        <p className="pm-reson">{resonance}<span className="pm-by">— 小满</span></p>
      )}
      {postscript && (
        <div className="pm-post"><span className="pm-post-label">你说</span>{postscript}</div>
      )}

      <button className="pm-fulltoggle" onClick={() => setShowFull((v) => !v)}>{showFull ? '收起全诗' : '看全诗'}</button>
      {showFull && <p className="pm-full">{poem.full}</p>}

      {(savable || onDelete) && (
        <div className="pm-actions">
          {savable && <button className="btn-ghost pm-act" onClick={save} disabled={saving}>{saving ? '正在生成…' : `导出${getCardLayoutName(layout)}`}</button>}
          {onDelete && <button className="pm-del" onClick={() => onDelete(jian.id)}>移出诗笺夹</button>}
        </div>
      )}
    </div>
  )
}

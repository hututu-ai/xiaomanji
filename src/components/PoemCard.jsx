import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { COPY } from '../data/themes.js'
import { CARD_LAYOUTS, defaultCardLayout } from '../data/layouts.js'
import './PoemCard.css'

function fmtDate(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}
const novert = (s = '') => s.replace(/[，。、！？；：]/g, ' ')

/** 截取诗文前 2–6 句用于书笺展示，避免整首诗太长撑爆版面 */
function excerptVerse(full, maxSentences = 4) {
  if (!full) return ''
  // 按句号、句号+换行拆分
  const sentences = full.split(/[。！？]+/).filter(s => s.trim())
  if (sentences.length <= maxSentences) return full
  return sentences.slice(0, maxSentences).join('。') + '。'
}

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

  async function share() {
    if (!cardRef.current) return
    setSaving(true)
    const node = cardRef.current
    node.classList.add('pm-shot--export') // 仅截图这一刻才套上品牌外框 + 二维码
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2.4, cacheBust: true, backgroundColor: null })
      const name = (poem.mingju || themeText || '诗笺').replace(/[\\/:*?"<>|，。]/g, '').slice(0, 10)
      const fname = `小满集_${name}.png`
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], fname, { type: 'image/png' })
      // 移动端优先走系统分享面板（微信 / 存相册 / …）
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '小满集 · 一拍一首诗', text: `${poem.mingju}　——${poem.author}` })
      } else {
        const a = document.createElement('a')
        a.download = fname
        a.href = dataUrl
        a.click()
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return // 用户取消分享，不报错
      console.error(e)
      alert('生成失败了，再试一次好吗～')
    } finally {
      node.classList.remove('pm-shot--export')
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
      <div className="pm-shot" ref={cardRef}>
        <div className={`pm-card pm-${layout}`}>
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
                <div className="sj-verse">{excerptVerse(poem.full, 4)}</div>
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
              <img className="pc-stamp" src="/seal/xiaoman-stamp.png" alt="小满" onError={(e) => (e.target.style.display = 'none')} />
            </div>
            <div className="pc-body">
              <div className="pc-verse-h">
                {poem.mingju.split('，').map((seg, i, arr) => (
                  <span className="pc-vh-ln" key={i}>{seg}{i < arr.length - 1 ? '，' : ''}</span>
                ))}
              </div>
              <div className="pc-source">—— {poem.author}《{poem.title}》· {poem.dynasty}</div>
              <div className="pc-foot">
                <span className="pc-term">{term || themeText}</span>
                <span className="pc-slogan calligraphy">{COPY.slogan}</span>
                <span className="pc-date">{fmtDate(createdAt)}</span>
              </div>
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
        <div className="pm-shot-brand">
          <img className="pm-shot-qr" src="/share-qr.png" alt="" />
          <div className="pm-shot-words">
            <b>小满集 · 一拍一首诗</b>
            <span>扫码，也去找一句属于你的诗</span>
          </div>
        </div>
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
          {savable && <button className="btn-primary pm-act" onClick={share} disabled={saving}>{saving ? '正在生成…' : '✦ 分享这张诗笺'}</button>}
          {onDelete && <button className="pm-del" onClick={() => onDelete(jian.id)}>移出诗笺夹</button>}
        </div>
      )}
    </div>
  )
}

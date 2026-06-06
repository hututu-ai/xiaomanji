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

  // 预加载 QR 码，避免分享时因图片未加载导致 toPng 失败
  const qrPreloaded = useRef(false)
  if (!qrPreloaded.current) {
    qrPreloaded.current = true
    const preload = new Image()
    preload.src = '/share-qr.png'
  }

  async function share() {
    if (!cardRef.current) return
    setSaving(true)
    const node = cardRef.current
    // 先让品牌框可见，等浏览器渲染一帧再截图
    node.classList.add('pm-shot--export')
    await new Promise((r) => requestAnimationFrame(r))
    await new Promise((r) => setTimeout(r, 120))
    try {
      // 降低像素比避免 mobile canvas 超限；加背景色提升兼容性
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: false,
        backgroundColor: '#fafafa',
      })
      const name = (themeText || poem.mingju || '诗笺').replace(/[\\/:*?"<>|，。？！、\s]/g, '').slice(0, 12)
      const fname = `小满集_${name}.png`
      // 直接下载（避免 navigator.share 的 files 兼容性问题）
      const a = document.createElement('a')
      a.download = fname
      a.href = dataUrl
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('分享失败', e)
      // 降级：用 Canvas 手动绘制
      try {
        const dataUrl2 = await toPng(node, { pixelRatio: 1.5, cacheBust: false, backgroundColor: '#fafafa' })
        const a = document.createElement('a')
        a.download = `小满集_${Date.now()}.png`
        a.href = dataUrl2
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (e2) {
        console.error('降级也失败', e2)
        alert('生成失败了。请截屏保存这张诗笺吧～')
      }
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
                <span className="sj-term">{term}</span>
                <span>{fmtDate(createdAt)}</span>
              </div>
              <div className="sj-theme">寻物令：「{themeText}」</div>
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
                {(() => {
                  const hasStrong = /[。？！]/.test(poem.mingju)
                  const lines = hasStrong
                    ? poem.mingju.split(/[。？！]/).filter(Boolean)
                    : poem.mingju.split('，').filter(Boolean)
                  return lines.map((seg, i, arr) => (
                    <span className="pc-vh-ln" key={i}>{seg}{!hasStrong && i < arr.length - 1 ? '，' : ''}</span>
                  ))
                })()}
              </div>
              <div className="pc-theme">「{themeText}」</div>
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

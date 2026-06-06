import { useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { COPY } from '../data/themes.js'
import { CARD_LAYOUTS, defaultCardLayout } from '../data/layouts.js'
import { compactVerse, displayPoemLines, poemExcerpt } from '../utils/poemText.js'
import './PoemCard.css'

function fmtDate(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}
const novert = (s = '') => s.replace(/[，。、！？；：]/g, ' ')
const SHARE_URL = 'https://xiaomanji-dyv.pages.dev/'
const isWeChat = () => /MicroMessenger/i.test(navigator.userAgent || '')

function safeName(text = '诗笺') {
  return text.replace(/[\\/:*?"<>|，。？！、\s]/g, '').slice(0, 12) || '诗笺'
}

async function waitForExportAssets(node) {
  const imgs = Array.from(node.querySelectorAll('img'))
  await Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    return new Promise((resolve) => {
      img.onload = resolve
      img.onerror = resolve
    })
  }))
  if (document.fonts?.ready) await document.fonts.ready
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const chars = Array.from(text || '')
  let line = ''
  let lineCount = 0
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      line = ch
      lineCount += 1
      if (lineCount >= maxLines) return y
    } else {
      line = test
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y)
    y += lineHeight
  }
  return y
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92))
}

async function renderFallbackCard({ image, poem, resonance, themeText, solarTerm, createdAt }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1500
  const ctx = canvas.getContext('2d')
  const photo = await loadImage(image)
  const stamp = await loadImage('/seal/xiaoman-stamp.png')
  const qr = await loadImage('/share-qr.png')

  ctx.fillStyle = '#eef7f3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#e4f4ee')
  gradient.addColorStop(0.55, '#fafafa')
  gradient.addColorStop(1, '#fbe7e9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  roundRect(ctx, 74, 70, 932, 1060, 42)
  ctx.fillStyle = '#fffdf8'
  ctx.shadowColor = 'rgba(58,58,52,.18)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 12
  ctx.fill()
  ctx.restore()

  const px = 108, py = 104, pw = 864, ph = 650
  ctx.save()
  roundRect(ctx, px, py, pw, ph, 28)
  ctx.clip()
  if (photo) {
    const scale = Math.max(pw / photo.width, ph / photo.height)
    const sw = photo.width * scale
    const sh = photo.height * scale
    ctx.drawImage(photo, px + (pw - sw) / 2, py + (ph - sh) / 2, sw, sh)
  } else {
    ctx.fillStyle = '#e4f4ee'
    ctx.fillRect(px, py, pw, ph)
  }
  ctx.restore()

  if (stamp) {
    ctx.save()
    ctx.translate(902, 150)
    ctx.rotate(0.1)
    ctx.globalAlpha = 0.82
    ctx.drawImage(stamp, -68, -68, 136, 136)
    ctx.restore()
  }

  ctx.fillStyle = '#2f2f2a'
  ctx.textAlign = 'center'
  ctx.font = '700 46px serif'
  displayPoemLines(poem?.mingju || poem?.full, 4).forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 835 + i * 64)
  })

  ctx.fillStyle = '#cba35f'
  ctx.font = '30px serif'
  ctx.fillText(`${poem?.author || ''}《${poem?.title || ''}》 · ${poem?.dynasty || ''}`, canvas.width / 2, 1084)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#46a98f'
  ctx.font = '600 32px serif'
  ctx.fillText(`寻物令：「${themeText || '今日签'}」`, 108, 1198)

  ctx.fillStyle = '#6b675e'
  ctx.font = '28px serif'
  const meta = [solarTerm, fmtDate(createdAt)].filter(Boolean).join(' · ')
  ctx.fillText(meta, 108, 1248)

  ctx.fillStyle = '#46a98f'
  ctx.font = '30px serif'
  drawWrapped(ctx, resonance || '这一幕，让我想起了这一句。', 108, 1316, 710, 48, 2)

  if (qr) {
    ctx.drawImage(qr, 108, 1362, 96, 96)
  }
  ctx.fillStyle = '#46a98f'
  ctx.font = '700 30px serif'
  ctx.fillText('小满集 · 一拍一首诗', 230, 1396)
  ctx.fillStyle = '#9a958a'
  ctx.font = '24px serif'
  ctx.fillText('扫码，也去找一句属于你的诗', 230, 1438)

  return canvasToBlob(canvas)
}

/**
 * 诗笺成品 —— 照片直接住在明信片 / 书笺 / 票券的卡面里。
 * 导出的图片含：照片 · 寻物令主题 · 诗句 · 出处 · 时令 · 日期 · 小满落款印。
 * 共鸣话 / 跋 在成品下方，作为诗笺夹条目的上下文保存。
 */
export default function PoemCard({ jian, savable = false, onDelete }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [sharePreview, setSharePreview] = useState(null)
  const [shareHint, setShareHint] = useState('')
  const [layout, setLayout] = useState(jian.layout || defaultCardLayout(jian.poem))
  const { image, poem, resonance, postscript, themeText, solarTerm, createdAt } = jian
  if (!poem) return null

  // 预加载 QR 码，避免分享导出时图片还没解码。
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
    node.classList.add('pm-shot--export')
    await new Promise((r) => requestAnimationFrame(r))
    try {
      await waitForExportAssets(node)
      const options = {
        pixelRatio: Math.min(2, window.devicePixelRatio || 2),
        cacheBust: false,
        backgroundColor: '#fafafa',
      }
      let blob = await toBlob(node, options)
      if (!blob) {
        blob = await renderFallbackCard({ image, poem, resonance, themeText, solarTerm, createdAt })
      }
      if (!blob) throw new Error('无法生成图片')
      const filename = `小满集_${safeName(themeText || poem.mingju)}.png`
      const file = typeof File !== 'undefined' ? new File([blob], filename, { type: 'image/png' }) : null

      if (file && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '小满集',
            text: `我在小满集收下一张诗笺：${SHARE_URL}`,
          })
          return
        } catch (e) {
          if (e?.name === 'AbortError') return
          console.warn('系统分享不可用，改为图片预览', e)
        }
      }

      const preview = await blobToDataUrl(blob)
      setSharePreview(preview)
      setShareHint(isWeChat()
        ? '图片已生成。在微信里长按图片，可以保存到相册或发送给朋友；发朋友圈请先保存到相册。'
        : '图片已生成。长按图片保存，或点下方按钮保存。')
    } catch (e) {
      console.error('分享失败', e)
      try {
        const blob = await renderFallbackCard({ image, poem, resonance, themeText, solarTerm, createdAt })
        if (!blob) throw new Error('兜底图片生成失败')
        const preview = await blobToDataUrl(blob)
        setSharePreview(preview)
        setShareHint(isWeChat()
          ? '图片已生成。在微信里长按图片，可以保存到相册或发送给朋友；发朋友圈请先保存到相册。'
          : '图片已生成。长按图片保存，或点下方按钮保存。')
      } catch (e2) {
        console.error('兜底分享失败', e2)
        setShareHint('这次没有生成成功。请先截图保存。')
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
              <div className="sj-paint">{image ? <img src={image} alt="" /> : <div className="sj-empty" />}</div>
              <div className="sj-versewrap">
                <div className="sj-title-col">{poem.title}</div>
                <div className="sj-verse">{poemExcerpt(poem, 4)}</div>
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
              {image ? <img className="pc-photo" src={image} alt="" /> : <div className="pc-photo pc-empty" />}
              <img className="pc-stamp" src="/seal/xiaoman-stamp.png" alt="小满" onError={(e) => (e.target.style.display = 'none')} />
            </div>
            <div className="pc-body">
              <div className="pc-verse-h">
                {displayPoemLines(poem.mingju || poem.full, 4).map((seg, i) => (
                  <span className="pc-vh-ln" key={i}>{seg}</span>
                ))}
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
              <div className="tk-verse">{novert(compactVerse(poem.mingju || poem.full, 2))}</div>
              <div className="tk-src">{source} · {poem.dynasty}</div>
              <div className="tk-meta"><span className="tk-term">{term}</span><span>{fmtDate(createdAt)}</span></div>
            </div>
            <div className="tk-perf" />
            <div className="tk-right">
              <div className="tk-photo">{image ? <img src={image} alt="" /> : <div className="pc-empty" />}</div>
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

      {(savable || onDelete) && (
        <div className="pm-actions">
          {savable && <button className="btn-primary pm-act" onClick={share} disabled={saving}>{saving ? '正在生成…' : '✦ 分享/保存诗笺'}</button>}
          {onDelete && <button className="pm-del" onClick={() => onDelete(jian.id)}>移出诗笺夹</button>}
        </div>
      )}

      {(sharePreview || shareHint) && (
        <div className="pm-share-mask" onClick={() => { setSharePreview(null); setShareHint('') }}>
          <div className="pm-share-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="pm-share-close" onClick={() => { setSharePreview(null); setShareHint('') }}>×</button>
            {sharePreview ? <img className="pm-share-img" src={sharePreview} alt="生成的诗笺" /> : null}
            <p className="pm-share-hint">{shareHint}</p>
            {sharePreview && (
              <a className="pm-share-download" href={sharePreview} download={`小满集_${safeName(themeText || poem.mingju)}.png`}>
                保存图片
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

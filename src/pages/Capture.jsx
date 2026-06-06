import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import XiaomanSprite from '../components/XiaomanSprite.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'
import PoemCard from '../components/PoemCard.jsx'
import LoadingDots from '../components/LoadingDots.jsx'
import { getThemeById, COPY } from '../data/themes.js'
import { defaultCardLayout } from '../data/layouts.js'
import { compressImageToDataURL, addJian, clearTodaySign, solarTerm } from '../services/storage.js'
import { matchPoem } from '../services/ai.js'
import './Capture.css'

export default function Capture() {
  const { themeId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const theme = getThemeById(themeId)
  const sampleUrl = state?.sampleUrl
  const sampleLabel = state?.sampleLabel

  const [step, setStep] = useState('intro') // intro|thinking|result|postscript|sealing|done|error
  const [image, setImage] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [result, setResult] = useState(null) // {poem, resonance, understanding}
  const [postscript, setPostscript] = useState('')
  const [error, setError] = useState('')
  const excludeRef = useRef([])
  const savedRef = useRef(null)
  const finalizedRef = useRef(false)
  const sampleLoadedRef = useRef(false)

  async function runMatch(dataUrl) {
    setError('')
    setStep('thinking')
    try {
      const r = await matchPoem(dataUrl, theme, excludeRef.current)
      if (r.poem) excludeRef.current.push(r.poem.id)
      setResult(r)
      setStep('result')
    } catch (e) {
      console.error(e)
      setError(e.message || '小满刚刚走神了，再试一次好吗～')
      setStep('error')
    }
  }

  async function handlePick(file) {
    try {
      const dataUrl = await compressImageToDataURL(file)
      setImage(dataUrl)
      setPreviewOpen(false)
      runMatch(dataUrl)
    } catch (e) {
      console.error(e)
      setError('这张图片读不出来，换一张试试？')
      setStep('error')
    }
  }

  useEffect(() => {
    if (!theme || !sampleUrl || sampleLoadedRef.current) return
    sampleLoadedRef.current = true
    async function loadSample() {
      try {
        const resp = await fetch(sampleUrl)
        if (!resp.ok) throw new Error('样板照片读取失败')
        const blob = await resp.blob()
        const file = new File([blob], `${sampleLabel || 'sample'}.jpg`, { type: blob.type || 'image/jpeg' })
        const dataUrl = await compressImageToDataURL(file)
        setImage(dataUrl)
        setPreviewOpen(false)
        runMatch(dataUrl)
      } catch (e) {
        console.error(e)
        setError('这张样板照片暂时读不出来，换一张试试？')
        setStep('error')
      }
    }
    loadSample()
  }, [sampleUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!theme) {
    return (
      <div className="page capture" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--ink-soft)' }}>这道寻物令找不到了。</p>
        <button className="btn-ghost" onClick={() => navigate('/home')}>回今日签</button>
      </div>
    )
  }

  function rematch() {
    if (image) runMatch(image)
  }

  function finalize() {
    if (finalizedRef.current) return
    finalizedRef.current = true
    const p = result.poem
    savedRef.current = addJian({
      image,
      themeId: theme.id,
      themeText: theme.text,
      themeType: theme.type,
      accent: theme.accent,
      layout: defaultCardLayout(p),
      poem: { id: p.id, mingju: p.mingju, full: p.full, title: p.title, author: p.author, dynasty: p.dynasty, form: p.form },
      resonance: result.resonance,
      postscript: postscript.trim(),
      solarTerm: solarTerm(),
    })
    clearTodaySign()
    setStep('done')
  }

  return (
    <motion.div
      className="page capture no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="cap-head2">
        <span className="cap-h2-tag">{theme.type === 'moment' ? '寻 · 一个瞬间' : '寻 · 一样东西'}</span>
        <h1 className="cap-h2-theme">{theme.text}</h1>
      </header>

      <div className="cap-stage">
        {image && step !== 'done' && step !== 'sealing' && (
          <button
            type="button"
            className={`cap-preview ${previewOpen ? 'is-open' : ''}`}
            onClick={() => setPreviewOpen((v) => !v)}
            aria-label={previewOpen ? '收起照片预览' : '展开照片预览'}
          >
            <span className="cap-fold-layer cap-fold-back" />
            <span className="cap-fold-layer cap-fold-mid" />
            <span className="cap-fold-photo">
              <img src={image} alt="" />
            </span>
            <span className="cap-fold-mark">已折入明信片</span>
          </button>
        )}

        {step === 'intro' && (
          <div className="cap-block">
            <div className="cap-xm-row">
              <XiaomanSprite action="daiji" size={100} />
              <p className="cap-bubble">我在这儿等着——把你找到的那一幕，拍给我看看吧。</p>
            </div>
            <PhotoCapture onPick={handlePick} />
            <div className="cap-tips">
              <p className="cap-tips-title">小满的小建议 ✨</p>
              <ul className="cap-tips-list">
                <li>不用拍得多好看，随手拍就行</li>
                <li>一朵花、一杯茶、窗外的云…都可以</li>
                <li>我会替你从千年的诗里，找到和你此刻同频的那一句</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'thinking' && (
          <div className="cap-block cap-center cap-thinking">
            <XiaomanSprite action="duanxiang" size={168} />
            <p className="cap-think-say">小满正在端详你的画面……</p>
            <LoadingDots label="替你从千年的诗里，牵一句" />
          </div>
        )}

        {step === 'result' && result?.poem && (
          <motion.div className="cap-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <PoemCard jian={{ image, poem: result.poem, resonance: result.resonance, themeText: theme.text, solarTerm: solarTerm(), createdAt: Date.now(), accent: theme.accent }} />
            <div className="cap-decide">
              <button className="btn-primary" onClick={() => setStep('postscript')}>收进诗笺夹</button>
              <div className="cap-decide-sub">
                <button className="cap-mini" onClick={rematch}>换一首诗</button>
                <button className="cap-mini" onClick={() => navigate('/home')}>这次先不收</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'postscript' && (
          <motion.div className="cap-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cap-xm-row">
              <XiaomanSprite action="xunwuling" size={84} fps={7} />
              <p className="cap-bubble">{COPY.postscriptAsk}</p>
            </div>
            <textarea
              className="cap-textarea"
              placeholder={COPY.postscriptPlaceholder}
              value={postscript}
              onChange={(e) => setPostscript(e.target.value)}
              maxLength={140}
              rows={3}
              autoFocus
            />
            <button className="btn-primary cap-full" onClick={() => setStep('sealing')}>
              装进明信片，盖个章
            </button>
          </motion.div>
        )}

        {step === 'sealing' && (
          <div className="cap-block cap-center">
            <XiaomanSprite action="gaizhang" size={150} onEnd={finalize} />
            <p className="cap-sealing-tip">正在替你钤上小满印…</p>
          </div>
        )}

        {step === 'done' && savedRef.current && (
          <motion.div className="cap-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="cap-done-tip">收好啦 ✦ 它住进你的诗笺夹了</p>
            <PoemCard jian={savedRef.current} savable />
            <div className="cap-done-btns">
              <button className="btn-primary" onClick={() => navigate('/shiji')}>去诗笺夹看看</button>
              <button className="btn-ghost" onClick={() => navigate('/home')}>回今日</button>
            </div>
          </motion.div>
        )}

        {step === 'error' && (
          <div className="cap-block cap-center">
            <p className="cap-error">{error}</p>
            <button className="btn-ghost" onClick={() => (image ? rematch() : setStep('intro'))}>再试一次</button>
            <button className="cap-mini" onClick={() => navigate('/home')}>先回去</button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

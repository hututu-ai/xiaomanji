import { useRef } from 'react'
import './PhotoCapture.css'

/**
 * 拍照 / 相册上传。
 * 真实调用：<input type="file" accept="image/*" capture> 在手机上会唤起相机/相册。
 * props.onPick(file) —— 选好图后回调原始 File。
 */
export default function PhotoCapture({ onPick, disabled, theme }) {
  const cameraRef = useRef(null)
  const albumRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // 允许重复选同一张
  }

  return (
    <div className="pc-wrap">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleChange}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      <div className="pc-head">
        <span>今日交</span>
        <strong>{theme?.text || '把你找到的那一幕交给小满'}</strong>
        <p>{theme?.hint || '照片会直接折进明信片，成为诗笺夹里的一张证据。'}</p>
      </div>

      <div className="pc-viewfinder" aria-hidden="true">
        <span className="pc-corner pc-corner-a" />
        <span className="pc-corner pc-corner-b" />
        <span className="pc-corner pc-corner-c" />
        <span className="pc-corner pc-corner-d" />
        <div className="pc-lens">
          <span />
        </div>
      </div>

      <div className="pc-actions">
        <button
          className="pc-choice pc-choice-primary"
          disabled={disabled}
          onClick={() => cameraRef.current?.click()}
        >
          <span className="pc-ico">◎</span>
          <span className="pc-choice-text">
            <strong>拍一张</strong>
            <small>现在取景</small>
          </span>
        </button>
        <button
          className="pc-choice"
          disabled={disabled}
          onClick={() => albumRef.current?.click()}
        >
          <span className="pc-ico">▧</span>
          <span className="pc-choice-text">
            <strong>相册选</strong>
            <small>用刚拍好的那张</small>
          </span>
        </button>
      </div>
    </div>
  )
}

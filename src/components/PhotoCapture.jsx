import { useRef } from 'react'
import './PhotoCapture.css'

/**
 * 拍照 / 相册上传。
 * 真实调用：<input type="file" accept="image/*" capture> 在手机上会唤起相机/相册。
 * props.onPick(file) —— 选好图后回调原始 File。
 */
export default function PhotoCapture({ onPick, disabled }) {
  const cameraRef = useRef(null)
  const albumRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // 允许重复选同一张
  }

  return (
    <div className="pc-wrap">
      {/* capture=environment：手机上直接打开后置摄像头拍照 */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleChange}
      />
      {/* 不带 capture：打开相册 */}
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      <button
        className="btn-primary pc-btn"
        disabled={disabled}
        onClick={() => cameraRef.current?.click()}
      >
        <span className="pc-ico">◎</span> 拍一张
      </button>
      <button
        className="btn-ghost pc-btn"
        disabled={disabled}
        onClick={() => albumRef.current?.click()}
      >
        从相册里找
      </button>
    </div>
  )
}

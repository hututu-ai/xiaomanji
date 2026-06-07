import { useRef } from 'react'
import './PhotoCapture.css'

// 拍照 / 相册上传。两个选项并排一排，真实唤起相机/相册。
export default function PhotoCapture({ onPick, disabled }) {
  const cameraRef = useRef(null)
  const albumRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // 允许重复选同一张
  }

  return (
    <div className="pc-row">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleChange} />
      <input ref={albumRef} type="file" accept="image/*" hidden onChange={handleChange} />

      <button className="pc-act pc-act--cam" disabled={disabled} onClick={() => cameraRef.current?.click()}>
        <span className="pc-act-label">拍一张</span>
      </button>

      <button className="pc-act pc-act--album" disabled={disabled} onClick={() => albumRef.current?.click()}>
        <span className="pc-act-label">从相册选</span>
      </button>
    </div>
  )
}

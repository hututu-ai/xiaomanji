import './LoadingDots.css'

// 小满"正在看"的呼吸点，克制柔和。
export default function LoadingDots({ label }) {
  return (
    <span className="loading-dots" role="status" aria-live="polite">
      {label && <span className="loading-label">{label}</span>}
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </span>
  )
}

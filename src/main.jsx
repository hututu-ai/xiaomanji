import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { maybeSeedJian } from './services/storage.js'
import './styles/global.css'

// 首次打开注入示例诗笺，确保 App 不空着（同步写 localStorage，先于首屏渲染）。
maybeSeedJian()

// 用 HashRouter：纯静态部署无需服务器 rewrite，刷新子页面也不会 404。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </React.StrictMode>
)

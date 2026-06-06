// Vercel Serverless Function —— AI 中转代理。
// 部署到 Vercel 后，前端的 POST /api/ai 会命中这里。
// 它只做一件事：把 { model, messages } 转发给 DashScope，并把 Key 留在服务器端。
//
// 本地开发时不会走这个文件，而是走 vite.config.js 里的同名中间件（逻辑一致）。

import { callDashScope } from './_dashscope.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    // Vercel 已自动解析 JSON body
    const payload = req.body || {}
    const data = await callDashScope(payload, process.env.AI_API_KEY || process.env.DASHSCOPE_API_KEY)
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'AI proxy error' })
  }
}

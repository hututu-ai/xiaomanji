import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 本地开发用的 AI 中转中间件：
// 让 `npm run dev` 不依赖 `vercel dev` 也能跑通 /api/ai。
// 它复用与 Vercel Serverless 完全相同的转发逻辑（api/_dashscope.js）。
function devAiProxy(env) {
  return {
    name: 'dev-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          try {
            const { callDashScope } = await import('./api/_dashscope.js')
            const payload = JSON.parse(body || '{}')
            const apiKey = env.AI_API_KEY || env.DASHSCOPE_API_KEY
            const data = await callDashScope(payload, apiKey)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          } catch (err) {
            res.statusCode = err.status || 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'AI proxy error' }))
          }
        })
      })

      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          try {
            const { createXiaomanSpeech } = await import('./api/_openaiTts.js')
            const payload = JSON.parse(body || '{}')
            const result = await createXiaomanSpeech(payload, env.OPENAI_API_KEY, {
              voice: env.OPENAI_TTS_VOICE,
              model: env.OPENAI_TTS_MODEL,
            })
            res.statusCode = 200
            res.setHeader('Content-Type', result.contentType)
            res.setHeader('Cache-Control', 'private, max-age=86400')
            res.end(Buffer.from(result.audio))
          } catch (err) {
            res.statusCode = err.status || 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'TTS proxy error' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // 第三个参数 '' 表示加载所有变量（包括没有 VITE_ 前缀的 DASHSCOPE_API_KEY）
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devAiProxy(env)],
    server: { host: true, port: 5173 },
  }
})

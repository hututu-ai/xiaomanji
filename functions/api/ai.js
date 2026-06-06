// Cloudflare Pages Function —— 路由 /api/ai
// 把前端请求转发给 aiping.cn（OpenAI 兼容），API Key 留在服务端环境变量，不进前端包。
// 部署后需在 Cloudflare Pages → Settings → Environment variables 里设置 AI_API_KEY。
const ENDPOINT = 'https://aiping.cn/api/v1/chat/completions'

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  const apiKey = env.AI_API_KEY
  if (!apiKey) {
    return json({ error: '缺少 AI_API_KEY（请在 Cloudflare Pages 环境变量里设置）' }, 500)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400)
  }
  const { model, messages, temperature = 0.8, max_tokens = 1024 } = payload || {}
  if (!model || !Array.isArray(messages)) {
    return json({ error: '请求体需要 { model, messages }' }, 400)
  }

  let resp
  try {
    resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      // enable_thinking:false —— 关掉千问3.7思考链，更快更稳，避免空返回
      body: JSON.stringify({ model, messages, temperature, max_tokens, enable_thinking: false }),
    })
  } catch (e) {
    return json({ error: '上游请求失败：' + (e?.message || e) }, 502)
  }

  const text = await resp.text()
  if (!resp.ok) return json({ error: `上游 ${resp.status}: ${text.slice(0, 300)}` }, resp.status)

  let data
  try {
    data = JSON.parse(text)
  } catch {
    return json({ error: '上游返回不是合法 JSON' }, 502)
  }
  const content = data?.choices?.[0]?.message?.content ?? ''
  return json({ content: typeof content === 'string' ? content.trim() : content })
}

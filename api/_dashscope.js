// ─────────────────────────────────────────────────────────────────────────────
//  DashScope（阿里云百炼 / 通义千问）转发核心
// ─────────────────────────────────────────────────────────────────────────────
//  用的是哪家模型：
//    阿里云通义千问 Qwen-VL（多模态看图）+ Qwen-Plus（文字生成）。
//    走 DashScope 的「OpenAI 兼容模式」，请求/返回格式与 OpenAI Chat Completions 一致。
//
//  请求格式（前端 src/services/ai.js 把 { model, messages } POST 到 /api/ai）：
//    {
//      "model": "qwen-vl-max" | "qwen-plus",
//      "messages": [{ "role": "...", "content": ... }],
//      "temperature": 0.x
//    }
//    多模态 messages 的 content 是数组：
//      [{ type:"text", text:"..." },
//       { type:"image_url", image_url:{ url:"data:image/jpeg;base64,..." } }]
//
//  如何替换成别家模型：
//    只改下面的 ENDPOINT 和 model 名（前端 ai.js 里的 VISION_MODEL / TEXT_MODEL），
//    其余代码不用动——因为大家都兼容 OpenAI 的 Chat Completions 协议。
//      · OpenAI:  https://api.openai.com/v1/chat/completions      model: gpt-4o
//      · 智谱:    https://open.bigmodel.cn/api/paas/v4/chat/completions  model: glm-4v
//
//  Key 从服务器端环境变量 DASHSCOPE_API_KEY 读取，永远不进前端包。
// ─────────────────────────────────────────────────────────────────────────────

// aiping.cn 聚合网关（OpenAI 兼容）。换别家只改这一行 + ai.js 里的模型名。
const ENDPOINT = 'https://aiping.cn/api/v1/chat/completions'

export async function callDashScope(payload, apiKey) {
  if (!apiKey) {
    const e = new Error(
      '缺少 AI_API_KEY。请在 .env（本地）或 Vercel 环境变量里填入 API Key。'
    )
    e.status = 500
    throw e
  }

  const { model, messages, temperature = 0.8, max_tokens = 512 } = payload || {}
  if (!model || !Array.isArray(messages)) {
    const e = new Error('请求体不合法：需要 { model, messages }。')
    e.status = 400
    throw e
  }

  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // enable_thinking:false —— 关掉千问3.7的思考链：更快、输出稳定（思考会吃光 token 导致空返回）
    body: JSON.stringify({ model, messages, temperature, max_tokens, enable_thinking: false }),
  })

  const text = await resp.text()
  if (!resp.ok) {
    const e = new Error(`DashScope ${resp.status}: ${text.slice(0, 300)}`)
    e.status = resp.status
    throw e
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    const e = new Error('DashScope 返回的不是合法 JSON。')
    e.status = 502
    throw e
  }

  const content = data?.choices?.[0]?.message?.content ?? ''
  // 统一回传一个精简结构，前端只取 content
  return { content: typeof content === 'string' ? content.trim() : content }
}

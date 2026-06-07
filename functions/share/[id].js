import { html, json, handleThrown } from '../_shared/http.js'
import { db, safeJson } from '../_shared/db.js'

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function onRequest(context) {
  try {
    const { params, request, env } = context
    if (request.method !== 'GET') return json({ error: 'Method Not Allowed' }, 405)
    const id = params.id
    const database = db(env)
    const row = await database
      .prepare('SELECT image_key AS imageKey, meta_json AS metaJson FROM shares WHERE id = ?')
      .bind(id)
      .first()
    if (!row) return html('<!doctype html><meta charset="utf-8"><title>小满集</title><p>这张诗笺没有找到。</p>', 404)

    const meta = safeJson(row.metaJson, {})
    const origin = new URL(request.url).origin
    const imageUrl = `${origin}/api/media?key=${encodeURIComponent(row.imageKey)}`
    const title = esc(meta.title || '小满集 · 一拍一首诗')
    const desc = esc(meta.themeText ? `我在小满集收下一张诗笺：${meta.themeText}` : '把转瞬即逝的感受，珍藏成笺。')

    return html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:type" content="article" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(160deg,#dcefe8,#fafafa 48%,#fbe3e7); font-family: serif; color: #3a3a34; }
      main { width: min(92vw, 420px); padding: 22px 0 32px; text-align: center; }
      img { width: 100%; border-radius: 18px; box-shadow: 0 18px 50px rgba(58,58,52,.18); background: #fafafa; }
      a { display: inline-flex; margin-top: 18px; padding: 12px 24px; border-radius: 999px; color: #fff; background: #46a98f; text-decoration: none; letter-spacing: .08em; }
    </style>
  </head>
  <body>
    <main>
      <img src="${imageUrl}" alt="小满集诗笺" />
      <a href="/">也去找一句诗</a>
    </main>
  </body>
</html>`)
  } catch (err) {
    return handleThrown(err)
  }
}

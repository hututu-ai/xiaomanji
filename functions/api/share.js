import { json, readJson, handleThrown } from '../_shared/http.js'
import { getClientId, newClientId, userCookie } from '../_shared/identity.js'
import { db, ensureUser } from '../_shared/db.js'
import { putMediaDataUrl } from '../_shared/media.js'

export async function onRequest(context) {
  try {
    const { request, env } = context
    if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

    const userId = getClientId(request) || newClientId()
    const database = db(env)
    const bucket = env.XMJ_MEDIA || null
    await ensureUser(database, userId)

    const body = await readJson(request)
    const id = crypto.randomUUID()
    const stored = await putMediaDataUrl({
      database,
      bucket,
      dataUrl: body.imageDataUrl,
      keyPrefix: `users/${userId}/shares`,
      id,
      userId,
      meta: { kind: 'share' },
    })
    if (!stored?.key) return json({ error: '分享图片格式不正确' }, 400)

    const now = Date.now()
    const meta = {
      title: body.title || '小满集',
      themeText: body.themeText || '',
      poem: body.poem || null,
    }
    await database
      .prepare(`
        INSERT INTO shares (id, user_id, jian_id, image_key, created_at, expires_at, meta_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(id, userId, body.jianId || '', stored.key, now, null, JSON.stringify(meta))
      .run()

    const url = new URL(request.url)
    const shareUrl = `${url.origin}/share/${id}`
    return json({ ok: true, id, url: shareUrl, imageUrl: `/api/media?key=${encodeURIComponent(stored.key)}` }, 200, {
      'Set-Cookie': userCookie(userId),
    })
  } catch (err) {
    return handleThrown(err)
  }
}

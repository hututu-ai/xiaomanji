import { handleThrown, json, requireBinding } from '../_shared/http.js'

export async function onRequest(context) {
  try {
    const { request, env } = context
    if (request.method !== 'GET') return json({ error: 'Method Not Allowed' }, 405)
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key || key.includes('..')) return json({ error: '缺少 media key' }, 400)

    const bucket = requireBinding(env, 'XMJ_MEDIA')
    const obj = await bucket.get(key)
    if (!obj) return json({ error: 'Not Found' }, 404)

    const headers = new Headers()
    obj.writeHttpMetadata(headers)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  } catch (err) {
    return handleThrown(err)
  }
}


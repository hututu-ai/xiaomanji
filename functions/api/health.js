import { json } from '../_shared/http.js'

export async function onRequest({ env }) {
  return json({
    ok: true,
    bindings: {
      db: !!env.XMJ_DB,
      media: !!env.XMJ_MEDIA,
      d1MediaFallback: !!env.XMJ_DB && !env.XMJ_MEDIA,
      ai: !!env.AI_API_KEY,
    },
    time: new Date().toISOString(),
  })
}

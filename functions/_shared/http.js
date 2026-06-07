export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

export function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

export function methodNotAllowed() {
  return json({ error: 'Method Not Allowed' }, 405)
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new Response(JSON.stringify({ error: '请求体不是合法 JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
}

export function requireBinding(env, name) {
  if (!env?.[name]) {
    throw new Response(JSON.stringify({
      error: `缺少 Cloudflare 绑定 ${name}`,
      hint: name === 'XMJ_DB'
        ? '请创建 D1 数据库并绑定为 XMJ_DB，然后执行 migrations/0001_backend.sql。'
        : '请创建 R2 bucket 并绑定为 XMJ_MEDIA。',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  return env[name]
}

export async function handleThrown(err) {
  if (err instanceof Response) return err
  console.error(err)
  return json({ error: err?.message || 'Server Error' }, 500)
}


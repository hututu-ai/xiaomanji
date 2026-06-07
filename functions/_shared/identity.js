const CLIENT_ID_RE = /^[a-zA-Z0-9_-]{12,80}$/

export function getClientId(request) {
  const explicit = request.headers.get('x-xmj-user-id') || ''
  if (CLIENT_ID_RE.test(explicit)) return explicit

  const cookie = request.headers.get('cookie') || ''
  const found = cookie.match(/(?:^|;\s*)xmj_uid=([^;]+)/)
  if (found && CLIENT_ID_RE.test(decodeURIComponent(found[1]))) {
    return decodeURIComponent(found[1])
  }

  return null
}

export function newClientId() {
  return crypto.randomUUID()
}

export function userCookie(userId) {
  return `xmj_uid=${encodeURIComponent(userId)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
}


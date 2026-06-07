import { requireBinding } from './http.js'

export function db(env) {
  return requireBinding(env, 'XMJ_DB')
}

export async function ensureUser(database, userId) {
  const now = Date.now()
  await database
    .prepare(`
      INSERT INTO users (id, created_at, last_seen_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at
    `)
    .bind(userId, now, now)
    .run()
}

export function dayKeyFromTs(ts = Date.now()) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function safeJson(value, fallback = null) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}


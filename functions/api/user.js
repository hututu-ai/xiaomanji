import { json, handleThrown } from '../_shared/http.js'
import { getClientId, newClientId, userCookie } from '../_shared/identity.js'
import { db, ensureUser } from '../_shared/db.js'

export async function onRequest(context) {
  try {
    const { request, env } = context
    if (!['GET', 'POST'].includes(request.method)) {
      return json({ error: 'Method Not Allowed' }, 405)
    }
    const userId = getClientId(request) || newClientId()
    const database = db(env)
    await ensureUser(database, userId)
    return json({ userId }, 200, { 'Set-Cookie': userCookie(userId) })
  } catch (err) {
    return handleThrown(err)
  }
}


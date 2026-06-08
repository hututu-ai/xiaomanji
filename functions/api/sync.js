import { json, readJson, handleThrown } from '../_shared/http.js'
import { getClientId, newClientId, userCookie } from '../_shared/identity.js'
import { db, ensureUser, dayKeyFromTs, safeJson } from '../_shared/db.js'
import { mediaUrl, putMediaDataUrl } from '../_shared/media.js'

const SIGN_RANK = {
  removed: 0,
  missed: 1,
  pending: 2,
  makeup_pending: 3,
  done: 4,
  makeup_done: 5,
}

function signRank(status) {
  return SIGN_RANK[status] ?? 0
}

function targetDayKeyFromJian(jian, createdAt) {
  const makeupForDay = typeof jian.makeupForDay === 'string' ? jian.makeupForDay : ''
  return jian.signDayKey || jian.dayKey || makeupForDay || dayKeyFromTs(createdAt)
}

function normalizeJianForDb(jian, imageKey = '') {
  const createdAt = Number(jian.createdAt || Date.now())
  const completedDayKey = dayKeyFromTs(createdAt)
  const targetDayKey = targetDayKeyFromJian(jian, createdAt)
  const isMakeup = !!jian.makeupForDay || targetDayKey !== completedDayKey
  const cloud = {
    ...jian,
    createdAt,
    dayKey: targetDayKey,
    signDayKey: targetDayKey,
    makeupForDay: isMakeup ? targetDayKey : null,
    image: imageKey ? mediaUrl(imageKey) : jian.image,
    imageKey: imageKey || jian.imageKey || '',
  }
  return {
    id: String(jian.id || crypto.randomUUID()),
    createdAt,
    dayKey: targetDayKey,
    themeId: jian.themeId || '',
    poemId: jian.poem?.id || '',
    poet: jian.poem?.author || '',
    title: jian.poem?.title || '',
    imageKey: cloud.imageKey,
    cardJson: JSON.stringify(cloud),
    cloud,
  }
}

async function listAll(database, userId) {
  const [jianRows, signRows, rewardRows, makeupRows] = await Promise.all([
    database
      .prepare(`
        SELECT card_json FROM jian
        WHERE user_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
      `)
      .bind(userId)
      .all(),
    database
      .prepare(`
        SELECT id, day_key AS dayKey, status, theme_id AS themeId, jian_id AS jianId,
               accepted_at AS acceptedAt, completed_at AS completedAt, makeup_at AS makeupAt,
               updated_at AS updatedAt
        FROM sign_ledger
        WHERE user_id = ?
        ORDER BY day_key DESC
      `)
      .bind(userId)
      .all(),
    database
      .prepare(`
        SELECT id, reward_key AS rewardKey, reward_type AS rewardType, title,
               claimed_at AS claimedAt, meta_json AS metaJson
        FROM rewards
        WHERE user_id = ?
        ORDER BY claimed_at DESC
      `)
      .bind(userId)
      .all(),
    database
      .prepare(`
        SELECT id, token_key AS tokenKey, source, day_key AS dayKey, status,
               issued_at AS issuedAt, used_at AS usedAt, expires_at AS expiresAt,
               meta_json AS metaJson
        FROM makeup_tokens
        WHERE user_id = ?
        ORDER BY issued_at DESC
      `)
      .bind(userId)
      .all(),
  ])

  return {
    jian: (jianRows.results || []).map((row) => safeJson(row.card_json)).filter(Boolean),
    signs: signRows.results || [],
    rewards: (rewardRows.results || []).map((row) => ({
      ...row,
      meta: safeJson(row.metaJson, {}),
      metaJson: undefined,
    })),
    makeupTokens: (makeupRows.results || []).map((row) => ({
      ...row,
      meta: safeJson(row.metaJson, {}),
      metaJson: undefined,
    })),
  }
}

async function upsertJian({ database, bucket, userId, payload }) {
  const input = payload?.jian || payload
  if (!input || typeof input !== 'object') throw new Error('缺少 jian')

  let imageKey = input.imageKey || ''
  if (bucket && typeof input.image === 'string' && input.image.startsWith('data:')) {
    const stored = await putMediaDataUrl({
      database,
      bucket,
      dataUrl: input.image,
      keyPrefix: `users/${userId}/jian`,
      id: input.id || crypto.randomUUID(),
      userId,
      meta: { kind: 'jian' },
    })
    imageKey = stored?.key || imageKey
  } else if (!bucket && typeof input.image === 'string' && input.image.startsWith('data:')) {
    const stored = await putMediaDataUrl({
      database,
      bucket: null,
      dataUrl: input.image,
      keyPrefix: `users/${userId}/jian`,
      id: input.id || crypto.randomUUID(),
      userId,
      meta: { kind: 'jian' },
    })
    imageKey = stored?.key || imageKey
  }

  const rec = normalizeJianForDb(input, imageKey)
  const now = Date.now()
  await database
    .prepare(`
      INSERT INTO jian
        (id, user_id, created_at, updated_at, day_key, theme_id, poem_id, poet, title, image_key, card_json, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(id) DO UPDATE SET
        updated_at = excluded.updated_at,
        day_key = excluded.day_key,
        theme_id = excluded.theme_id,
        poem_id = excluded.poem_id,
        poet = excluded.poet,
        title = excluded.title,
        image_key = excluded.image_key,
        card_json = excluded.card_json,
        deleted_at = NULL
    `)
    .bind(rec.id, userId, rec.createdAt, now, rec.dayKey, rec.themeId, rec.poemId, rec.poet, rec.title, rec.imageKey, rec.cardJson)
    .run()

  await database
    .prepare(`
      INSERT INTO sign_ledger
        (id, user_id, day_key, status, theme_id, jian_id, accepted_at, completed_at, makeup_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, day_key) DO UPDATE SET
        status = excluded.status,
        theme_id = COALESCE(excluded.theme_id, sign_ledger.theme_id),
        jian_id = excluded.jian_id,
        completed_at = excluded.completed_at,
        makeup_at = excluded.makeup_at,
        updated_at = excluded.updated_at
    `)
    .bind(
      `${userId}:${rec.dayKey}`,
      userId,
      rec.dayKey,
      rec.cloud.makeupForDay ? 'makeup_done' : 'done',
      rec.themeId,
      rec.id,
      input.acceptedAt || rec.createdAt,
      rec.createdAt,
      rec.cloud.makeupForDay ? now : null,
      now
    )
    .run()

  return rec.cloud
}

async function deleteJian(database, userId, id) {
  if (!id) throw new Error('缺少 id')
  const now = Date.now()
  const existing = await database
    .prepare('SELECT day_key AS dayKey FROM jian WHERE user_id = ? AND id = ? AND deleted_at IS NULL')
    .bind(userId, id)
    .first()
  await database
    .prepare('UPDATE jian SET deleted_at = ?, updated_at = ? WHERE user_id = ? AND id = ?')
    .bind(now, now, userId, id)
    .run()
  if (existing?.dayKey) {
    const remaining = await database
      .prepare('SELECT COUNT(*) AS count FROM jian WHERE user_id = ? AND day_key = ? AND deleted_at IS NULL')
      .bind(userId, existing.dayKey)
      .first()
    if (!Number(remaining?.count || 0)) {
      await database
        .prepare('UPDATE sign_ledger SET status = ?, jian_id = ?, updated_at = ? WHERE user_id = ? AND day_key = ?')
        .bind('removed', '', now, userId, existing.dayKey)
        .run()
    }
  }
  return { id, deleted: true }
}

async function upsertSign(database, userId, sign) {
  if (!sign?.dayKey) throw new Error('缺少 dayKey')
  const now = Date.now()
  const nextStatus = sign.status || 'pending'
  const existing = await database
    .prepare('SELECT status FROM sign_ledger WHERE user_id = ? AND day_key = ?')
    .bind(userId, sign.dayKey)
    .first()
  if (existing?.status && signRank(existing.status) > signRank(nextStatus)) {
    return { ...sign, status: existing.status, updatedAt: now, ignored: true }
  }
  await database
    .prepare(`
      INSERT INTO sign_ledger
        (id, user_id, day_key, status, theme_id, jian_id, accepted_at, completed_at, makeup_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, day_key) DO UPDATE SET
        status = excluded.status,
        theme_id = excluded.theme_id,
        jian_id = excluded.jian_id,
        accepted_at = COALESCE(excluded.accepted_at, sign_ledger.accepted_at),
        completed_at = excluded.completed_at,
        makeup_at = excluded.makeup_at,
        updated_at = excluded.updated_at
    `)
    .bind(
      sign.id || `${userId}:${sign.dayKey}`,
      userId,
      sign.dayKey,
      nextStatus,
      sign.themeId || '',
      sign.jianId || '',
      sign.acceptedAt || null,
      sign.completedAt || null,
      sign.makeupAt || null,
      now
    )
    .run()
  return { ...sign, updatedAt: now }
}

async function upsertMakeupToken(database, userId, token) {
  if (!token || typeof token !== 'object') throw new Error('缺少 token')
  const now = Date.now()
  const id = token.id || crypto.randomUUID()
  const tokenKey = token.tokenKey || id
  const status = token.status || 'available'
  await database
    .prepare(`
      INSERT INTO makeup_tokens
        (id, user_id, token_key, source, day_key, status, issued_at, used_at, expires_at, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, token_key) DO UPDATE SET
        source = excluded.source,
        day_key = excluded.day_key,
        status = excluded.status,
        used_at = excluded.used_at,
        expires_at = excluded.expires_at,
        meta_json = excluded.meta_json
    `)
    .bind(
      id,
      userId,
      tokenKey,
      token.source || 'reward',
      token.dayKey || '',
      status,
      token.issuedAt || now,
      token.usedAt || null,
      token.expiresAt || null,
      JSON.stringify(token.meta || {})
    )
    .run()
  return { id, tokenKey, source: token.source || 'reward', dayKey: token.dayKey || '', status, issuedAt: token.issuedAt || now, usedAt: token.usedAt || null, expiresAt: token.expiresAt || null, meta: token.meta || {} }
}

async function useMakeupToken(database, userId, payload) {
  const tokenKey = payload?.tokenKey
  const targetDayKey = payload?.dayKey
  if (!tokenKey || !targetDayKey) throw new Error('缺少 tokenKey/dayKey')
  const now = Date.now()
  const token = await database
    .prepare(`
      SELECT id, token_key AS tokenKey, expires_at AS expiresAt
      FROM makeup_tokens
      WHERE user_id = ? AND token_key = ? AND status = 'available'
    `)
    .bind(userId, tokenKey)
    .first()
  if (!token) throw new Error('补签券不可用')
  if (token.expiresAt && Number(token.expiresAt) < now) throw new Error('补签券已过期')

  await database
    .prepare('UPDATE makeup_tokens SET status = ?, day_key = ?, used_at = ? WHERE user_id = ? AND token_key = ?')
    .bind('used', targetDayKey, now, userId, tokenKey)
    .run()
  await upsertSign(database, userId, {
    dayKey: targetDayKey,
    status: 'makeup_pending',
    makeupAt: now,
  })
  return { tokenKey, dayKey: targetDayKey, status: 'used', usedAt: now }
}

async function claimReward(database, userId, reward) {
  if (!reward?.rewardKey || !reward?.title) throw new Error('缺少 rewardKey/title')
  const id = reward.id || crypto.randomUUID()
  const claimedAt = reward.claimedAt || Date.now()
  await database
    .prepare(`
      INSERT INTO rewards (id, user_id, reward_key, reward_type, title, claimed_at, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, reward_key) DO UPDATE SET meta_json = excluded.meta_json
    `)
    .bind(id, userId, reward.rewardKey, reward.rewardType || 'badge', reward.title, claimedAt, JSON.stringify(reward.meta || {}))
    .run()
  return { id, ...reward, claimedAt }
}

export async function onRequest(context) {
  try {
    const { request, env } = context
    if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method Not Allowed' }, 405)

    const userId = getClientId(request) || newClientId()
    const database = db(env)
    await ensureUser(database, userId)

    if (request.method === 'GET') {
      const data = await listAll(database, userId)
      return json({ userId, ...data }, 200, { 'Set-Cookie': userCookie(userId) })
    }

    const body = await readJson(request)
    const action = body?.action
    let result
    if (action === 'upsertJian') {
      result = await upsertJian({ database, bucket: env.XMJ_MEDIA, userId, payload: body.payload })
    } else if (action === 'deleteJian') {
      result = await deleteJian(database, userId, body.payload?.id)
    } else if (action === 'upsertSign') {
      result = await upsertSign(database, userId, body.payload?.sign || body.payload)
    } else if (action === 'claimReward') {
      result = await claimReward(database, userId, body.payload?.reward || body.payload)
    } else if (action === 'upsertMakeupToken') {
      result = await upsertMakeupToken(database, userId, body.payload?.token || body.payload)
    } else if (action === 'useMakeupToken') {
      result = await useMakeupToken(database, userId, body.payload)
    } else {
      return json({ error: '未知 action' }, 400)
    }

    return json({ ok: true, userId, result }, 200, { 'Set-Cookie': userCookie(userId) })
  } catch (err) {
    return handleThrown(err)
  }
}

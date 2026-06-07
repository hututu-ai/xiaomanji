import { getJian, getMakeupTokens, getRewards, getSignLedger, mergeCloudState } from './storage.js'

const K_CLIENT_ID = 'xmj_client_id_v1'

function canUseStorage() {
  return typeof localStorage !== 'undefined'
}

export function getClientId() {
  if (!canUseStorage()) return ''
  let id = localStorage.getItem(K_CLIENT_ID)
  if (!id) {
    id = crypto?.randomUUID ? crypto.randomUUID() : `xmj_${Date.now()}_${Math.random().toString(16).slice(2)}`
    localStorage.setItem(K_CLIENT_ID, id)
  }
  return id
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function api(path, options = {}) {
  const resp = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-xmj-user-id': getClientId(),
      ...(options.headers || {}),
    },
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.error || `请求失败 ${resp.status}`)
  if (data?.userId && canUseStorage()) localStorage.setItem(K_CLIENT_ID, data.userId)
  return data
}

export async function bootstrapBackendSync() {
  try {
    const data = await api('/api/sync', { method: 'GET' })
    mergeCloudState(data)
    void pushLocalUserStateToCloud()
    return data
  } catch (e) {
    console.warn('云端同步暂不可用，已使用本地数据', e)
    return null
  }
}

export async function pushLocalUserStateToCloud() {
  const userJian = getJian().filter((it) => {
    if (!it?.id) return false
    if (typeof it.image === 'string' && it.image.startsWith('/samples/')) return false
    return true
  })
  const signs = getSignLedger()
  const rewards = getRewards()
  const makeupTokens = getMakeupTokens()
  for (const jian of userJian) await syncJianToCloud(jian)
  for (const sign of signs) await syncSignToCloud(sign)
  for (const reward of rewards) await claimRewardInCloud(reward)
  for (const token of makeupTokens) await syncMakeupTokenToCloud(token)
}

export async function syncJianToCloud(jian) {
  try {
    const data = await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'upsertJian', payload: { jian } }),
    })
    if (data?.result) mergeCloudState({ jian: [data.result] })
    return data?.result || null
  } catch (e) {
    console.warn('诗笺云端保存失败，已保存在本机', e)
    return null
  }
}

export async function deleteJianFromCloud(id) {
  try {
    return await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteJian', payload: { id } }),
    })
  } catch (e) {
    console.warn('诗笺云端删除失败，本机已删除', e)
    return null
  }
}

export async function syncSignToCloud(sign) {
  try {
    return await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'upsertSign', payload: { sign } }),
    })
  } catch (e) {
    console.warn('签账本云端同步失败，已保存在本机', e)
    return null
  }
}

export async function claimRewardInCloud(reward) {
  try {
    return await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'claimReward', payload: { reward } }),
    })
  } catch (e) {
    console.warn('奖励云端同步失败，已保存在本机', e)
    return null
  }
}

export async function syncMakeupTokenToCloud(token) {
  try {
    return await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'upsertMakeupToken', payload: { token } }),
    })
  } catch (e) {
    console.warn('补签券云端同步失败，已保存在本机', e)
    return null
  }
}

export async function useMakeupTokenInCloud(dayKey, tokenKey) {
  try {
    return await api('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'useMakeupToken', payload: { dayKey, tokenKey } }),
    })
  } catch (e) {
    console.warn('补签券云端核销失败，已保存在本机', e)
    return null
  }
}

export async function saveShareBlob(blob, meta = {}) {
  try {
    const imageDataUrl = await blobToDataUrl(blob)
    const data = await api('/api/share', {
      method: 'POST',
      body: JSON.stringify({ ...meta, imageDataUrl }),
    })
    return data
  } catch (e) {
    console.warn('分享页保存失败，继续使用本地图片分享', e)
    return null
  }
}

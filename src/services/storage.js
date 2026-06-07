// ─────────────────────────────────────────────────────────────────────────────
//  本地持久化（localStorage）。三处数据：诗笺夹条目 / 今日未完成签 / 派生统计。
//  未来换后端只需替换这些函数实现，接口不变。
// ─────────────────────────────────────────────────────────────────────────────
import imageCompression from 'browser-image-compression'
import { poetRelation } from '../data/poetRelation.js'
import { SEED_JIAN, SEED_VERSION } from '../data/seedJian.js'

const K_JIAN = 'xmj_jian_v1' // 诗笺夹：已完成任务的卡面与版式配方
const K_TODAY = 'xmj_today_sign_v1' // 今日签：当天未完成才保留，过日作废
const K_SIGN_LEDGER = 'xmj_sign_ledger_v1' // 签账本：pending/done/missed/makeup_done
const K_REWARDS = 'xmj_rewards_v1' // 满签奖励、限定章印、行囊物件
const K_MAKEUP_TOKENS = 'xmj_makeup_tokens_v1' // 补签券：available/used/expired
const K_SEED_VER = 'xmj_seed_ver_v1' // 种子注入版本号（增量：版本升级时补入新种子）

function notifyStorageChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('xmj-storage-updated'))
}

function read(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
function readObj(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null')
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch {
    return null
  }
}
function write(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
    notifyStorageChanged()
    return true
  } catch (e) {
    console.error('保存失败（可能容量已满）', e)
    return false
  }
}
function writeObj(key, value) {
  try {
    if (!value) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
    notifyStorageChanged()
    return true
  } catch (e) {
    console.error('保存失败（可能容量已满）', e)
    return false
  }
}
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2)

export function dayKey(date = new Date()) {
  const d = date
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function dayKeyFromJian(jian) {
  return jian?.signDayKey || jian?.dayKey || dayKey(new Date(jian?.createdAt || Date.now()))
}

function mergeByKey(localList, remoteList, keyOf) {
  const byId = new Map()
  for (const item of localList || []) {
    const key = keyOf(item)
    if (key) byId.set(key, item)
  }
  for (const item of remoteList || []) {
    const key = keyOf(item)
    if (!key) continue
    const old = byId.get(key)
    byId.set(key, { ...old, ...item })
  }
  return [...byId.values()]
}

// 首次打开 → 填入示例诗笺。版本升级时 → 种子条目完全重建（增/删/改都生效），用户自创诗笺不动。
export function maybeSeedJian() {
  try {
    const storedVer = parseInt(localStorage.getItem(K_SEED_VER) || '0', 10)
    if (storedVer >= SEED_VERSION) return

    const existing = read(K_JIAN)

    // 分离：种子条目（/samples/ 路径） vs 用户自创诗笺（dataURL 或其他路径）
    const userItems = []
    const oldSeedById = new Map() // image → old entry (保留用户改过的跋)
    for (const it of existing) {
      if (it.image && it.image.startsWith('/samples/')) {
        if (!oldSeedById.has(it.image)) oldSeedById.set(it.image, it)
      } else {
        userItems.push(it)
      }
    }

    // 完全从 SEED_JIAN 重建种子条目，保留用户写过的跋
    const rebuiltSeeds = SEED_JIAN.map((seed) => {
      const old = oldSeedById.get(seed.image)
      return {
        id: old?.id || uid(),
        createdAt: old?.createdAt || seed.createdAt,
        postscript: old?.postscript || seed.postscript || '',
        ...seed,
      }
    })

    const list = [...rebuiltSeeds, ...userItems]
    write(K_JIAN, list)
    localStorage.setItem(K_SEED_VER, String(SEED_VERSION))
  } catch (e) {
    console.warn('示例诗笺注入失败', e)
  }
}

// ——— 诗笺夹（照片嵌在明信片/票券/书笺里）———
export function getJian() {
  return read(K_JIAN).sort((a, b) => b.createdAt - a.createdAt)
}
export function addJian(rec) {
  const list = read(K_JIAN)
  const createdAt = Date.now()
  const completedDayKey = dayKey(new Date(createdAt))
  const targetDayKey = rec.signDayKey || rec.makeupForDay || completedDayKey
  const isMakeup = !!rec.makeupForDay || targetDayKey !== completedDayKey
  const full = {
    id: uid(),
    createdAt,
    dayKey: targetDayKey,
    signDayKey: targetDayKey,
    makeupForDay: isMakeup ? targetDayKey : null,
    ...rec,
  }
  list.unshift(full)
  write(K_JIAN, list)
  upsertSignLocal({
    dayKey: targetDayKey,
    status: isMakeup ? 'makeup_done' : 'done',
    themeId: rec.themeId || '',
    jianId: full.id,
    acceptedAt: rec.acceptedAt || full.createdAt,
    completedAt: full.createdAt,
    makeupAt: isMakeup ? Date.now() : null,
  })
  return full
}
export function deleteJian(id) {
  const list = read(K_JIAN)
  const removed = list.find((j) => j.id === id)
  write(K_JIAN, list.filter((j) => j.id !== id))
  if (removed) {
    const removedDay = dayKeyFromJian(removed)
    const hasOtherForDay = read(K_JIAN).some((j) => j.id !== id && dayKeyFromJian(j) === removedDay)
    if (!hasOtherForDay) {
      upsertSignLocal({
        dayKey: removedDay,
        status: 'removed',
        jianId: '',
        removedAt: Date.now(),
      })
    }
  }
  return getJian()
}

// ——— 今日签（当天未完成签；过日作废，不补签）———
export function getTodaySign(date = new Date()) {
  const rec = readObj(K_TODAY)
  if (!rec) return null
  if (rec.dayKey !== dayKey(date)) {
    upsertSignLocal({
      ...rec,
      status: 'missed',
      missedAt: Date.now(),
    })
    writeObj(K_TODAY, null)
    return null
  }
  return rec
}
export function setTodaySign(theme, date = new Date()) {
  const dk = dayKey(date)
  const rec = {
    id: uid(),
    themeId: theme.id,
    text: theme.text,
    hint: theme.hint,
    type: theme.type,
    accent: theme.accent,
    dayKey: dk,
    acceptedAt: Date.now(),
  }
  writeObj(K_TODAY, rec)
  upsertSignLocal({
    id: rec.id,
    dayKey: dk,
    status: 'pending',
    themeId: theme.id,
    acceptedAt: rec.acceptedAt,
  })
  return rec
}
export function clearTodaySign() {
  writeObj(K_TODAY, null)
}

// ——— 签账本 / 满签奖励 ———
export function getSignLedger() {
  return read(K_SIGN_LEDGER).sort((a, b) => String(b.dayKey).localeCompare(String(a.dayKey)))
}
export function upsertSignLocal(sign) {
  if (!sign?.dayKey) return null
  const list = read(K_SIGN_LEDGER)
  const idx = list.findIndex((it) => it.dayKey === sign.dayKey)
  const full = {
    id: sign.id || list[idx]?.id || uid(),
    updatedAt: Date.now(),
    ...(idx >= 0 ? list[idx] : {}),
    ...sign,
  }
  if (idx >= 0) list[idx] = full
  else list.unshift(full)
  write(K_SIGN_LEDGER, list)
  return full
}
export function getRewards() {
  return read(K_REWARDS).sort((a, b) => (b.claimedAt || 0) - (a.claimedAt || 0))
}
export function getMakeupTokens() {
  return read(K_MAKEUP_TOKENS).sort((a, b) => (b.issuedAt || 0) - (a.issuedAt || 0))
}
export function getAvailableMakeupTokens(date = new Date()) {
  const now = date.getTime()
  return getMakeupTokens().filter((token) => {
    if (token.status !== 'available') return false
    if (token.expiresAt && token.expiresAt < now) return false
    return true
  })
}
export function mergeMakeupTokens(tokens = []) {
  if (tokens.length) write(K_MAKEUP_TOKENS, mergeByKey(read(K_MAKEUP_TOKENS), tokens, (it) => it.tokenKey || it.id))
}
export function useMakeupTokenLocal(day, tokenKey) {
  if (!day || !tokenKey) return null
  const list = read(K_MAKEUP_TOKENS)
  const idx = list.findIndex((it) => (it.tokenKey || it.id) === tokenKey && it.status === 'available')
  if (idx < 0) return null
  const token = {
    ...list[idx],
    status: 'used',
    usedAt: Date.now(),
    dayKey: day,
  }
  list[idx] = token
  write(K_MAKEUP_TOKENS, list)
  upsertSignLocal({
    dayKey: day,
    status: 'makeup_pending',
    makeupAt: token.usedAt,
  })
  return token
}
export function claimRewardLocal(reward) {
  if (!reward?.rewardKey) return null
  const list = read(K_REWARDS)
  const idx = list.findIndex((it) => it.rewardKey === reward.rewardKey)
  const full = {
    id: reward.id || list[idx]?.id || uid(),
    rewardType: reward.rewardType || 'badge',
    claimedAt: Date.now(),
    ...(idx >= 0 ? list[idx] : {}),
    ...reward,
  }
  if (idx >= 0) list[idx] = full
  else list.unshift(full)
  write(K_REWARDS, list)
  return full
}

// ——— 打卡日历：按完成日期统计 ———
function sameDay(ts, d) {
  const t = new Date(ts)
  return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate()
}
export function countJianOnDate(date = new Date()) {
  const target = dayKey(date)
  return getJian().filter((j) => {
    const hasExplicitDay = !!(j.signDayKey || j.dayKey)
    return hasExplicitDay ? dayKeyFromJian(j) === target : sameDay(j.createdAt, date)
  }).length
}
/** 返回某月每天的盖章信息： { 'YYYY-M-D': {count, accent} } */
export function getMonthStamps(year, month) {
  const map = {}
  const jianCountByDay = {}
  for (const sign of getSignLedger()) {
    if (!['done', 'makeup_done'].includes(sign.status)) continue
    const t = new Date(`${sign.dayKey}T00:00:00`)
    if (t.getFullYear() === year && t.getMonth() === month) {
      const key = `${year}-${month}-${t.getDate()}`
      if (!map[key]) map[key] = { count: 1, accent: '#cba35f', status: sign.status, fromLedger: true }
      map[key].status = sign.status
    }
  }
  for (const j of getJian()) {
    const dk = dayKeyFromJian(j)
    const t = new Date(`${dk}T00:00:00`)
    if (t.getFullYear() === year && t.getMonth() === month) {
      const key = `${year}-${month}-${t.getDate()}`
      jianCountByDay[key] = (jianCountByDay[key] || 0) + 1
      if (!map[key]) {
        map[key] = { count: 1, accent: j.accent?.accent || '#cba35f', status: 'done' }
      } else if (!map[key].jianIds) {
        map[key].accent = j.accent?.accent || map[key].accent
      }
      map[key].jianIds = [...(map[key].jianIds || []), j.id]
      map[key].count = Math.max(map[key].count || 1, jianCountByDay[key])
    }
  }
  return map
}

export function getMonthSignProgress(year, month, now = new Date()) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const targetDays = isFutureMonth ? 0 : isCurrentMonth ? now.getDate() : daysInMonth
  const stamps = getMonthStamps(year, month)
  const doneDays = Object.values(stamps).filter((st) => ['done', 'makeup_done'].includes(st.status || 'done')).length
  const makeupDays = Object.values(stamps).filter((st) => st.status === 'makeup_done').length
  const full = targetDays > 0 && doneDays >= targetDays
  return {
    year,
    month,
    targetDays,
    doneDays,
    makeupDays,
    missingDays: Math.max(0, targetDays - doneDays),
    full,
    rewardKey: `month-full-${year}-${String(month + 1).padStart(2, '0')}`,
    rewardTitle: `${month + 1}月满签章`,
  }
}

export function mergeCloudState({ jian = [], signs = [], rewards = [], makeupTokens = [] } = {}) {
  if (jian.length) write(K_JIAN, mergeByKey(read(K_JIAN), jian, (it) => it.id).sort((a, b) => b.createdAt - a.createdAt))
  if (signs.length) write(K_SIGN_LEDGER, mergeByKey(read(K_SIGN_LEDGER), signs, (it) => it.dayKey || it.id))
  if (rewards.length) write(K_REWARDS, mergeByKey(read(K_REWARDS), rewards, (it) => it.rewardKey || it.id))
  mergeMakeupTokens(makeupTokens)
}

// ——— 集古人（知音录）———
function poetsMetFrom(list) {
  const byAuthor = {}
  for (const j of list) {
    const a = j.poem?.author
    if (!a) continue
    if (!byAuthor[a]) byAuthor[a] = new Set()
    byAuthor[a].add(j.poem.id)
  }
  const counts = {}
  for (const a in byAuthor) counts[a] = byAuthor[a].size
  return poetRelation(counts).sort((x, y) => y.count - x.count)
}
export function getPoetsMet(list = getJian()) {
  return poetsMetFrom(list)
}
export function getJianStats(list = getJian()) {
  const days = new Set(list.map(dayKeyFromJian)).size
  const poets = poetsMetFrom(list)
  return {
    total: list.length,
    days,
    poets,
    poetCount: poets.length,
  }
}

// ——— 时令（节气）———
const TERMS = [
  ['立春', 2, 4], ['雨水', 2, 19], ['惊蛰', 3, 6], ['春分', 3, 21], ['清明', 4, 5], ['谷雨', 4, 20],
  ['立夏', 5, 6], ['小满', 5, 21], ['芒种', 6, 6], ['夏至', 6, 21], ['小暑', 7, 7], ['大暑', 7, 23],
  ['立秋', 8, 8], ['处暑', 8, 23], ['白露', 9, 8], ['秋分', 9, 23], ['寒露', 10, 8], ['霜降', 10, 24],
  ['立冬', 11, 8], ['小雪', 11, 22], ['大雪', 12, 7], ['冬至', 12, 22], ['小寒', 1, 6], ['大寒', 1, 20],
]
/** 给定日期，返回当前节气名（时令） */
export function solarTerm(date = new Date()) {
  const m = date.getMonth() + 1
  const d = date.getDate()
  let cur = '大寒'
  for (const [name, mm, dd] of TERMS) {
    if (m > mm || (m === mm && d >= dd)) cur = name
  }
  return cur
}

// ——— 图片压缩 ———
export async function compressImageToDataURL(file) {
  const c = await imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.82,
  })
  return imageCompression.getDataUrlFromFile(c)
}

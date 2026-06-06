// ─────────────────────────────────────────────────────────────────────────────
//  本地持久化（localStorage）。三处数据：诗笺夹条目 / 今日未完成签 / 派生统计。
//  未来换后端只需替换这些函数实现，接口不变。
// ─────────────────────────────────────────────────────────────────────────────
import imageCompression from 'browser-image-compression'
import { poetRelation } from '../data/poetRelation.js'
import { SEED_JIAN, SEED_VERSION } from '../data/seedJian.js'

const K_JIAN = 'xmj_jian_v1' // 诗笺夹：已完成任务的卡面与版式配方
const K_TODAY = 'xmj_today_sign_v1' // 今日签：当天未完成才保留，过日作废
const K_SEED_VER = 'xmj_seed_ver_v1' // 种子注入版本号（增量：版本升级时补入新种子）

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

function dayKey(date = new Date()) {
  const d = date
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 首次打开（诗笺夹为空且没注入过）→ 填入示例诗笺，让 App 不空着。
// 版本升级时 → 仅补入新种子，已有数据不丢、不重复。
// 用户一旦自己收过/删过，版本也会记录，不会重复注入旧版本种子。
export function maybeSeedJian() {
  try {
    const storedVer = parseInt(localStorage.getItem(K_SEED_VER) || '0', 10)
    if (storedVer >= SEED_VERSION) return

    const existing = read(K_JIAN)
    if (storedVer === 0 && existing.length > 0) {
      // 已经有用户数据 → 标记当前版本，不注入种子
      localStorage.setItem(K_SEED_VER, String(SEED_VERSION))
      return
    }

    // 注入本版本新增的种子（按 image 去重，避免已有诗笺重复注入）
    const existingImages = new Set(existing.map((j) => j.image))
    const newSeeds = SEED_JIAN.filter((s) => !existingImages.has(s.image))
    if (newSeeds.length > 0) {
      const list = [...newSeeds.map((s) => ({ id: uid(), ...s })), ...existing]
      write(K_JIAN, list)
    }
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
  const full = { id: uid(), createdAt: Date.now(), ...rec }
  list.unshift(full)
  write(K_JIAN, list)
  return full
}
export function deleteJian(id) {
  write(K_JIAN, read(K_JIAN).filter((j) => j.id !== id))
  return getJian()
}

// ——— 今日签（当天未完成签；过日作废，不补签）———
export function getTodaySign(date = new Date()) {
  const rec = readObj(K_TODAY)
  if (!rec) return null
  if (rec.dayKey !== dayKey(date)) {
    writeObj(K_TODAY, null)
    return null
  }
  return rec
}
export function setTodaySign(theme, date = new Date()) {
  const rec = {
    id: uid(),
    themeId: theme.id,
    text: theme.text,
    hint: theme.hint,
    type: theme.type,
    accent: theme.accent,
    dayKey: dayKey(date),
    acceptedAt: Date.now(),
  }
  writeObj(K_TODAY, rec)
  return rec
}
export function clearTodaySign() {
  writeObj(K_TODAY, null)
}

// ——— 打卡日历：按完成日期统计 ———
function sameDay(ts, d) {
  const t = new Date(ts)
  return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate()
}
export function countJianOnDate(date = new Date()) {
  return getJian().filter((j) => sameDay(j.createdAt, date)).length
}
/** 返回某月每天的盖章信息： { 'YYYY-M-D': {count, accent} } */
export function getMonthStamps(year, month) {
  const map = {}
  for (const j of getJian()) {
    const t = new Date(j.createdAt)
    if (t.getFullYear() === year && t.getMonth() === month) {
      const key = `${year}-${month}-${t.getDate()}`
      if (!map[key]) map[key] = { count: 0, accent: j.accent?.accent || '#cba35f' }
      map[key].count++
    }
  }
  return map
}

// ——— 集古人（知音录）———
export function getPoetsMet() {
  const byAuthor = {}
  for (const j of getJian()) {
    const a = j.poem?.author
    if (!a) continue
    if (!byAuthor[a]) byAuthor[a] = new Set()
    byAuthor[a].add(j.poem.id)
  }
  const counts = {}
  for (const a in byAuthor) counts[a] = byAuthor[a].size
  return poetRelation(counts).sort((x, y) => y.count - x.count)
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

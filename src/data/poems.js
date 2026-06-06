// 诗库加载 + 候选筛选
// 数据源：诗词分类大全.xlsx → 精选 1101 首很有名、标签全、长度适合诗笺的种子。
// 每首字段：id, mingju(名句/头条), full(全文), title, author, dynasty, form,
//   season, time, scene[], image[], mood[], aura[], theme[], abstract, gist, modern[], headliner
import POEMS from './poems.json'

export { POEMS }

// ——— 15 位优先诗人（游园会 Demo 用）：优先从这些家喻户晓的名字里牵诗 ———
// 唐代 6 位：李白·杜甫·白居易·杜牧·孟浩然·柳宗元
// 宋代 8 位：苏轼·李清照·陆游·辛弃疾·欧阳修·王安石·晏殊·柳永
// 五代 1 位：李煜（千古词帝）
const PRIORITY_POETS = new Set([
  '李白', '杜甫', '白居易', '杜牧', '孟浩然', '柳宗元',
  '苏轼', '李清照', '陆游', '辛弃疾', '欧阳修', '王安石', '晏殊', '柳永',
  '李煜',
])

const byId = new Map(POEMS.map((p) => [p.id, p]))
export function getPoemById(id) {
  return byId.get(id)
}

function overlap(a = [], b = []) {
  if (!a.length || !b.length) return 0
  const set = new Set(b)
  let n = 0
  for (const x of a) if (set.has(x)) n++
  return n
}

/**
 * 按"照片理解 + 寻物令诗锚"给诗库打分，挑出候选池（送给模型复选）。
 * hints: { season, moods[], images[], aura[], abstract } —— 来自 describeImage
 * anchor: 寻物令后台诗锚 { moods[], images[], aura[], seasons[] }
 */
export function getCandidates(hints = {}, anchor = {}, opts = {}) {
  const { limit = 24, exclude = [] } = opts
  const ex = new Set(exclude)
  const wantAbstract = !!hints.abstract

  const scored = []
  for (const p of POEMS) {
    if (ex.has(p.id)) continue
    let s = 0
    s += overlap(hints.moods, p.mood) * 3
    s += overlap(hints.images, p.image) * 2
    s += overlap(hints.aura, p.aura) * 2
    if (hints.season && p.season === hints.season) s += 1
    // 寻物令诗锚（让候选偏向今天这道题该接的诗）
    s += overlap(anchor.moods, p.mood) * 2
    s += overlap(anchor.images, p.image) * 2
    s += overlap(anchor.aura, p.aura) * 1
    if (anchor.seasons && anchor.seasons.includes(p.season)) s += 1
    // 抽象/意识流照片 → 偏向写意朦胧诗
    if (wantAbstract && p.abstract) s += 3
    // 15 位优先诗人大幅加权 —— 游园会现场让观众遇见"我知道！"的名字
    if (PRIORITY_POETS.has(p.author)) s += 5
    if (s > 0) scored.push([s + Math.random() * 0.7, p])
  }
  scored.sort((a, b) => b[0] - a[0])
  let pool = scored.slice(0, limit).map((x) => x[1])
  // 兜底：什么都没匹配上时，给一批抽象友好的写意诗
  if (pool.length < 6) {
    const fallback = POEMS.filter((p) => p.abstract && !ex.has(p.id))
    pool = pool.concat(fallback.slice(0, 12 - pool.length))
  }
  return pool
}

/** 统计用户"遇见"过的诗人（集古人 / 知音录） */
export function poetRelation(authorCounts) {
  // authorCounts: { 作者: 不同诗首数 }
  const tier = (n) =>
    n >= 10 ? '知音' : n >= 6 ? '相知' : n >= 3 ? '相识' : '初遇'
  return Object.entries(authorCounts).map(([author, n]) => ({
    author,
    count: n,
    tier: tier(n),
  }))
}

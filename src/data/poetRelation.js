// 纯函数，不依赖诗库 JSON —— 单独成文件，让 storage.js 不会把 9 万字诗库打进首屏包。
/** 统计用户"遇见"过的诗人（集古人 / 知音录），按相识深浅给档位 */
export function poetRelation(authorCounts) {
  const tier = (n) => (n >= 10 ? '知音' : n >= 6 ? '相知' : n >= 3 ? '相识' : '初遇')
  return Object.entries(authorCounts).map(([author, n]) => ({
    author,
    count: n,
    tier: tier(n),
  }))
}

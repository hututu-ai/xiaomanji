// ─────────────────────────────────────────────────────────────────────────────
//  寻物令 —— 每日邀请
//  两型：找一样东西(object) / 找一个瞬间(moment)
//  台面大白话、接地气、不说教；后台 anchor 是"诗锚"，只用于给匹配筛候选，用户看不见。
// ─────────────────────────────────────────────────────────────────────────────

const A = {
  green: { accent: '#5fa99b', soft: 'rgba(111,179,166,.14)', wash: '#f4faf7', line: 'rgba(111,179,166,.42)' },
  gold: { accent: '#cba35f', soft: 'rgba(217,180,106,.14)', wash: '#fdf8ed', line: 'rgba(217,180,106,.46)' },
  pink: { accent: '#e2929e', soft: 'rgba(231,154,166,.12)', wash: '#fdf4f5', line: 'rgba(231,154,166,.42)' },
  blue: { accent: '#6f9aa8', soft: 'rgba(124,168,181,.14)', wash: '#f2f8fa', line: 'rgba(124,168,181,.42)' },
  fresh: { accent: '#6fb07e', soft: 'rgba(123,191,138,.14)', wash: '#f3faf4', line: 'rgba(123,191,138,.42)' },
}

// 现场版（室内游园会式黑客松就能拍到）—— 主旨：带着发现美的眼光，看见此刻微小的好
export const THEMES = [
  // —— 找一样东西 ——
  { id: 'recha', text: '一杯让你停下来的热饮', hint: '咖啡、茶、热水——停一下，好好看它一眼', type: 'object', accent: A.gold,
    anchor: { images: ['酒'], moods: ['闲适', '温情'] } },
  { id: 'guang', text: '从某处照进来的光', hint: '窗光、灯光、屏幕的光，落在谁身上', type: 'object', accent: A.gold,
    anchor: { images: ['窗', '灯', '月'], aura: ['温暖', '明丽', '空灵'] } },
  { id: 'yongxin', text: '一件有人用心做出来的东西', hint: '别人的作品、摊上的小物，藏着心思', type: 'object', accent: A.fresh,
    anchor: { moods: ['喜悦', '温情'], theme: ['闲居'] } },
  { id: 'jiaoluo', text: '一个被好好布置过的角落', hint: '有人在这儿，用了一点心', type: 'object', accent: A.blue,
    anchor: { moods: ['闲适', '宁静'], theme: ['闲居'] } },
  { id: 'yihangzi', text: '一句被写下来的话', hint: '便利贴、白板、名牌上的字', type: 'object', accent: A.gold,
    anchor: { theme: ['怀古'], moods: ['期待', '感伤'] } },
  { id: 'yanse', text: '一抹让你眼前一亮的颜色', hint: '一点红、一片绿、一道金', type: 'object', accent: A.pink,
    anchor: { images: ['花'], aura: ['明丽', '绚烂', '温暖'] } },

  // —— 找一个瞬间 ——
  { id: 'zhuanzhu', text: '一个正在认真做一件事的人', hint: '专注的样子，本身就好看', type: 'moment', accent: A.fresh,
    anchor: { moods: ['惜时'], theme: ['惜时'] } },
  { id: 'shou', text: '一双正在创造的手', hint: '敲键盘、画画、拼装……正生出点什么', type: 'moment', accent: A.gold,
    anchor: { moods: ['惜时', '温情'] } },
  { id: 'yanguang', text: '谁眼里的光', hint: '一张正发着光的脸', type: 'moment', accent: A.pink,
    anchor: { moods: ['喜悦', '期待'], aura: ['明丽'] } },
  { id: 'tan', text: '一次真诚的交谈，或并肩', hint: '两个人、一段对话、肩并肩', type: 'moment', accent: A.pink,
    anchor: { theme: ['友情'], moods: ['温情', '喜悦'] } },
  { id: 'jianchi', text: '一个坚持到现在的人', hint: '累，但还在——这很动人', type: 'moment', accent: A.gold,
    anchor: { moods: ['惜时', '闲适', '寂寞'] } },
  { id: 'manzu', text: '此刻你心里的一点满足', hint: '小小的、刚刚好的那种满足', type: 'moment', accent: A.green,
    anchor: { moods: ['闲适', '宁静', '释然'], aura: ['空灵', '禅意'] } },
]

export const ACCENTS = [A.gold, A.green, A.pink, A.blue, A.fresh]

/** 兜底：断网 / AI 出错时，从写死的 12 条里随机抽（优先避开刚看过的） */
export function drawTheme(exclude = []) {
  const ex = new Set(exclude)
  const pool = THEMES.filter((t) => !ex.has(t.id))
  const list = pool.length ? pool : THEMES
  return list[Math.floor(Math.random() * list.length)]
}

// ——— 动态主题注册表 ———
// AI 实时生成的寻物令不在 THEMES 数组里，注册到这里（持久化），
// 这样 getThemeById 在跳转/刷新后仍能按 id 找回完整主题（含 anchor 诗锚）。
const DYN_KEY = 'xmj_dyn_themes_v1'
function loadDyn() {
  try { return JSON.parse(localStorage.getItem(DYN_KEY) || '{}') } catch { return {} }
}
export function registerTheme(t) {
  try {
    const m = loadDyn()
    m[t.id] = t
    const ids = Object.keys(m)
    if (ids.length > 40) delete m[ids[0]] // 限量，避免无限增长
    localStorage.setItem(DYN_KEY, JSON.stringify(m))
  } catch (e) { console.warn('registerTheme failed', e) }
  return t
}

export function getThemeById(id) {
  const m = loadDyn()
  if (m[id]) return m[id]
  return THEMES.find((t) => t.id === id)
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'dyn_' + Date.now() + Math.random().toString(16).slice(2)

/** 把 AI 返回的原始结果，补上 id + 配色，注册并返回一个完整主题 */
export function newThemeFromAI(ai, accentIndex = Math.floor(Math.random() * ACCENTS.length)) {
  const theme = {
    id: uid(),
    text: ai.text,
    hint: ai.hint,
    type: ai.type === 'moment' ? 'moment' : 'object',
    accent: ACCENTS[accentIndex % ACCENTS.length],
    anchor: ai.anchor || {},
    fromAI: true,
  }
  return registerTheme(theme)
}

// 首次进入的三拍引导（小满的声音，带核心主旨）
export const ONBOARDING = [
  { say: '你来啦，我是小满。', sub: '一只爱东张西望的小瑞兽。', action: 'xunwuling' },
  { say: '这世界，好像什么都“没意义”。\n可每天，总有一点点好看的，\n悄悄发生，又悄悄过去。', sub: '只是我们常常，来不及看它一眼。', action: 'daiji' },
  { say: '每天，我请你找一样、拍给我看。\n我替你从千年的诗里牵一句，\n把这点微小的好，留下来。', sub: '不必圆满，小小的满足，也值得被看见。', action: 'xunwuling' },
]

// 小满的声音（固定文案）
export const COPY = {
  opening: '你来啦。今天，我想请你陪我找一样东西——',
  reroll: '这张不太合你呀？那再看看下一张～',
  accept: '接下今日签',
  redraw: '换一张',
  todayDone: '今天的小满印已经拿到啦。',
  hesitate: '不用急着决定。有些美好，是要多看它两眼，才认得出来的。',
  // 找到诗之后，问用户要不要收
  keepAsk: '它好像真的打动你了。要把这张照片装进明信片，收进诗笺夹吗？',
  // 收藏时可留一句自己的话（跋）
  postscriptAsk: '想给它留一句你自己的话吗？（不写也行）',
  postscriptPlaceholder: '写一句就好，给未来的自己留个记号…',
  matchFail: '这一幕太新了，古人好像还没遇上过呢——要不要我再翻翻？',
  shijiEnding: '这些，都是你认真看过世界的证据呀。照片没有单独躺着，它们都住在你收下的诗笺里。',
  slogan: '物致于此，小得盈满',
}

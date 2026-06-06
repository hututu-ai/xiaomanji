// ─────────────────────────────────────────────────────────────────────────────
//  src/services/ai.js —— 小满的"牵线"能力（读图 + 从真实诗库匹配古诗）
// ─────────────────────────────────────────────────────────────────────────────
//  用的是哪家模型：阿里通义千问 Qwen-VL-Max(读图) + Qwen-Plus(选诗/共鸣话)，
//  走 DashScope OpenAI 兼容协议，经本站 /api/ai 代理（key 留服务端，见 storage/README）。
//
//  ★ 铁律：诗逐字来自核验诗库（src/data/poems.json），模型只"读图"和"从候选里挑"，
//    绝不让它"背诗"或"编诗"。matchPoem 返回的是诗库里的 id，诗文从库里取。
//
//  换别家模型：改 VISION_MODEL / TEXT_MODEL + api/_dashscope.js 的 ENDPOINT 即可。
// ─────────────────────────────────────────────────────────────────────────────
import { getCandidates, getPoemById } from '../data/poems.js'

const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || '/api/ai'
// aiping.cn 上的最新千问：视觉用 Qwen3-VL（Instruct 非思考、快），文字用 Qwen3.7
// 想要更高质量可把 TEXT_MODEL 换成 'Qwen3.7-Max'（更慢，思考更多）
const VISION_MODEL = 'Qwen3-VL-30B-A3B-Instruct'
const TEXT_MODEL = 'Qwen3.7-Plus'

async function chat({ model, messages, temperature = 0.7, max_tokens = 1024 }) {
  const resp = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.error || `AI 请求失败（${resp.status}）`)
  if (typeof data?.content !== 'string') throw new Error('AI 返回为空')
  return data.content.trim()
}

function parseJSON(text) {
  // 去掉 ```json ... ``` 围栏，容错解析
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim()
  const s = cleaned.indexOf('{')
  const e = cleaned.lastIndexOf('}')
  if (s >= 0 && e > s) return JSON.parse(cleaned.slice(s, e + 1))
  return JSON.parse(cleaned)
}

// 受控词表（让模型的输出和诗库标签同一种语言）
const VOCAB = {
  mood: '孤独,思念,相思,乡愁,离愁,喜悦,闲适,惆怅,怅惘,宁静,豁达,感伤,惜时,期待,失落,释然,寂寞,温情',
  image: '月,夕阳,星,云,雨,雪,风,雾,花,柳,叶,松,竹,梅,荷,山,水,江,舟/帆,桥,路,灯,酒,雁,鸟,钟,窗,楼台,庭院',
  aura: '空灵,朦胧,苍茫,清新,萧瑟,温暖,壮阔,雄浑,婉约,疏淡,禅意,孤寂,绚烂,明丽',
}

/**
 * 读图 → 输出和诗库同语言的"意"（用于检索 + 复选）。
 * @returns {Promise<{desc,season,time,moods:string[],images:string[],aura:string[],gist,abstract}>}
 */
export async function describeImage(imageDataUrl) {
  const prompt = `请观察这张照片，读出它的内容、光线、氛围与情绪，尤其留意细微、易被忽略却动人的细节。
然后只返回一个 JSON（不要任何多余文字），字段如下：
{
 "desc": "30字内客观描述",
 "season": "春/夏/秋/冬/无 之一",
 "time": "清晨/白天/黄昏/夜晚/无 之一",
 "moods": ["从这些里选1-3个: ${VOCAB.mood}"],
 "images": ["画面里出现的物象, 尽量用这些词: ${VOCAB.image}"],
 "aura": ["整体气质, 从这些里选1-2个: ${VOCAB.aura}"],
 "gist": "一句话白话意境(20字内)",
 "abstract": true/false  // 画面是否抽象/朦胧/意识流、难以指认具体物
}`
  const out = await chat({
    model: VISION_MODEL,
    temperature: 0.5,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
  })
  const u = parseJSON(out)
  return {
    desc: u.desc || '',
    season: u.season && u.season !== '无' ? u.season : '',
    time: u.time && u.time !== '无' ? u.time : '',
    moods: Array.isArray(u.moods) ? u.moods : [],
    images: Array.isArray(u.images) ? u.images : [],
    aura: Array.isArray(u.aura) ? u.aura : [],
    gist: u.gist || '',
    abstract: !!u.abstract,
  }
}

/**
 * 从候选诗里复选最共鸣的一首 + 写小满的共鸣话。
 * 诗文不由模型产出——只取 id，诗从库里拿。
 */
async function pickPoem(understanding, themeText, candidates) {
  const list = candidates
    .map(
      (p, i) =>
        `${i + 1}. [${p.id}] 「${p.mingju}」—${p.author}·${p.dynasty} | 情绪:${(p.mood || []).join('/')} | 意境:${(p.aura || []).join('/')} | ${p.gist}`
    )
    .join('\n')

  const system = `你是"小满"，一只温柔的东方瑞兽灵宠，替用户和古人牵线。说话温暖、文艺，但绝不煽情、不说教、不堆"美好/治愈/温柔"这类空泛大词。像在耳边轻轻说一两句悄悄话。`
  const user = `用户今天的寻物令是【${themeText}】。
ta拍到的画面：${understanding.desc}。意境：${understanding.gist}。情绪：${understanding.moods.join('/')}。

下面是若干首古诗候选。请挑出和这张照片"此情此景"最共鸣的【一首】（按情与境，不是按字面物象硬凑；若都不够贴切，挑最接近的）：
${list}

只返回 JSON：{"id":"被选中那首的方括号id", "resonance":"以小满的口吻，1-2句，说说为什么这一幕让你想起这首诗——讲具体的共鸣点，别复述诗句，别用空泛词"}`

  const out = await chat({
    model: TEXT_MODEL,
    temperature: 0.9,
    max_tokens: 600, // 已关思考链，无需为推理留余量
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  const r = parseJSON(out)
  return { id: r.id, resonance: (r.resonance || '').trim() }
}

/**
 * 高层：照片 + 寻物令 → 牵出一首真实古诗 + 小满共鸣话。
 * @param {string} imageDataUrl
 * @param {object} theme  寻物令对象（含 anchor 诗锚）
 * @param {string[]} excludeIds  换一首时排除
 * @returns {Promise<{poem, resonance, understanding}>}
 */
export async function matchPoem(imageDataUrl, theme, excludeIds = []) {
  const understanding = await describeImage(imageDataUrl)
  const candidates = getCandidates(understanding, theme?.anchor || {}, {
    limit: 24,
    exclude: excludeIds,
  })
  let { id, resonance } = await pickPoem(understanding, theme?.text || '', candidates)
  let poem = getPoemById(id)
  // 兜底：模型给的 id 不在库里 → 取候选第一首
  if (!poem) {
    poem = candidates[0]
    if (!resonance) resonance = '这一幕，让我想起了这一句。'
  }
  return { poem, resonance, understanding }
}

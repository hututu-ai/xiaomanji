const STRONG_PUNCT = '。！？'
const CLAUSE_PUNCT_RE = /[，。！？；：]/u

function cleanText(text = '') {
  return String(text)
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function withPunctuation(seg, fallback = '。') {
  const s = seg.trim()
  if (!s) return ''
  return /[，。！？；：]$/u.test(s) ? s : `${s}${fallback}`
}

function splitMarked(text) {
  const parts = []
  const re = /([^，。！？；：]+)([，。！？；：]?)/gu
  let m
  while ((m = re.exec(text))) {
    const words = m[1].trim()
    if (!words) continue
    parts.push(`${words}${m[2] || ''}`)
  }
  return parts
}

function splitUnmarked(text) {
  const bySpace = text.split(/\s+/).filter(Boolean)
  if (bySpace.length > 1) return bySpace.map((s) => withPunctuation(s))

  const compact = text.replace(/[，。！？；：、\s]/gu, '')
  if (!compact) return []

  const size = compact.length >= 28 ? 7 : 5
  const out = []
  for (let i = 0; i < compact.length; i += size) {
    out.push(withPunctuation(compact.slice(i, i + size)))
  }
  return out
}

export function poemLines(text, maxLines = 4) {
  const cleaned = cleanText(text)
  if (!cleaned) return []
  const lines = CLAUSE_PUNCT_RE.test(cleaned) ? splitMarked(cleaned) : splitUnmarked(cleaned)
  return lines.slice(0, maxLines).map((line, index, arr) => {
    if (index === arr.length - 1 && !STRONG_PUNCT.includes(line.at(-1))) return withPunctuation(line)
    return line
  })
}

export function poemExcerpt(poem, maxLines = 4) {
  return poemLines(poem?.full || poem?.mingju || '', maxLines).join('')
}

export function displayPoemLines(text, maxLines = 4) {
  return poemLines(text, maxLines).map((line) => line.replace(/[。！？]$/u, ''))
}

export function compactVerse(text, maxLines = 2) {
  return poemLines(text, maxLines).join(' ').replace(/[，。！？；：]/gu, ' ').replace(/\s+/g, ' ').trim()
}

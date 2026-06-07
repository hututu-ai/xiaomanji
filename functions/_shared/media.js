export function parseDataUrl(dataUrl) {
  const m = /^data:([^;,]+);base64,(.+)$/i.exec(dataUrl || '')
  if (!m) return null
  const bytes = Uint8Array.from(atob(m[2]), (ch) => ch.charCodeAt(0))
  return { contentType: m[1], bytes }
}

export async function putDataUrl(bucket, dataUrl, keyPrefix, id) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return null
  const ext = parsed.contentType.includes('png') ? 'png' : parsed.contentType.includes('webp') ? 'webp' : 'jpg'
  const key = `${keyPrefix}/${id}.${ext}`
  await bucket.put(key, parsed.bytes, {
    httpMetadata: { contentType: parsed.contentType },
    customMetadata: { app: 'xiaomanji' },
  })
  return { key, contentType: parsed.contentType }
}


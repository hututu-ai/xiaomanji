export function parseDataUrl(dataUrl) {
  const m = /^data:([^;,]+);base64,(.+)$/i.exec(dataUrl || '')
  if (!m) return null
  const bytes = Uint8Array.from(atob(m[2]), (ch) => ch.charCodeAt(0))
  return { contentType: m[1], base64: m[2], bytes, byteSize: bytes.byteLength }
}

export function mediaUrl(key) {
  return key ? `/api/media?key=${encodeURIComponent(key)}` : ''
}

export function isD1MediaKey(key = '') {
  return String(key).startsWith('d1/')
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

export async function putMediaDataUrl({ database, bucket, dataUrl, keyPrefix, id, userId, meta = {} }) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return null

  if (bucket) return putDataUrl(bucket, dataUrl, keyPrefix, id)

  // D1 is a bridge for App development before R2 is enabled. Keep each image small.
  const maxBytes = 1_500_000
  if (parsed.byteSize > maxBytes) {
    throw new Error('图片太大，请先压缩后再保存')
  }

  const ext = parsed.contentType.includes('png') ? 'png' : parsed.contentType.includes('webp') ? 'webp' : 'jpg'
  const key = `d1/${keyPrefix}/${id}.${ext}`
  await database
    .prepare(`
      INSERT INTO media_blobs
        (id, user_id, media_key, content_type, data_base64, byte_size, created_at, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(media_key) DO UPDATE SET
        content_type = excluded.content_type,
        data_base64 = excluded.data_base64,
        byte_size = excluded.byte_size,
        meta_json = excluded.meta_json
    `)
    .bind(id, userId, key, parsed.contentType, parsed.base64, parsed.byteSize, Date.now(), JSON.stringify(meta))
    .run()

  return { key, contentType: parsed.contentType, storage: 'd1' }
}

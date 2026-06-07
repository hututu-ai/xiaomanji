import { createXiaomanSpeech } from './_openaiTts.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const result = await createXiaomanSpeech(req.body || {}, process.env.OPENAI_API_KEY, {
      voice: process.env.OPENAI_TTS_VOICE,
      model: process.env.OPENAI_TTS_MODEL,
    })
    res.setHeader('Content-Type', result.contentType)
    res.setHeader('Cache-Control', 'private, max-age=86400')
    res.status(200).send(Buffer.from(result.audio))
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'TTS proxy error' })
  }
}

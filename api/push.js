// Sends a cheer notification to the other person's phone(s).
import { NAMES, db, pushReady, sendTo } from './_lib.js'

const clean = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { to, from, kind, emoji, text } = req.body || {}
  if (!NAMES[to] || !NAMES[from] || to === from || kind !== 'cheer') return res.status(400).json({ error: 'bad request' })
  if (!pushReady()) return res.status(200).json({ skipped: 'VAPID_PRIVATE_KEY not set' })

  try {
    const sent = await sendTo(db(), to, {
      title: `${NAMES[from]} sent you ${clean(emoji, 8)}`,
      body: clean(text, 120) || 'A little cheer for you',
      tag: 'cheer',
    })
    return res.status(200).json({ ok: true, sent })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err.message || err) })
  }
}

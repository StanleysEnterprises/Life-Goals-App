// Daily evening nudge — run by Vercel Cron (see vercel.json, 9:00 UTC = 7pm Brisbane).
import { NAMES, db, pushReady, sendTo, todayInAppTz, APP_TZ } from './_lib.js'

const createdDay = (iso) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

export default async function handler(req, res) {
  // If a CRON_SECRET is set in Vercel, only Vercel's scheduler can trigger this
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorised' })
  if (!pushReady()) return res.status(200).json({ skipped: 'VAPID_PRIVATE_KEY not set' })

  try {
    const supabase = db()
    const today = todayInAppTz()
    const [{ data: goals, error: e1 }, { data: done, error: e2 }] = await Promise.all([
      supabase.from('goals').select('*'),
      supabase.from('completions').select('goal_id, person').eq('day', today),
    ])
    if (e1 || e2) throw e1 || e2

    const result = {}
    for (const person of ['tegan', 'will']) {
      const dailies = goals.filter(
        (g) =>
          !g.archived &&
          !g.retired_on &&
          g.type === 'daily' &&
          (g.owner === person || g.owner === 'both') &&
          createdDay(g.created_at) <= today,
      )
      const left = dailies.filter((g) => !done.some((c) => c.goal_id === g.id && c.person === person))
      if (!dailies.length || !left.length) {
        result[person] = 'nothing left'
        continue
      }
      const list = left.slice(0, 3).map((g) => g.title).join(', ') + (left.length > 3 ? '…' : '')
      const title = left.length === 1 ? `One habit left today, ${NAMES[person]}` : `${left.length} habits left today, ${NAMES[person]}`
      result[person] = await sendTo(supabase, person, { title, body: list, tag: `remind-${today}` })
    }
    return res.status(200).json({ ok: true, today, result })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err.message || err) })
  }
}

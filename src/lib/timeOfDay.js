// Morning / Afternoon / Evening / Anytime — and a little guesser that reads the goal's title.

export const PERIODS = [
  { id: 'morning', label: 'Morning', dot: 'bg-yellow', sky: 'bg-yellow-soft' },
  { id: 'afternoon', label: 'Afternoon', dot: 'bg-blue', sky: 'bg-blue-soft' },
  { id: 'evening', label: 'Evening', dot: 'bg-pink', sky: 'bg-pink-soft' },
  { id: 'anytime', label: 'Anytime', dot: 'bg-mint', sky: 'bg-mint-soft' },
]
export const periodLabel = (id) => PERIODS.find((p) => p.id === id)?.label ?? 'Anytime'

// Which part of the day it is now
export const currentPeriod = (d = new Date()) => {
  const h = d.getHours()
  if (h >= 4 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'afternoon'
  return 'evening'
}

// Top to bottom on the Today screen
export const DAY_FLOW = ['morning', 'afternoon', 'evening', 'anytime']

// A part of the day has "passed" once the clock moves beyond it (morning at 10am, afternoon at 5pm)
export const hasPassed = (period, now) => {
  const seq = ['morning', 'afternoon', 'evening']
  if (period === 'anytime') return false
  return seq.indexOf(period) < seq.indexOf(now)
}

// Order: now first, then what's still to come, then anytime, then what's already passed
export const periodOrder = (now) => {
  const day = ['morning', 'afternoon', 'evening']
  const i = day.indexOf(now)
  return [...day.slice(i), 'anytime', ...day.slice(0, i)]
}

// Rules are checked top to bottom; the first match wins
const RULES = [
  ['morning', /\bmake (the |my |our )?bed\b/], // before the evening rule catches "bed"
  ['evening', /\b(dinner|supper|dessert|bed|bedtime|sleep|night|nightly|tonight|evening|wind[ -]?down|lights out|dishes|floss(ing)?|date night|netflix|tomorrow'?s?|pm skincare|skincare pm)\b/],
  ['morning', /\b(breakfast|wake|waking|morning|sunrise|coffee|make (the |my )?bed|before work|commute|meditat\w*|stretch\w*|am skincare|skincare am|alarm)\b/],
  ['afternoon', /\b(lunch|afternoon|arvo|midday|noon|after work|after school|nap|school pick ?up)\b/],
  ['anytime', /\b(water|hydrat\w*|\d+ ?k? ?steps|steps|no phone|screen ?time|posture|no sugar|no alcohol|sober|vitamins?|gratitude|kind|budget|save \$?\d*)\b/],
]

// A clock time in the title ("by 7am", "after 10pm") decides it outright
const timeHint = (t) => {
  const m = t.match(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/)
  if (!m) return null
  let h = Number(m[1]) % 12
  if (m[2] === 'pm') h += 12
  if (h >= 4 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  return 'evening'
}

export function guessPeriod(title = '') {
  const t = title.toLowerCase()
  if (!t.trim()) return null
  const fromTime = timeHint(t)
  if (fromTime) return fromTime
  for (const [period, re] of RULES) if (re.test(t)) return period
  return null
}

// The period a goal lives in: what was chosen, else a guess, else Anytime
export const periodOf = (goal) => goal.time_of_day || guessPeriod(goal.title) || 'anytime'

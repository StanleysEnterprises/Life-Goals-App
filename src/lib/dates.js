// All dates are stored as local "YYYY-MM-DD" keys so a day means the same thing on both phones.
const pad = (n) => String(n).padStart(2, '0')

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export const addDays = (k, n) => {
  const d = fromKey(k)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

// Weeks start on Monday
export const weekStart = (k) => {
  const d = fromKey(k)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toKey(d)
}

export const weekDays = (k) => {
  const start = weekStart(k)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const lastDays = (n, k = todayKey()) =>
  Array.from({ length: n }, (_, i) => addDays(k, i - (n - 1)))

export const fmt = (k, opts) => fromKey(k).toLocaleDateString('en-AU', opts)

export const createdKey = (iso) => toKey(new Date(iso))

export const dayNumber = (k) => Math.floor(fromKey(k).getTime() / 86400000)

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const relativeDay = (k) => {
  const today = todayKey()
  if (k === today) return 'Today'
  if (k === addDays(today, -1)) return 'Yesterday'
  return fmt(k, { weekday: 'short', day: 'numeric', month: 'short' })
}

// "YYYY-MM" helpers for the monthly recap
export const monthKey = (k = todayKey()) => k.slice(0, 7)
export const prevMonth = (m) => {
  const [y, mo] = m.split('-').map(Number)
  return mo === 1 ? `${y - 1}-12` : `${y}-${pad(mo - 1)}`
}
export const monthDays = (m) => {
  const [y, mo] = m.split('-').map(Number)
  const n = new Date(y, mo, 0).getDate()
  return Array.from({ length: n }, (_, i) => `${m}-${pad(i + 1)}`)
}
export const monthName = (m, opts = { month: 'long' }) => fromKey(`${m}-01`).toLocaleDateString('en-AU', opts)

// Day of week for a date key: 0 = Sunday … 6 = Saturday
export const dow = (k) => fromKey(k).getDay()
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const daysLabel = (days) => {
  if (!days || days.length === 0 || days.length === 7) return null
  const set = new Set(days)
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return 'Weekdays'
  if (set.size === 2 && set.has(0) && set.has(6)) return 'Weekends'
  return DAY_ORDER.filter((d) => set.has(d)).map((d) => DAY_SHORT[d]).join(' · ')
}

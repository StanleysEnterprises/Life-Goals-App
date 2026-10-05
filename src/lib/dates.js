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

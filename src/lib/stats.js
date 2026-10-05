import { addDays, createdKey, monthDays, todayKey, weekDays, weekStart } from './dates'

const ownedBy = (g, person) => g.owner === person || g.owner === 'both'
// `archived` = removed by the old version of the app; treated as deleted
const exists = (g) => !g.archived

const sortKey = (g) => g.sort_order ?? new Date(g.created_at).getTime()
export const byOrder = (a, b) => sortKey(a) - sortKey(b)

// Goals you're working on right now
export const activeGoalsFor = (goals, person) =>
  goals.filter((g) => exists(g) && !g.retired_on && ownedBy(g, person)).sort(byOrder)

// Retired goals (kept for history, hidden from today)
export const retiredGoalsFor = (goals, person) =>
  goals.filter((g) => exists(g) && g.retired_on && ownedBy(g, person)).sort(byOrder)

// Goals that were live on a given day — retired ones still count for the days they were active
export const goalsOnDay = (goals, person, day) =>
  goals
    .filter(
      (g) => exists(g) && ownedBy(g, person) && createdKey(g.created_at) <= day && (!g.retired_on || day < g.retired_on),
    )
    .sort(byOrder)

const mine = (completions, goalId, person) =>
  completions.filter((c) => c.goal_id === goalId && c.person === person)

export const doneOnDay = (completions, goal, person, day) =>
  completions.some((c) => c.goal_id === goal.id && c.person === person && c.day === day)

export const weekCount = (completions, goal, person, day) => {
  const days = new Set(weekDays(day))
  return mine(completions, goal.id, person).filter((c) => days.has(c.day)).length
}

// Is the goal "complete" (struck through) as of this day?
export const isComplete = (goal, person, completions, day) => {
  if (goal.type === 'daily') return doneOnDay(completions, goal, person, day)
  if (goal.type === 'weekly') return weekCount(completions, goal, person, day) >= (goal.target || 1)
  return mine(completions, goal.id, person).length > 0
}

// Share of daily habits done on a day (null when there were none to do)
export const dailyRatio = (goals, completions, person, day) => {
  const dailies = goalsOnDay(goals, person, day).filter((g) => g.type === 'daily')
  if (!dailies.length) return null
  const done = dailies.filter((g) => doneOnDay(completions, g, person, day)).length
  return done / dailies.length
}

export const streak = (goals, completions, person, today = todayKey()) => {
  let day = dailyRatio(goals, completions, person, today) === 1 ? today : addDays(today, -1)
  let n = 0
  for (let i = 0; i < 730; i++) {
    if (dailyRatio(goals, completions, person, day) !== 1) break
    n++
    day = addDays(day, -1)
  }
  return n
}

// Streak for one habit: days in a row (daily) or weeks in a row the target was met (weekly)
export const goalStreak = (goal, person, completions, today = todayKey()) => {
  const done = new Set(mine(completions, goal.id, person).map((c) => c.day))
  if (goal.type === 'daily') {
    let day = done.has(today) ? today : addDays(today, -1)
    let n = 0
    while (done.has(day) && n < 3650) {
      n++
      day = addDays(day, -1)
    }
    return n
  }
  if (goal.type === 'weekly') {
    const target = goal.target || 1
    const met = (wk) => weekDays(wk).filter((d) => done.has(d)).length >= target
    let wk = weekStart(today)
    if (!met(wk)) wk = addDays(wk, -7)
    let n = 0
    while (met(wk) && n < 520) {
      n++
      wk = addDays(wk, -7)
    }
    return n
  }
  return 0
}

// Average daily-habit completion across the week so far
export const weekConsistency = (goals, completions, person, today = todayKey()) => {
  const ratios = weekDays(today)
    .filter((d) => d <= today)
    .map((d) => dailyRatio(goals, completions, person, d))
    .filter((r) => r !== null)
  if (!ratios.length) return null
  return ratios.reduce((a, b) => a + b, 0) / ratios.length
}

// The "Quiet Wins" journal: milestones reached, full days, weekly targets met
export const quietWins = (goals, completions, person) => {
  const byId = Object.fromEntries(goals.map((g) => [g.id, g]))
  const own = completions.filter((c) => c.person === person)
  const wins = []

  for (const c of own) {
    const g = byId[c.goal_id]
    if (g && exists(g) && g.type === 'milestone')
      wins.push({ id: `m-${c.id}`, day: c.day, person, kind: 'milestone', text: g.title })
  }

  for (const day of new Set(own.map((c) => c.day))) {
    if (dailyRatio(goals, completions, person, day) === 1)
      wins.push({ id: `d-${person}-${day}`, day, person, kind: 'day', text: 'Every daily habit, done' })
  }

  for (const g of goals.filter((g) => exists(g) && ownedBy(g, person) && g.type === 'weekly')) {
    const weeks = {}
    own
      .filter((c) => c.goal_id === g.id)
      .sort((a, b) => a.day.localeCompare(b.day))
      .forEach((c) => (weeks[weekStart(c.day)] ||= []).push(c.day))
    for (const [wk, days] of Object.entries(weeks)) {
      if (days.length >= (g.target || 1))
        wins.push({ id: `w-${g.id}-${wk}`, day: days[(g.target || 1) - 1], person, kind: 'weekly', text: `${g.title} — weekly target met` })
    }
  }

  return wins.sort((a, b) => b.day.localeCompare(a.day))
}

// Everything the monthly recap shows, for one person and one month ("YYYY-MM")
export const monthRecap = (data, person, month) => {
  const { goals, completions, cheers = [] } = data
  const today = todayKey()
  const days = monthDays(month).filter((d) => d <= today)
  const inMonth = completions.filter((c) => c.person === person && c.day.startsWith(month))

  let perfect = 0
  let best = 0
  let run = 0
  for (const d of days) {
    const r = dailyRatio(goals, completions, person, d)
    if (r === 1) {
      perfect++
      run++
      best = Math.max(best, run)
    } else if (r !== null) run = 0
  }

  // Most consistent daily habit (highest share of its live days ticked)
  let top = null
  for (const g of goals.filter((g) => exists(g) && ownedBy(g, person) && g.type === 'daily')) {
    const live = days.filter((d) => createdKey(g.created_at) <= d && (!g.retired_on || d < g.retired_on))
    if (live.length < 3) continue
    const hit = live.filter((d) => doneOnDay(completions, g, person, d)).length
    const rate = hit / live.length
    if (!top || rate > top.rate) top = { title: g.title, rate, hit, of: live.length }
  }

  const byId = Object.fromEntries(goals.map((g) => [g.id, g]))
  const milestones = inMonth.filter((c) => byId[c.goal_id]?.type === 'milestone').map((c) => byId[c.goal_id].title)

  return {
    ticks: inMonth.length,
    perfect,
    best,
    top,
    milestones,
    cheersSent: cheers.filter((c) => c.from_person === person && c.created_at?.slice(0, 7) === month).length,
    cheersGot: cheers.filter((c) => c.to_person === person && c.created_at?.slice(0, 7) === month).length,
  }
}

export const pct = (r) => (r === null || r === undefined ? '—' : `${Math.round(r * 100)}%`)

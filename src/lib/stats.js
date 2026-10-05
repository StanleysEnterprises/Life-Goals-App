import { addDays, createdKey, todayKey, weekDays, weekStart } from './dates'

export const activeGoalsFor = (goals, person) =>
  goals.filter((g) => !g.archived && (g.owner === person || g.owner === 'both'))

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
  const dailies = activeGoalsFor(goals, person).filter(
    (g) => g.type === 'daily' && createdKey(g.created_at) <= day,
  )
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
    if (g?.type === 'milestone') wins.push({ id: `m-${c.id}`, day: c.day, person, kind: 'milestone', text: g.title })
  }

  for (const day of new Set(own.map((c) => c.day))) {
    if (dailyRatio(goals, completions, person, day) === 1)
      wins.push({ id: `d-${person}-${day}`, day, person, kind: 'day', text: 'Every daily habit, done' })
  }

  for (const g of activeGoalsFor(goals, person).filter((g) => g.type === 'weekly')) {
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

export const pct = (r) => (r === null || r === undefined ? '—' : `${Math.round(r * 100)}%`)

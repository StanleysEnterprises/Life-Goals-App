import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { addDays, fmt, todayKey, weekStart } from '../lib/dates'
import { PEOPLE } from '../lib/constants'

export const QUESTIONS = [
  { id: 'well', label: 'What went well this week?', placeholder: 'A small win, a good moment…' },
  { id: 'focus', label: 'One focus for next week?', placeholder: 'Keep it to one thing' },
]

export const parseCheckin = (note) => {
  try {
    return JSON.parse(note?.body ?? '{}')
  } catch {
    return {}
  }
}

export const findCheckin = (notes, person, week) =>
  notes.find((n) => n.kind === 'checkin' && n.person === person && n.day === week)

// Which week to reflect on today: Sunday → this week; Monday → last week (if not done yet)
export function checkinWeekFor(notes, person, today = todayKey()) {
  const dow = new Date().getDay()
  if (dow === 0) return weekStart(today)
  if (dow === 1) {
    const last = weekStart(addDays(today, -1))
    if (!findCheckin(notes, person, last)) return last
  }
  return null
}

export function CheckinCard({ person, week }) {
  const { data, saveCheckin } = useStore()
  const saved = findCheckin(data.notes, person, week)
  const [answers, setAnswers] = useState(parseCheckin(saved))
  const [editing, setEditing] = useState(!saved)

  useEffect(() => {
    if (saved && !editing) setAnswers(parseCheckin(saved))
  }, [saved?.body])

  const save = () => {
    saveCheckin(person, week, answers)
    setEditing(false)
  }

  const label = `Week of ${fmt(week, { day: 'numeric', month: 'short' })}`

  if (!editing)
    return (
      <section className="rounded-3xl bg-mint-soft p-5">
        <div className="flex items-center justify-between">
          <div className="eyebrow">Weekly check-in · {label}</div>
          <button onClick={() => setEditing(true)} className="text-xs font-semibold text-ink-soft underline-offset-2 active:underline">
            Edit
          </button>
        </div>
        <p className="mt-2 font-display text-lg font-semibold text-ink">Saved. Nice reflecting, {PEOPLE[person].name}.</p>
        <p className="mt-1 text-sm text-ink-soft">Read both of yours side by side in Compare.</p>
      </section>
    )

  return (
    <section className="rounded-3xl bg-mint-soft p-5">
      <div className="eyebrow">Weekly check-in · {label}</div>
      <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink">Two minutes to look back.</p>
      <div className="mt-4 space-y-3">
        {QUESTIONS.map((q) => (
          <label key={q.id} className="block">
            <span className="text-xs font-semibold text-ink-soft">{q.label}</span>
            <textarea
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              rows={2}
              placeholder={q.placeholder}
              className="field mt-1.5 resize-none"
            />
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={!QUESTIONS.some((q) => answers[q.id]?.trim())}
        className="mt-4 w-full rounded-2xl bg-yellow py-3 text-sm font-bold text-onaccent transition active:scale-[0.98] disabled:opacity-40"
      >
        Save check-in
      </button>
    </section>
  )
}

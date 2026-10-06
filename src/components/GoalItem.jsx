import { useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { doneOnDay, goalStreak, goalsOnDay, isComplete, weekCount } from '../lib/stats'
import { burst } from '../lib/confetti'
import { category } from '../lib/constants'
import { daysLabel, fmt, todayKey, weekStart } from '../lib/dates'
import { ChevronIcon, PencilIcon, StreakIcon } from './Icons'
import { CheerButton, CheerPills } from './Cheers'

export function CheckCircle({ checked, pop }) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full ${checked ? 'is-checked' : ''} ${pop ? 'animate-pop' : ''}`}>
      {pop && <span className="absolute inset-0 animate-glow rounded-full" />}
      <svg viewBox="0 0 28 28" className="h-7 w-7">
        <circle cx="14" cy="14" r="12.5" className="check-ring" />
        <path d="M8.5 14.5l3.6 3.6 7.4-7.6" className="check-path" />
      </svg>
    </span>
  )
}

function Dots({ count, target }) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: target }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${i < count ? 'bg-blue' : 'bg-line'}`}
        />
      ))}
    </span>
  )
}

// What a cheer is attached to: this goal on this day / this week / for good
export const cheerRef = (goal, day) =>
  goal.type === 'daily' ? `${goal.id}:${day}` : goal.type === 'weekly' ? `${goal.id}:${weekStart(day)}` : goal.id

export default function GoalItem({ goal, person, day = todayKey(), editing = false, onEdit, onMove, canUp, canDown }) {
  const { data, toggle } = useStore()
  const [pop, setPop] = useState(false)
  const circle = useRef(null)

  const complete = isComplete(goal, person, data.completions, day)
  const checked = goal.type === 'weekly' ? doneOnDay(data.completions, goal, person, day) : complete
  const target = goal.target || 1
  const count = goal.type === 'weekly' ? weekCount(data.completions, goal, person, day) : 0
  const streakN = goalStreak(goal, person, data.completions, day)
  const ref = cheerRef(goal, day)

  // Confetti moments: last daily habit of the day, weekly target reached, milestone done
  const completesSomething = () => {
    if (goal.type === 'milestone') return true
    if (goal.type === 'weekly') return count + 1 === target
    return goalsOnDay(data.goals, person, day)
      .filter((g) => g.type === 'daily' && g.id !== goal.id)
      .every((g) => doneOnDay(data.completions, g, person, day))
  }

  const onTap = () => {
    if (editing) return onEdit?.(goal)
    if (!checked) {
      setPop(true)
      navigator.vibrate?.(12)
      setTimeout(() => setPop(false), 700)
      // Every tick gets a sprinkle; the big moments get the full burst
      const r = circle.current?.getBoundingClientRect()
      if (r) {
        const kind = completesSomething() ? 'big' : 'mini'
        setTimeout(() => burst(r.left + r.width / 2, r.top + r.height / 2, kind), 80)
      }
    }
    toggle(goal, person, day)
  }

  const cat = category(goal.category)
  let meta = cat.label
  if (goal.type === 'weekly') meta = `${Math.min(count, target)} of ${target} this week`
  if (goal.type === 'milestone') meta = goal.due_date ? `By ${fmt(goal.due_date, { day: 'numeric', month: 'short' })}` : 'Milestone'

  const streakLabel =
    streakN >= 2 ? (goal.type === 'weekly' ? `${streakN} weeks` : `${streakN} days`) : null

  return (
    <li className={`list-none ${complete ? 'is-done' : ''}`}>
      <div
        className={`flex items-center gap-2 rounded-2xl border transition-all duration-500 ease-calm ${
          complete ? 'border-blue/60 bg-blue-soft' : 'border-line bg-surface'
        }`}
      >
        <button
          onClick={onTap}
          aria-label={editing ? `Edit ${goal.title}` : undefined}
          className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 text-left transition-transform duration-200 ease-calm active:scale-[0.98]"
        >
          <span ref={circle} className="shrink-0">
            {editing ? (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-yellow-soft text-ink">
                <PencilIcon />
              </span>
            ) : (
              <CheckCircle checked={checked} pop={pop} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-[15.5px] font-medium transition-colors duration-500 ${complete ? 'text-ink-soft' : 'text-ink'}`}>
              <span className="strike">{goal.title}</span>
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
              {goal.type === 'weekly' ? <Dots count={count} target={target} /> : <span className={`h-2 w-2 rounded-full ${cat.dot}`} />}
              {meta}
              {streakLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-soft px-2 py-0.5 text-[10px] font-bold text-ink">
                  <span className="text-yellow-deep">
                    <StreakIcon />
                  </span>
                  {streakLabel}
                </span>
              )}
              {daysLabel(goal.days) && <span className="text-ink-soft">· {daysLabel(goal.days)}</span>}
              {goal.owner === 'both' && (
                <span className="rounded-full bg-pink-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                  Both
                </span>
              )}
              {complete && <CheerPills refId={ref} />}
            </span>
          </span>
        </button>

        {editing ? (
          <span className="mr-2 flex shrink-0 flex-col">
            <button
              onClick={() => onMove?.(-1)}
              disabled={!canUp}
              aria-label={`Move ${goal.title} up`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition active:scale-90 disabled:opacity-20"
            >
              <ChevronIcon dir="up" />
            </button>
            <button
              onClick={() => onMove?.(1)}
              disabled={!canDown}
              aria-label={`Move ${goal.title} down`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition active:scale-90 disabled:opacity-20"
            >
              <ChevronIcon dir="down" />
            </button>
          </span>
        ) : (
          complete && <CheerButton to={person} refId={ref} refText={goal.title} className="mr-3 shrink-0" />
        )}
      </div>
    </li>
  )
}

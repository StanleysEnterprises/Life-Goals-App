import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { activeGoalsFor, dailyRatio, doneOnDay, goalsOnDay, isComplete } from '../lib/stats'
import { addDays, fmt, greeting, monthKey, monthName, prevMonth, todayKey } from '../lib/dates'
import { promptFor, quoteFor } from '../lib/inspiration'
import { PEOPLE } from '../lib/constants'
import { PERSON_HEX, THEME } from '../lib/theme'
import { PERIODS, currentPeriod, periodOf, periodOrder } from '../lib/timeOfDay'
import GoalItem from '../components/GoalItem'
import { CheckinCard, checkinWeekFor } from '../components/Checkin'
import { EmptyState, Section, SyncStatus } from '../components/ui'

const IDS = ['tegan', 'will']

export default function Today({ person, onAdd, onRecap }) {
  const { data } = useStore()
  const { me } = useStore()
  const today = todayKey()
  const [which, setWhich] = useState('today')
  const catchingUp = which === 'yesterday'
  const day = catchingUp ? addDays(today, -1) : today

  // Re-check the time of day every minute so sections reorder on their own
  const [now, setNow] = useState(currentPeriod())
  useEffect(() => {
    const id = setInterval(() => setNow(currentPeriod()), 60_000)
    return () => clearInterval(id)
  }, [])

  const goals = catchingUp ? goalsOnDay(data.goals, person, day) : activeGoalsFor(data.goals, person)
  const habits = goals.filter((g) => g.type !== 'milestone')
  const dailies = goals.filter((g) => g.type === 'daily')
  const milestones = catchingUp
    ? []
    : goals
        .filter((g) => g.type === 'milestone' && !isComplete(g, person, data.completions, day))
        .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))
        .slice(0, 3)

  const done = dailies.filter((g) => isComplete(g, person, data.completions, day)).length
  const ratio = dailies.length ? done / dailies.length : 0

  // A weekly goal counts as done for the day if it was ticked that day or the week's target is met
  const itemDone = (g) => doneOnDay(data.completions, g, person, day) || isComplete(g, person, data.completions, day)

  const order = catchingUp ? ['morning', 'afternoon', 'evening', 'anytime'] : periodOrder(now)
  const sections = order
    .map((id) => ({ ...PERIODS.find((p) => p.id === id), goals: habits.filter((g) => periodOf(g) === id) }))
    .filter((s) => s.goals.length)

  const checkinWeek = person === me ? checkinWeekFor(data.notes, person, today) : null
  const showRecap =
    Number(today.slice(8)) <= 5 && data.completions.some((c) => c.day.startsWith(prevMonth(monthKey(today))))

  return (
    <div className="space-y-7">
      <Sky person={person} period={catchingUp ? 'evening' : now} ratio={ratio} done={done} total={dailies.length} catchingUp={catchingUp} />

      {showRecap && !catchingUp && (
        <button
          onClick={() => onRecap(prevMonth(monthKey(today)))}
          className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-yellow-soft to-blue-soft p-5 text-left transition active:scale-[0.98]"
        >
          <span>
            <span className="eyebrow">Monthly recap</span>
            <span className="mt-1 block font-display text-xl font-semibold text-ink">
              Your {monthName(prevMonth(monthKey(today)))} is ready
            </span>
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-yellow text-lg text-onaccent">→</span>
        </button>
      )}

      {checkinWeek && !catchingUp && <CheckinCard person={person} week={checkinWeek} />}

      {goals.length > 0 && (
        <div className="flex items-center justify-between">
          <DaySwitch which={which} onChange={setWhich} />
          <span className="text-xs text-ink-soft">{catchingUp ? 'Tick anything you missed' : ''}</span>
        </div>
      )}

      {goals.length === 0 && !catchingUp && (
        <EmptyState
          title="A quiet start"
          body="Add a daily habit, a weekly target or a milestone. It only takes a moment."
          action="Add your first goal"
          onAction={onAdd}
        />
      )}

      {sections.map((s) => (
        <PeriodSection
          key={s.id}
          section={s}
          person={person}
          day={day}
          isNow={!catchingUp && s.id === now}
          collapsible={!catchingUp && s.id !== now}
          doneCount={s.goals.filter(itemDone).length}
        />
      ))}

      {!catchingUp && <CardRow person={person} day={today} />}

      {milestones.length > 0 && (
        <Section title="On the horizon">
          <ul className="space-y-2.5">
            {milestones.map((g) => (
              <GoalItem key={g.id} goal={g} person={person} day={day} />
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

// ── The sky: sun (or moon) travels the arc as the day's habits get done ──
function Sky({ person, period, ratio, done, total, catchingUp }) {
  const { data } = useStore()
  const sky = { morning: 'bg-yellow-soft', afternoon: 'bg-blue-soft', evening: 'bg-pink-soft' }[period]
  const night = period === 'evening'
  // Point along the quadratic arc M20,94 Q170,-10 320,94
  const t = Math.max(0.02, Math.min(0.98, ratio))
  const x = (1 - t) ** 2 * 20 + 2 * (1 - t) * t * 170 + t ** 2 * 320
  const y = (1 - t) ** 2 * 94 + 2 * (1 - t) * t * -10 + t ** 2 * 94
  const orb = night ? THEME.blue : 'rgb(var(--tegan))'

  return (
    <section className={`relative -mx-2 overflow-hidden rounded-[34px] px-5 pb-4 pt-4 transition-colors duration-700 ${sky}`}>
      <div className="eyebrow flex items-center justify-between">
        <span>
          {fmt(todayKey(), { weekday: 'long', day: 'numeric', month: 'short' })} · {catchingUp ? 'yesterday' : period}
        </span>
        <SyncStatus />
      </div>

      <div className="relative mt-2 h-[96px]">
        <svg viewBox="0 0 340 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <path d="M 20 94 Q 170 -10 320 94" fill="none" stroke="rgb(var(--ink) / .18)" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
          <path
            d="M 20 94 Q 170 -10 320 94"
            fill="none"
            stroke={orb}
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${Math.round(t * 100)} 100`}
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }}
          />
          <line x1="6" y1="94" x2="334" y2="94" stroke="rgb(var(--ink) / .12)" strokeWidth="1.5" />
          <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 1s cubic-bezier(.34,1.56,.64,1)' }}>
            <circle r="22" fill={orb} opacity="0.25" />
            <circle r="14" fill={orb} />
            {night && <circle cx="6" cy="-5" r="11.5" style={{ fill: 'rgb(var(--pink-soft))' }} />}
          </g>
        </svg>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <h1 className="font-display text-[30px] font-semibold leading-[1.05] tracking-tight text-ink">
          {greeting()},<br />
          <span className="highlight" style={{ '--hl': PERSON_HEX[person] }}>
            {PEOPLE[person].name}
          </span>
        </h1>
        {total > 0 && (
          <div className="mb-1 shrink-0 rounded-full bg-surface/80 px-2.5 py-1 text-xs font-bold text-ink">
            {done} of {total} done
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[person, IDS.find((p) => p !== person)].map((p) => {
          const r = dailyRatio(data.goals, data.completions, p, catchingUp ? addDays(todayKey(), -1) : todayKey())
          return (
            <div key={p} className="flex items-center gap-2.5 rounded-2xl bg-surface/80 px-3 py-2">
              <MiniRing value={r ?? 0} color={PERSON_HEX[p]} label={PEOPLE[p].initial} />
              <div className="text-xs leading-tight">
                <b className="text-ink">{p === person ? PEOPLE[p].name : PEOPLE[p].name}</b>
                <div className="text-ink-soft">{r === null ? 'no habits yet' : `${Math.round(r * 100)}% today`}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MiniRing({ value, color, label }) {
  const c = 2 * Math.PI * 14
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center">
      <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" style={{ stroke: 'rgb(var(--line))' }} strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          style={{ stroke: color, transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
        />
      </svg>
      <span className="text-[11px] font-extrabold text-ink">{label}</span>
    </span>
  )
}

// ── A part of the day ──
function PeriodSection({ section, person, day, isNow, collapsible, doneCount }) {
  const total = section.goals.length
  const complete = doneCount === total
  const [open, setOpen] = useState(!(collapsible && complete))
  useEffect(() => {
    if (collapsible && complete) setOpen(false)
  }, [collapsible, complete])

  return (
    <section>
      <button
        onClick={() => collapsible && setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${section.dot}`} />
        <span className="eyebrow">{section.label}</span>
        {isNow && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-canvas">Now</span>}
        <span className="ml-auto text-xs font-semibold text-ink-soft">
          {complete ? '✓ ' : ''}
          {doneCount} of {total}
        </span>
      </button>
      {open ? (
        <ul className="animate-rise space-y-2.5">
          {section.goals.map((g) => (
            <GoalItem key={g.id} goal={g} person={person} day={day} />
          ))}
        </ul>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl border border-dashed border-line px-4 py-3 text-left text-sm text-ink-soft"
        >
          All done — tap to see
        </button>
      )}
    </section>
  )
}

// ── Swipeable cards: inspiration + intention, and today's words ──
function CardRow({ person, day }) {
  const quote = quoteFor(day, person)
  const row = useRef(null)
  const [index, setIndex] = useState(0)
  const onScroll = () => {
    const el = row.current
    if (el) setIndex(Math.round(el.scrollLeft / (el.firstElementChild?.offsetWidth || 1)))
  }
  return (
    <div>
      <div
        ref={row}
        onScroll={onScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-[86%] shrink-0 snap-center">
          <Intention person={person} day={day} />
        </div>
        <figure className="relative w-[86%] shrink-0 snap-center overflow-hidden rounded-3xl bg-yellow-soft p-5">
          <span aria-hidden className="absolute right-5 top-3 font-display text-[64px] font-bold leading-none text-yellow">
            “
          </span>
          <div className="eyebrow">Today’s words</div>
          <blockquote className="relative mt-3 font-display text-[20px] font-medium leading-snug tracking-tight text-ink">
            {quote.text}
          </blockquote>
          <figcaption className="mt-3 text-sm text-ink-soft">— {quote.by}</figcaption>
        </figure>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {[0, 1].map((i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${index === i ? 'w-4 bg-ink' : 'w-1.5 bg-line'}`} />
        ))}
      </div>
    </div>
  )
}

function DaySwitch({ which, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-surface p-0.5 text-[13px] font-semibold">
      {[
        ['today', 'Today'],
        ['yesterday', 'Yesterday'],
      ].map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={which === id}
          className={`rounded-full px-3.5 py-1.5 transition duration-300 ${which === id ? 'bg-ink text-canvas' : 'text-ink-soft'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Intention({ person, day }) {
  const { data, setIntention } = useStore()
  const saved = data.notes.find((n) => n.kind === 'intention' && n.person === person && n.day === day)
  const [draft, setDraft] = useState(saved?.body ?? '')
  const [justSaved, setJustSaved] = useState(false)
  const focused = useRef(false)

  // Pick up changes from the other phone unless we're mid-typing
  useEffect(() => {
    if (!focused.current) setDraft(saved?.body ?? '')
  }, [saved?.body])

  const save = () => {
    focused.current = false
    if ((saved?.body ?? '') === draft) return
    setIntention(person, day, draft)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1600)
  }

  return (
    <section className="h-full rounded-3xl bg-blue-soft p-5">
      <div className="eyebrow text-blue-deep">Inspiration</div>
      <p className="mt-2 font-display text-[19px] font-semibold leading-snug tracking-tight text-ink">{promptFor(day, person)}</p>
      <label className="mt-3 block">
        <span className="flex items-center justify-between text-xs text-ink-soft">
          Your intention for today
          <span className={`text-blue-deep transition-opacity duration-500 ${justSaved ? 'opacity-100' : 'opacity-0'}`}>Saved</span>
        </span>
        <textarea
          value={draft}
          onFocus={() => (focused.current = true)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          rows={2}
          placeholder="One line is plenty…"
          className="field mt-2 resize-none"
        />
      </label>
    </section>
  )
}

import { useEffect } from 'react'
import { useStore } from '../lib/store'
import { dailyRatio, monthRecap } from '../lib/stats'
import { monthDays, monthKey, monthName, prevMonth, todayKey } from '../lib/dates'
import { PEOPLE } from '../lib/constants'
import { PERSON_HEX, THEME } from '../lib/theme'
import { burst } from '../lib/confetti'
import { ChevronIcon, CloseIcon, StreakIcon } from '../components/Icons'

const IDS = ['tegan', 'will']

const nextMonth = (m) => {
  const [y, mo] = m.split('-').map(Number)
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`
}

export default function Recap({ month, onMonth, onClose }) {
  const { data } = useStore()
  const today = todayKey()
  const isCurrent = month === monthKey(today)
  const people = IDS.map((id) => ({ id, ...monthRecap(data, id, month) }))
  const totalTicks = people[0].ticks + people[1].ticks
  const together = monthDays(month)
    .filter((d) => d <= today)
    .filter((d) => IDS.every((id) => dailyRatio(data.goals, data.completions, id, d) === 1)).length

  useEffect(() => {
    if (totalTicks > 0) setTimeout(() => burst(window.innerWidth / 2, 140, 'big'), 350)
  }, [month])

  return (
    <div className="fixed inset-0 z-50 animate-rise overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-md px-5 pb-16 pt-[calc(env(safe-area-inset-top)+14px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-0.5">
            <button onClick={() => onMonth(prevMonth(month))} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full text-ink active:scale-90">
              <ChevronIcon dir="left" />
            </button>
            <span className="min-w-[96px] text-center text-sm font-semibold text-ink">{monthName(month, { month: 'short', year: 'numeric' })}</span>
            <button
              onClick={() => onMonth(nextMonth(month))}
              disabled={isCurrent}
              aria-label="Next month"
              className="grid h-9 w-9 place-items-center rounded-full text-ink active:scale-90 disabled:opacity-25"
            >
              <ChevronIcon dir="right" />
            </button>
          </div>
          <button onClick={onClose} aria-label="Close recap" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink active:scale-90">
            <CloseIcon size={16} />
          </button>
        </div>

        <section className="mt-8 text-center">
          <div className="eyebrow">{isCurrent ? 'So far this month' : 'Monthly recap'}</div>
          <h1 className="mt-2 font-display text-[40px] font-semibold leading-[1.05] tracking-tight text-ink">
            <span className="highlight" style={{ '--hl': THEME.yellow }}>
              {monthName(month)}
            </span>
            ,<br />
            together
          </h1>
        </section>

        {totalTicks === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-ink-soft/25 px-6 py-10 text-center text-sm text-ink-soft">
            Nothing ticked in {monthName(month)}. A fresh page.
          </p>
        ) : (
          <>
            <section className="mt-8 grid grid-cols-2 gap-3">
              <Big value={totalTicks} label="ticks between you" tone="bg-blue-soft" />
              <Big value={together} label={together === 1 ? 'day you both nailed it' : 'days you both nailed it'} tone="bg-pink-soft" />
            </section>

            {people.map((p) => (
              <section key={p.id} className={`mt-6 rounded-[28px] p-5 ${PEOPLE[p.id].soft}`}>
                <div className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PERSON_HEX[p.id] }} />
                  {PEOPLE[p.id].name}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
                  <Stat value={p.perfect} label={p.perfect === 1 ? 'perfect day' : 'perfect days'} />
                  <Stat value={p.best} label="longest run" suffix={p.best === 1 ? 'day' : 'days'} />
                  <Stat value={p.ticks} label="ticks" />
                  <Stat value={p.cheersGot} label="cheers received" />
                </div>
                {p.top && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface/70 px-4 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-yellow text-onaccent">
                      <StreakIcon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft">Most consistent</span>
                      <span className="block truncate text-[15px] font-semibold text-ink">{p.top.title}</span>
                      <span className="text-xs text-ink-soft">
                        {p.top.hit} of {p.top.of} days · {Math.round(p.top.rate * 100)}%
                      </span>
                    </span>
                  </div>
                )}
                {p.milestones.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Milestones reached</div>
                    <ul className="mt-1.5 space-y-1">
                      {p.milestones.map((m, i) => (
                        <li key={i} className="font-display text-lg font-semibold leading-snug text-ink">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function Big({ value, label, tone }) {
  return (
    <div className={`rounded-[28px] p-5 ${tone}`}>
      <div className="font-display text-5xl font-semibold leading-none tracking-tight text-ink">{value}</div>
      <div className="mt-2 text-sm leading-snug text-ink-soft">{label}</div>
    </div>
  )
}

function Stat({ value, label, suffix }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold leading-none text-ink">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-ink-soft">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </div>
  )
}

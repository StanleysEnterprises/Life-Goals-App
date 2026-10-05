import { useStore } from '../lib/store'
import { activeGoalsFor, dailyRatio, goalStreak, pct, quietWins, streak, weekConsistency, weekCount } from '../lib/stats'
import { fmt, lastDays, monthKey, monthName, relativeDay, todayKey, weekDays } from '../lib/dates'
import { CheerButton, CheerPills } from '../components/Cheers'
import { StreakIcon } from '../components/Icons'
import { PEOPLE } from '../lib/constants'
import { ProgressRing, Section, Stat } from '../components/ui'
import { heat, THEME } from '../lib/theme'

export default function Progress({ person, onRecap }) {
  const { data } = useStore()
  const { goals, completions } = data
  const today = todayKey()
  const todayRatio = dailyRatio(goals, completions, person, today)
  const s = streak(goals, completions, person, today)
  const week = weekConsistency(goals, completions, person, today)
  const wins = quietWins(goals, completions, person)
  const monthWins = wins.filter((w) => w.day.slice(0, 7) === today.slice(0, 7)).length
  const weeklies = activeGoalsFor(goals, person).filter((g) => g.type === 'weekly')
  const streaks = activeGoalsFor(goals, person)
    .filter((g) => g.type !== 'milestone')
    .map((g) => ({ g, n: goalStreak(g, person, completions, today) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)

  return (
    <div className="space-y-9">
      <section className="pt-3">
        <div className="eyebrow">{PEOPLE[person].name}’s</div>
        <h1 className="mt-1 font-display text-[34px] font-semibold text-ink"><span className="highlight" style={{ '--hl': THEME.mint }}>Progress</span></h1>
        <p className="mt-1 text-sm text-ink-soft">Consistency over intensity.</p>
      </section>

      <section className="card flex items-center gap-6 shadow-soft">
        <ProgressRing value={todayRatio} size={116}>
          <div>
            <div className="font-display text-3xl font-semibold text-ink">{pct(todayRatio)}</div>
            <div className="text-[11px] text-ink-soft">today</div>
          </div>
        </ProgressRing>
        <div className="grid flex-1 gap-4">
          <Stat value={s} label={s === 1 ? 'day in a row' : 'days in a row'} />
          <Stat value={pct(week)} label="this week" />
          <Stat value={monthWins} label={`quiet wins in ${fmt(today, { month: 'long' })}`} />
        </div>
      </section>

      <button
        onClick={() => onRecap(monthKey(today))}
        className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-yellow-soft to-blue-soft px-5 py-4 text-left transition active:scale-[0.98]"
      >
        <span>
          <span className="eyebrow">Monthly recap</span>
          <span className="mt-0.5 block font-display text-lg font-semibold text-ink">{monthName(monthKey(today))} so far</span>
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-yellow text-onaccent">→</span>
      </button>

      {streaks.length > 0 && (
        <Section title="Habit streaks">
          <ul className="space-y-2">
            {streaks.map(({ g, n }) => (
              <li key={g.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-yellow-soft text-yellow-deep">
                  <StreakIcon size={15} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{g.title}</span>
                <span className="font-display text-lg font-semibold text-ink">
                  {n}
                  <span className="ml-1 text-xs font-normal text-ink-soft">{g.type === 'weekly' ? (n === 1 ? 'week' : 'weeks') : n === 1 ? 'day' : 'days'}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="This week">
        <WeekStrip person={person} />
      </Section>

      <Section title="Last four weeks">
        <Mosaic person={person} />
      </Section>

      {weeklies.length > 0 && (
        <Section title="Weekly targets">
          <div className="space-y-4">
            {weeklies.map((g) => {
              const n = weekCount(completions, g, person, today)
              const t = g.target || 1
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink">{g.title}</span>
                    <span className="text-ink-soft">
                      {Math.min(n, t)}/{t}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-yellow-soft">
                    <div
                      className="h-full rounded-full bg-blue transition-all duration-1000 ease-calm"
                      style={{ width: `${Math.min(1, n / t) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      <Section title="Quiet wins">
        <WinsJournal wins={wins.slice(0, 20)} />
      </Section>
    </div>
  )
}

export function WeekStrip({ person }) {
  const { data } = useStore()
  const today = todayKey()
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays(today).map((d) => {
        const r = d <= today ? dailyRatio(data.goals, data.completions, person, d) : null
        return (
          <div key={d} className="flex flex-col items-center gap-2">
            <span className={`text-[11px] font-semibold ${d === today ? 'text-blue-deep' : 'text-ink-soft'}`}>
              {fmt(d, { weekday: 'narrow' })}
            </span>
            <span
              className={`relative grid h-9 w-9 place-items-center rounded-full border ${
                d === today ? 'border-blue' : 'border-line'
              } ${d > today ? 'border-dashed' : ''}`}
            >
              <span
                className="absolute inset-1 rounded-full bg-blue transition-all duration-700 ease-calm"
                style={{ opacity: r ?? 0, transform: `scale(${0.35 + (r ?? 0) * 0.65})` }}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Mosaic({ person }) {
  const { data } = useStore()
  const today = todayKey()
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {lastDays(28, today).map((d) => {
          const r = dailyRatio(data.goals, data.completions, person, d)
          return (
            <div
              key={d}
              title={`${relativeDay(d)}: ${pct(r)}`}
              className={`aspect-square rounded-lg ${r === null ? 'bg-surface' : ''} ${d === today ? 'ring-1 ring-blue-deep ring-offset-2 ring-offset-canvas' : ''}`}
              style={r !== null ? { background: heat(r) } : undefined}
            />
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-soft">
        Less
        {[0, 0.35, 0.7, 1].map((o) => (
          <span key={o} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: heat(o) }} />
        ))}
        More
      </div>
    </div>
  )
}

export function WinsJournal({ wins, showPerson = false }) {
  if (!wins.length)
    return (
      <p className="rounded-2xl border border-dashed border-ink-soft/25 px-5 py-6 text-center text-sm text-ink-soft">
        Finished milestones and full days will gather here, like a journal.
      </p>
    )
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {wins.map((w) => (
        <li key={w.id} className="relative">
          <span
            className={`absolute -left-[25px] top-1.5 h-2 w-2 rounded-full ring-4 ring-canvas ${
              w.kind === 'milestone' ? 'bg-pink' : w.kind === 'weekly' ? 'bg-blue' : 'bg-yellow'
            }`}
          />
          <div className="text-[11px] uppercase tracking-wider text-ink-soft">
            {relativeDay(w.day)}
            {showPerson && ` · ${PEOPLE[w.person].name}`}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={`mt-0.5 text-[15px] ${w.kind === 'milestone' ? 'font-display text-lg font-semibold text-ink' : 'text-ink'}`}>
                {w.text}
              </div>
              <div className="mt-1">
                <CheerPills refId={w.id} />
              </div>
            </div>
            <CheerButton to={w.person} refId={w.id} refText={w.text} className="shrink-0" />
          </div>
        </li>
      ))}
    </ol>
  )
}

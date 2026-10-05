import { useStore } from '../lib/store'
import { dailyRatio, isComplete, pct, quietWins, streak, weekConsistency } from '../lib/stats'
import { fmt, todayKey, weekDays } from '../lib/dates'
import { PEOPLE } from '../lib/constants'
import { ProgressRing, Section } from '../components/ui'
import { CheckCircle } from '../components/GoalItem'
import { WinsJournal } from './Progress'
import { PERSON_HEX, THEME } from '../lib/theme'

const COLORS = PERSON_HEX
const IDS = ['tegan', 'will']

export default function Compare() {
  const { data } = useStore()
  const { goals, completions } = data
  const today = todayKey()
  const month = today.slice(0, 7)

  const people = IDS.map((id) => {
    const wins = quietWins(goals, completions, id)
    return {
      id,
      today: dailyRatio(goals, completions, id, today),
      week: weekConsistency(goals, completions, id, today),
      streak: streak(goals, completions, id, today),
      wins,
      monthWins: wins.filter((w) => w.day.slice(0, 7) === month).length,
    }
  })

  const shared = goals.filter((g) => !g.archived && g.owner === 'both')
  const together = [...people[0].wins, ...people[1].wins].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 8)

  return (
    <div className="space-y-9">
      <section className="pt-3 text-center">
        <div className="eyebrow">Tegan &amp; Will</div>
        <h1 className="mt-1 font-display text-[34px] font-semibold text-ink">Side by <span className="highlight" style={{ '--hl': THEME.pink }}>side</span></h1>
        <p className="mt-1 text-sm text-ink-soft">Shared momentum, not a scoreboard.</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {people.map((p) => (
          <div key={p.id} className={`flex flex-col items-center rounded-3xl p-5 px-3 text-center ${PEOPLE[p.id].soft}`}>
            <div className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS[p.id] }} />
              {PEOPLE[p.id].name}
            </div>
            <div className="mt-4">
              <ProgressRing value={p.today} size={96} stroke={7} color={COLORS[p.id]} track={THEME.canvas}>
                <div>
                  <div className="font-display text-2xl font-semibold text-ink">{pct(p.today)}</div>
                  <div className="text-[10px] text-ink-soft">today</div>
                </div>
              </ProgressRing>
            </div>
            <dl className="mt-5 w-full space-y-2.5 text-sm">
              <Row label="This week" value={pct(p.week)} />
              <Row label="Streak" value={`${p.streak}d`} />
              <Row label="Wins this month" value={p.monthWins} />
            </dl>
          </div>
        ))}
      </section>

      <Section
        title="This week"
        aside={
          <span className="flex gap-3">
            {IDS.map((id) => (
              <span key={id} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[id] }} />
                {PEOPLE[id].name}
              </span>
            ))}
          </span>
        }
      >
        <div className="card grid grid-cols-7 gap-1 px-3">
          {weekDays(today).map((d) => (
            <div key={d} className="flex flex-col items-center gap-2">
              <span className={`text-[11px] font-semibold ${d === today ? 'text-blue-deep' : 'text-ink-soft'}`}>
                {fmt(d, { weekday: 'narrow' })}
              </span>
              <div className="flex h-20 items-end gap-1">
                {IDS.map((id) => {
                  const r = d <= today ? dailyRatio(goals, completions, id, d) : null
                  return (
                    <span key={id} className="relative h-full w-2.5 overflow-hidden rounded-full bg-line/60">
                      <span
                        className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-1000 ease-calm"
                        style={{ height: `${(r ?? 0) * 100}%`, background: COLORS[id] }}
                      />
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shared goals">
        {shared.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-soft/25 px-5 py-6 text-center text-sm text-ink-soft">
            Add a goal for “Both” and you’ll see each other’s progress on it here.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {shared.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{g.title}</span>
                {IDS.map((id) => (
                  <span key={id} className="flex flex-col items-center gap-0.5">
                    <span className="scale-[0.8]">
                      <CheckCircle checked={isComplete(g, id, completions, today)} />
                    </span>
                    <span className="text-[10px] font-semibold text-ink-soft">{PEOPLE[id].initial}</span>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Quiet wins, together">
        <WinsJournal wins={together} showPerson />
      </Section>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between border-t border-ink/10 pt-2.5">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-display text-lg font-semibold leading-none text-ink">{value}</dd>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { activeGoalsFor, isComplete } from '../lib/stats'
import { fmt, greeting, todayKey } from '../lib/dates'
import { promptFor, quoteFor } from '../lib/inspiration'
import { PEOPLE } from '../lib/constants'
import { PERSON_HEX } from '../lib/theme'
import GoalItem from '../components/GoalItem'
import { EmptyState, Section, SyncStatus } from '../components/ui'

export default function Today({ person, onAdd }) {
  const { data } = useStore()
  const day = todayKey()
  const goals = activeGoalsFor(data.goals, person)
  const dailies = goals.filter((g) => g.type === 'daily')
  const weeklies = goals.filter((g) => g.type === 'weekly')
  const milestones = goals
    .filter((g) => g.type === 'milestone' && !isComplete(g, person, data.completions, day))
    .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))
    .slice(0, 3)

  const done = dailies.filter((g) => isComplete(g, person, data.completions, day)).length
  const allDone = dailies.length > 0 && done === dailies.length
  const quote = quoteFor(day, person)

  return (
    <div className="space-y-9">
      <section className="pt-3">
        <div className="eyebrow flex items-center justify-between">
          <span>{fmt(day, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <SyncStatus />
        </div>
        <h1 className="mt-2 font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-ink">
          {greeting()},<br />
          <span className="highlight" style={{ '--hl': PERSON_HEX[person] }}>{PEOPLE[person].name}</span>
        </h1>

        {dailies.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-ink-soft">
              <span>{allDone ? 'Every habit done today. Well kept.' : 'Today’s rhythm'}</span>
              <span className="font-medium text-ink">
                {done} of {dailies.length}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-yellow-soft">
              <div
                className="h-full rounded-full bg-blue transition-all duration-1000 ease-calm"
                style={{ width: `${(done / dailies.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {goals.length === 0 && (
        <EmptyState
          title="A quiet start"
          body="Add a daily habit, a weekly target or a milestone. It only takes a moment."
          action="Add your first goal"
          onAction={onAdd}
        />
      )}

      {dailies.length > 0 && (
        <Section title="Daily habits">
          <ul className="space-y-2.5">
            {dailies.map((g) => (
              <GoalItem key={g.id} goal={g} person={person} day={day} />
            ))}
          </ul>
        </Section>
      )}

      {weeklies.length > 0 && (
        <Section title="This week">
          <ul className="space-y-2.5">
            {weeklies.map((g) => (
              <GoalItem key={g.id} goal={g} person={person} day={day} />
            ))}
          </ul>
        </Section>
      )}

      {milestones.length > 0 && (
        <Section title="On the horizon">
          <ul className="space-y-2.5">
            {milestones.map((g) => (
              <GoalItem key={g.id} goal={g} person={person} day={day} />
            ))}
          </ul>
        </Section>
      )}

      <figure className="relative overflow-hidden rounded-3xl bg-yellow-soft p-5">
        <span aria-hidden className="absolute right-5 top-3 font-display text-[64px] font-bold leading-none text-yellow">
          “
        </span>
        <div className="eyebrow">Today’s words</div>
        <blockquote className="relative mt-3 font-display text-[21px] font-medium leading-snug tracking-tight text-ink">
          {quote.text}
        </blockquote>
        <figcaption className="mt-3 text-sm text-ink-soft">— {quote.by}</figcaption>
      </figure>

      <Intention person={person} day={day} />
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
    <section className="rounded-3xl bg-blue-soft p-5">
      <div className="eyebrow text-blue-deep">Inspiration</div>
      <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink">{promptFor(day, person)}</p>
      <label className="mt-4 block">
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

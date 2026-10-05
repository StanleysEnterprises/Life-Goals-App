import { useState } from 'react'
import { useStore } from '../lib/store'
import { activeGoalsFor } from '../lib/stats'
import { CATEGORIES, PEOPLE, TYPES } from '../lib/constants'
import GoalItem from '../components/GoalItem'
import { Chip, EmptyState, Section } from '../components/ui'

export default function Goals({ person, onAdd }) {
  const { data } = useStore()
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState(false)

  const goals = activeGoalsFor(data.goals, person).filter((g) => category === 'all' || g.category === category)
  const total = activeGoalsFor(data.goals, person).length

  return (
    <div className="space-y-7">
      <section className="flex items-end justify-between pt-3">
        <div>
          <div className="eyebrow">{PEOPLE[person].name}’s</div>
          <h1 className="mt-1 font-display text-[34px] font-light text-ink">Goals</h1>
        </div>
        {total > 0 && (
          <button
            onClick={() => setEditing((e) => !e)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${editing ? 'bg-sage text-canvas' : 'bg-sand text-ink'}`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </section>

      {total > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      )}

      {total === 0 && (
        <EmptyState
          title="Nothing here yet"
          body="Goals can be just yours, or shared with both of you."
          action="Add a goal"
          onAction={onAdd}
        />
      )}

      {total > 0 && goals.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-soft">No goals in this category yet.</p>
      )}

      {TYPES.map((t) => {
        const list = goals.filter((g) => g.type === t.id)
        if (!list.length) return null
        return (
          <Section key={t.id} title={t.section} aside={list.length}>
            <ul className="space-y-2.5">
              {list.map((g) => (
                <GoalItem key={g.id} goal={g} person={person} editing={editing} />
              ))}
            </ul>
          </Section>
        )
      })}
    </div>
  )
}

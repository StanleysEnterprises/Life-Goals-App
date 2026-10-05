import { useState } from 'react'
import { useStore } from '../lib/store'
import { activeGoalsFor, retiredGoalsFor } from '../lib/stats'
import { CATEGORIES, PEOPLE, TYPES } from '../lib/constants'
import { fmt } from '../lib/dates'
import GoalItem from '../components/GoalItem'
import { THEME } from '../lib/theme'
import { Chip, EmptyState, Section } from '../components/ui'

export default function Goals({ person, onAdd, onEdit }) {
  const { data, reorderGoals, restoreGoal, deleteGoal } = useStore()
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState(false)
  const [showRetired, setShowRetired] = useState(false)

  const all = activeGoalsFor(data.goals, person)
  const goals = all.filter((g) => category === 'all' || g.category === category)
  const retired = retiredGoalsFor(data.goals, person)

  // Move a goal up/down within its section (order is shared by both phones)
  // (swaps within the full section, so a category filter doesn't scramble the rest)
  const move = (list, index, dir) => {
    const a = list[index]
    const b = list[index + dir]
    if (!a || !b) return
    const ids = all.filter((g) => g.type === a.type).map((g) => g.id)
    const ia = ids.indexOf(a.id)
    const ib = ids.indexOf(b.id)
    ;[ids[ia], ids[ib]] = [ids[ib], ids[ia]]
    reorderGoals(ids)
  }

  return (
    <div className="space-y-7">
      <section className="flex items-end justify-between pt-3">
        <div>
          <div className="eyebrow">{PEOPLE[person].name}’s</div>
          <h1 className="mt-1 font-display text-[34px] font-semibold text-ink">
            <span className="highlight" style={{ '--hl': THEME.blue }}>
              Goals
            </span>
          </h1>
        </div>
        {all.length > 0 && (
          <button
            onClick={() => setEditing((e) => !e)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${editing ? 'bg-ink text-canvas' : 'bg-blue-soft text-ink'}`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </section>

      {editing && (
        <p className="-mt-3 animate-rise rounded-2xl bg-yellow-soft px-4 py-3 text-sm text-ink">
          Tap a goal to rename or change it. Use the arrows to reorder.
        </p>
      )}

      {all.length > 0 && (
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

      {all.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          body="Goals can be just yours, or shared with both of you."
          action="Add a goal"
          onAction={onAdd}
        />
      )}

      {all.length > 0 && goals.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-soft">No goals in this category yet.</p>
      )}

      {TYPES.map((t) => {
        const list = goals.filter((g) => g.type === t.id)
        if (!list.length) return null
        return (
          <Section key={t.id} title={t.section} aside={list.length}>
            <ul className="space-y-2.5">
              {list.map((g, i) => (
                <GoalItem
                  key={g.id}
                  goal={g}
                  person={person}
                  editing={editing}
                  onEdit={onEdit}
                  onMove={(dir) => move(list, i, dir)}
                  canUp={i > 0}
                  canDown={i < list.length - 1}
                />
              ))}
            </ul>
          </Section>
        )
      })}

      {retired.length > 0 && (
        <section>
          <button
            onClick={() => setShowRetired((s) => !s)}
            className="eyebrow flex w-full items-center justify-between py-1"
            aria-expanded={showRetired}
          >
            <span>Retired · {retired.length}</span>
            <span className="normal-case tracking-normal">{showRetired ? 'Hide' : 'Show'}</span>
          </button>
          {showRetired && (
            <ul className="mt-3 animate-rise space-y-2.5">
              {retired.map((g) => (
                <RetiredItem key={g.id} goal={g} onRestore={() => restoreGoal(g.id)} onDelete={() => deleteGoal(g.id)} />
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-ink-soft">Retired goals still count in your past progress and streaks.</p>
        </section>
      )}
    </div>
  )
}

function RetiredItem({ goal, onRestore, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-ink-soft">{goal.title}</span>
        <span className="text-[11px] text-ink-soft/80">Retired {fmt(goal.retired_on, { day: 'numeric', month: 'short' })}</span>
      </span>
      <button onClick={onRestore} className="rounded-full bg-blue-soft px-3 py-1.5 text-xs font-semibold text-ink active:scale-95">
        Bring back
      </button>
      <button
        onClick={() => (confirm ? onDelete() : setConfirm(true))}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 ${confirm ? 'bg-pink text-onaccent' : 'bg-pink-soft text-ink'}`}
      >
        {confirm ? 'Sure?' : 'Delete'}
      </button>
    </li>
  )
}

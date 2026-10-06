import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { CATEGORIES, PEOPLE, TYPES } from '../lib/constants'
import { Chip } from './ui'
import Sheet, { SheetRow } from './Sheet'
import { PERIODS, guessPeriod } from '../lib/timeOfDay'

// Add a new goal, or edit one (pass `goal`)
export default function GoalSheet({ open, person, goal, onClose }) {
  const { addGoal, updateGoal, retireGoal, deleteGoal } = useStore()
  const input = useRef(null)
  const editing = Boolean(goal)
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState(person)
  const [type, setType] = useState('daily')
  const [target, setTarget] = useState(3)
  const [due, setDue] = useState('')
  const [category, setCategory] = useState('personal')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [when, setWhen] = useState(null) // morning | afternoon | evening | anytime
  const [whenPicked, setWhenPicked] = useState(false) // true once chosen by hand

  useEffect(() => {
    if (!open) return
    setTitle(goal?.title ?? '')
    setOwner(goal?.owner ?? person)
    setType(goal?.type ?? 'daily')
    setTarget(goal?.target ?? 3)
    setDue(goal?.due_date ?? '')
    setCategory(goal?.category ?? 'personal')
    setConfirmDelete(false)
    setWhen(goal?.time_of_day ?? (goal ? guessPeriod(goal.title) : null))
    setWhenPicked(Boolean(goal?.time_of_day))
    if (!goal) {
      const t = setTimeout(() => input.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [open, person, goal])

  // Guess the time of day from the title as you type, until you pick one yourself
  const onTitle = (v) => {
    setTitle(v)
    if (!whenPicked) setWhen(guessPeriod(v))
  }
  const pickWhen = (p) => {
    setWhen(p)
    setWhenPicked(true)
  }
  const guessed = when && !whenPicked
  const showWhen = type !== 'milestone'

  const pickOwner = (o) => {
    setOwner(o)
    if (o === 'both') setCategory('shared')
    else if (category === 'shared') setCategory('personal')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const fields = {
      title: title.trim(),
      owner,
      type,
      category,
      target: type === 'weekly' ? target : null,
      due_date: type === 'milestone' && due ? due : null,
      time_of_day: type === 'milestone' ? null : when ?? 'anytime',
    }
    if (editing) updateGoal(goal.id, fields)
    else addGoal(fields)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} onSubmit={submit} title={editing ? 'Edit goal' : 'A new goal'}>
      <input
        ref={input}
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder="e.g. Walk 8,000 steps"
        className="field mt-4"
        enterKeyHint="done"
        aria-label="Goal title"
      />

      <div className="mt-5 space-y-4">
        <SheetRow label="Who">
          {['tegan', 'will', 'both'].map((o) => (
            <Chip key={o} active={owner === o} onClick={() => pickOwner(o)}>
              {o === 'both' ? 'Both' : PEOPLE[o].name}
            </Chip>
          ))}
        </SheetRow>
        <SheetRow label="How often">
          {TYPES.map((t) => (
            <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </Chip>
          ))}
        </SheetRow>

        {showWhen && (
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="eyebrow">When</span>
              {guessed ? (
                <span className="animate-rise text-xs font-semibold text-blue-deep">guessed from the title</span>
              ) : (
                !when && title.trim() && <span className="animate-rise text-xs text-ink-soft">When do you usually do this?</span>
              )}
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {PERIODS.map((p) => (
                <Chip key={p.id} active={when === p.id} onClick={() => pickWhen(p.id)}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                    {p.label}
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {type === 'weekly' && (
          <SheetRow label="Times a week">
            <div className="flex items-center gap-3">
              <Stepper label="Fewer" onClick={() => setTarget((n) => Math.max(1, n - 1))}>
                −
              </Stepper>
              <span className="w-6 text-center font-display text-xl">{target}</span>
              <Stepper label="More" onClick={() => setTarget((n) => Math.min(7, n + 1))}>
                +
              </Stepper>
            </div>
          </SheetRow>
        )}
        {type === 'milestone' && (
          <SheetRow label="By (optional)" scroll={false}>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="field py-2" />
          </SheetRow>
        )}

        <SheetRow label="Category">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Chip>
          ))}
        </SheetRow>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-6 w-full rounded-2xl bg-yellow py-4 text-[15px] font-bold text-onaccent transition duration-300 active:scale-[0.98] disabled:opacity-40"
      >
        {editing ? 'Save changes' : 'Add goal'}
      </button>

      {editing && (
        <div className="mt-3 mb-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              retireGoal(goal.id)
              onClose()
            }}
            className="rounded-2xl bg-blue-soft py-3 text-sm font-semibold text-ink transition active:scale-[0.98]"
          >
            Retire
            <span className="block text-[11px] font-normal text-ink-soft">keeps its history</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              deleteGoal(goal.id)
              onClose()
            }}
            className={`rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${
              confirmDelete ? 'bg-pink text-onaccent' : 'bg-pink-soft text-ink'
            }`}
          >
            {confirmDelete ? 'Tap again to delete' : 'Delete forever'}
            <span className={`block text-[11px] font-normal ${confirmDelete ? 'text-onaccent/70' : 'text-ink-soft'}`}>
              removes all its ticks
            </span>
          </button>
        </div>
      )}
      {!editing && <div className="mb-2" />}
    </Sheet>
  )
}

function Stepper({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-ink transition active:scale-90"
    >
      {children}
    </button>
  )
}

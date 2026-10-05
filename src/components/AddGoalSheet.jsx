import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { CATEGORIES, PEOPLE, TYPES } from '../lib/constants'
import { Chip } from './ui'

export default function AddGoalSheet({ open, person, onClose }) {
  const { addGoal } = useStore()
  const input = useRef(null)
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState(person)
  const [type, setType] = useState('daily')
  const [target, setTarget] = useState(3)
  const [due, setDue] = useState('')
  const [category, setCategory] = useState('personal')

  useEffect(() => {
    if (!open) return
    setTitle('')
    setOwner(person)
    setType('daily')
    setTarget(3)
    setDue('')
    setCategory('personal')
    const t = setTimeout(() => input.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [open, person])

  const pickOwner = (o) => {
    setOwner(o)
    if (o === 'both') setCategory('shared')
    else if (category === 'shared') setCategory('personal')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addGoal({
      title: title.trim(),
      owner,
      type,
      category,
      target: type === 'weekly' ? target : null,
      due_date: type === 'milestone' && due ? due : null,
    })
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-shade/30 backdrop-blur-[2px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <form
        onSubmit={submit}
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[32px] bg-canvas border-t border-line px-5 pt-3 pb-safe shadow-soft transition-transform duration-500 ease-calm ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" />
        <h2 className="font-display text-2xl font-semibold text-ink">A new goal</h2>

        <input
          ref={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Walk 8,000 steps"
          className="field mt-4"
          enterKeyHint="done"
        />

        <div className="mt-5 space-y-4">
          <Row label="Who">
            {['tegan', 'will', 'both'].map((o) => (
              <Chip key={o} active={owner === o} onClick={() => pickOwner(o)}>
                {o === 'both' ? 'Both' : PEOPLE[o].name}
              </Chip>
            ))}
          </Row>
          <Row label="How often">
            {TYPES.map((t) => (
              <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
                {t.label}
              </Chip>
            ))}
          </Row>

          {type === 'weekly' && (
            <Row label="Times a week">
              <div className="flex items-center gap-3">
                <Stepper onClick={() => setTarget((n) => Math.max(1, n - 1))}>−</Stepper>
                <span className="w-6 text-center font-display text-xl">{target}</span>
                <Stepper onClick={() => setTarget((n) => Math.min(7, n + 1))}>+</Stepper>
              </div>
            </Row>
          )}
          {type === 'milestone' && (
            <Row label="By (optional)">
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="field py-2" />
            </Row>
          )}

          <Row label="Category">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </Chip>
            ))}
          </Row>
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="mt-6 mb-2 w-full rounded-2xl bg-yellow py-4 text-[15px] font-bold text-onaccent transition duration-300 active:scale-[0.98] disabled:opacity-40"
        >
          Add goal
        </button>
      </form>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">{children}</div>
    </div>
  )
}

function Stepper({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-ink transition active:scale-90"
    >
      {children}
    </button>
  )
}

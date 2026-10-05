import { useState } from 'react'
import { useStore } from '../lib/store'
import { PEOPLE } from '../lib/constants'
import { relativeDay } from '../lib/dates'
import { CloseIcon } from '../components/Icons'

export default function Notes({ person }) {
  const { data, addNote, removeNote } = useStore()
  const [draft, setDraft] = useState('')

  const notes = data.notes
    .filter((n) => n.kind === 'note' && n.person === person)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const save = () => {
    if (!draft.trim()) return
    addNote(person, draft.trim())
    setDraft('')
  }

  return (
    <div className="space-y-8">
      <section className="pt-3">
        <div className="eyebrow">{PEOPLE[person].name}’s</div>
        <h1 className="mt-1 font-display text-[34px] font-light text-ink">Notes</h1>
        <p className="mt-1 text-sm text-ink-soft">Thoughts, reflections, small things worth keeping.</p>
      </section>

      <section className="card p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="What’s on your mind?"
          className="w-full resize-none bg-transparent px-1 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/60"
        />
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={!draft.trim()}
            className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-canvas transition active:scale-95 disabled:opacity-35"
          >
            Save note
          </button>
        </div>
      </section>

      {notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">Your notes will appear here.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="group animate-rise rounded-2xl border border-taupe/30 bg-canvas px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <span className="eyebrow">
                  {relativeDay(n.day)} ·{' '}
                  {new Date(n.created_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => removeNote(n.id)}
                  aria-label="Delete note"
                  className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-ink-soft/60 transition active:scale-90 active:bg-sand"
                >
                  <CloseIcon size={13} />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

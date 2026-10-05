import { useState } from 'react'
import { useStore } from '../lib/store'
import { PEOPLE } from '../lib/constants'
import { relativeDay } from '../lib/dates'
import { CloseIcon } from '../components/Icons'
import { THEME } from '../lib/theme'

export default function Notes({ person }) {
  const { data, me, addNote, removeNote } = useStore()
  const [tab, setTab] = useState('mine')
  const [draft, setDraft] = useState('')

  const isUs = tab === 'us'
  // Private notes only show on their owner's phone
  const canSeeMine = !me || me === person
  const author = me ?? person

  const notes = data.notes
    .filter((n) => n.kind === 'note' && (isUs ? n.shared : !n.shared && n.person === person))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const save = () => {
    if (!draft.trim()) return
    addNote(isUs ? author : person, draft.trim(), isUs)
    setDraft('')
  }

  return (
    <div className="space-y-7">
      <section className="pt-3">
        <div className="eyebrow">{isUs ? 'Tegan & Will’s' : `${PEOPLE[person].name}’s`}</div>
        <h1 className="mt-1 font-display text-[34px] font-semibold text-ink">
          <span className="highlight" style={{ '--hl': THEME.pink }}>
            Notes
          </span>
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isUs ? 'A shared journal — you both see these.' : 'Thoughts, reflections, small things worth keeping.'}
        </p>
      </section>

      <div className="inline-flex rounded-full border border-line bg-surface p-0.5 text-[13px] font-semibold">
        {[
          ['mine', me && me !== person ? `${PEOPLE[person].name}’s` : 'Just mine'],
          ['us', 'Us'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`rounded-full px-4 py-1.5 transition duration-300 ${tab === id ? 'bg-ink text-canvas' : 'text-ink-soft'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isUs && !canSeeMine ? (
        <div className="rounded-3xl border border-dashed border-ink-soft/25 px-6 py-10 text-center">
          <p className="font-display text-xl font-semibold text-ink">Just for {PEOPLE[person].name}</p>
          <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-ink-soft">
            Private notes only show on {PEOPLE[person].name}’s own phone. Shared ones live under “Us”.
          </p>
        </div>
      ) : (
        <>
          <section className={`rounded-3xl border border-line p-4 ${isUs ? 'bg-pink-soft' : 'bg-surface'}`}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={isUs ? 'Something for both of you…' : 'What’s on your mind?'}
              className="w-full resize-none bg-transparent px-1 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/60"
            />
            <div className="flex items-center justify-between">
              <span className="px-1 text-xs text-ink-soft">{isUs ? `Posting as ${PEOPLE[author].name}` : 'Private'}</span>
              <button
                onClick={save}
                disabled={!draft.trim()}
                className="rounded-full bg-yellow px-5 py-2 text-sm font-bold text-onaccent transition active:scale-95 disabled:opacity-35"
              >
                {isUs ? 'Share' : 'Save note'}
              </button>
            </div>
          </section>

          {notes.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">
              {isUs ? 'Shared notes will appear here for both of you.' : 'Your notes will appear here.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="animate-rise rounded-2xl border border-line bg-surface px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="eyebrow flex items-center gap-1.5">
                      {isUs && (
                        <span
                          className={`grid h-4 w-4 place-items-center rounded-full text-[9px] text-onaccent ${PEOPLE[n.person].tone}`}
                        >
                          {PEOPLE[n.person].initial}
                        </span>
                      )}
                      {relativeDay(n.day)} ·{' '}
                      {new Date(n.created_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    {(!me || n.person === me) && (
                      <button
                        onClick={() => removeNote(n.id)}
                        aria-label="Delete note"
                        className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-ink-soft/60 transition active:scale-90 active:bg-line/70"
                      >
                        <CloseIcon size={13} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

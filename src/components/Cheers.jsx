import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { PEOPLE } from '../lib/constants'
import { burst } from '../lib/confetti'
import { HeartIcon } from './Icons'

export const EMOJIS = ['❤️', '👏', '🔥', '🥳']

// Cheers already sent on something, shown as little pills
export function CheerPills({ refId }) {
  const { data } = useStore()
  const list = (data.cheers ?? []).filter((c) => c.ref_id === refId)
  if (!list.length) return null
  return (
    <span className="inline-flex items-center gap-1">
      {list.map((c) => (
        <span
          key={c.id}
          title={`${PEOPLE[c.from_person].name} sent ${c.emoji}`}
          className="inline-flex animate-pop items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[11px] leading-none shadow-soft"
        >
          {c.emoji}
          <span className="text-[9px] font-bold text-ink-soft">{PEOPLE[c.from_person].initial}</span>
        </span>
      ))}
    </span>
  )
}

// A heart button that opens a tiny emoji picker. Only shows on the other person's things.
export function CheerButton({ to, refId, refText, className = '' }) {
  const { me, data, toggleCheer } = useStore()
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => !wrap.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  if (!me || me === to) return null
  const sent = (data.cheers ?? []).filter((c) => c.from_person === me && c.ref_id === refId).map((c) => c.emoji)

  const send = (emoji, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!sent.includes(emoji)) burst(r.left + r.width / 2, r.top + r.height / 2, 'mini')
    toggleCheer({ from: me, to, refId, refText, emoji })
    setOpen(false)
  }

  return (
    <span ref={wrap} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Cheer ${PEOPLE[to].name} on`}
        aria-expanded={open}
        className={`grid h-9 w-9 place-items-center rounded-full transition active:scale-90 ${
          sent.length ? 'bg-pink text-onaccent' : 'bg-pink-soft text-ink'
        }`}
      >
        <HeartIcon />
      </button>
      {open && (
        <span className="absolute bottom-full right-0 z-20 mb-2 flex animate-rise gap-1 rounded-full border border-line bg-surface p-1 shadow-soft">
          {EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={(e) => send(em, e)}
              aria-label={`Send ${em}`}
              className={`grid h-10 w-10 place-items-center rounded-full text-xl transition active:scale-90 ${
                sent.includes(em) ? 'bg-pink-soft' : ''
              }`}
            >
              {em}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

// Pop-up when the other person cheers you (shown on your own phone)
export function CheerToasts() {
  const { me, data, markCheerSeen } = useStore()
  const incoming = (data.cheers ?? [])
    .filter((c) => c.to_person === me && !c.seen)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const current = incoming[0]

  useEffect(() => {
    if (!current) return
    burst(window.innerWidth / 2, 110, 'mini')
    const t = setTimeout(() => markCheerSeen(current.id), 4500)
    return () => clearTimeout(t)
  }, [current?.id])

  if (!current) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+76px)] z-40 flex justify-center px-4">
    <button
      key={current.id}
      onClick={() => markCheerSeen(current.id)}
      className="pointer-events-auto flex w-full max-w-[380px] animate-rise items-center gap-3 rounded-3xl border border-line bg-surface px-4 py-3 text-left shadow-soft"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pink-soft text-2xl">{current.emoji}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{PEOPLE[current.from_person].name} cheered you on</span>
        {current.ref_text && <span className="block truncate text-xs text-ink-soft">{current.ref_text}</span>}
      </span>
    </button>
    </div>
  )
}

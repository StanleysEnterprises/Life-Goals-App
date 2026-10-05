import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { PEOPLE } from '../lib/constants'
import { currentSubscription, disableReminders, enableReminders, pushBlocker, updateReminderOwner } from '../lib/push'
import { Chip } from './ui'
import Sheet, { SheetRow } from './Sheet'

const THEMES = [
  ['auto', 'Evenings (6pm–6am)'],
  ['dark', 'Always'],
  ['light', 'Never'],
]

export default function Settings({ open, onClose, theme }) {
  const { me, setMe, needsUpdate } = useStore()
  const [reminders, setReminders] = useState('checking') // checking | on | off | working
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!open) return
    setMessage(null)
    currentSubscription()
      .then((s) => setReminders(s ? 'on' : 'off'))
      .catch(() => setReminders('off'))
  }, [open])

  const changeOwner = (p) => {
    setMe(p)
    updateReminderOwner(p).catch(() => {})
  }

  const toggleReminders = async () => {
    setMessage(null)
    if (reminders === 'on') {
      setReminders('working')
      await disableReminders().catch(() => {})
      setReminders('off')
      return
    }
    const blocked = pushBlocker()
    if (blocked) return setMessage(blocked)
    if (!me) return setMessage('Pick whose phone this is first.')
    setReminders('working')
    try {
      await enableReminders(me)
      setReminders('on')
      setMessage('Done — you’ll get a nudge at 7pm if any habits are left, and a buzz when you’re cheered.')
    } catch (err) {
      setReminders('off')
      setMessage(err.message)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="mt-5 space-y-6 pb-4">
        <SheetRow label="This phone belongs to">
          {['tegan', 'will'].map((p) => (
            <Chip key={p} active={me === p} onClick={() => changeOwner(p)}>
              {PEOPLE[p].name}
            </Chip>
          ))}
        </SheetRow>

        <SheetRow label="Dark mode">
          {THEMES.map(([id, label]) => (
            <Chip key={id} active={theme.mode === id} onClick={() => theme.setMode(id)}>
              {label}
            </Chip>
          ))}
        </SheetRow>

        <div>
          <div className="eyebrow mb-2">Reminders</div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5">
            <div>
              <div className="text-[15px] font-semibold text-ink">Evening nudge & cheers</div>
              <div className="text-xs text-ink-soft">7pm if habits are left · when you’re cheered</div>
            </div>
            <button
              onClick={toggleReminders}
              disabled={reminders === 'checking' || reminders === 'working'}
              role="switch"
              aria-checked={reminders === 'on'}
              aria-label="Reminders"
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-60 ${
                reminders === 'on' ? 'bg-blue' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-surface shadow-soft transition-all duration-300 ease-bouncy ${
                  reminders === 'on' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          {message && <p className="mt-2 animate-rise px-1 text-sm text-ink-soft">{message}</p>}
        </div>

        {needsUpdate && (
          <p className="rounded-2xl bg-pink-soft px-4 py-3 text-sm text-ink">
            The database needs a one-time update for cheers, check-ins and shared notes. Run{' '}
            <code className="font-semibold">supabase/002_features.sql</code> in Supabase.
          </p>
        )}
      </div>
    </Sheet>
  )
}

// First open on a phone: whose is it?
export function WhosePhone({ onPick }) {
  return (
    <div className="fixed inset-0 z-[70] grid animate-rise place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm text-center">
        <div className="eyebrow">Welcome</div>
        <h1 className="mt-2 font-display text-[36px] font-semibold leading-tight tracking-tight text-ink">
          Whose phone
          <br />
          is this?
        </h1>
        <p className="mt-3 text-sm text-ink-soft">It’ll open on your tab, and cheers will come from you.</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {['tegan', 'will'].map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className={`rounded-[28px] py-8 font-display text-2xl font-semibold text-onaccent shadow-soft transition duration-300 ease-bouncy active:scale-95 ${PEOPLE[p].tone}`}
            >
              {PEOPLE[p].name}
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-soft">You can change this later in settings.</p>
      </div>
    </div>
  )
}

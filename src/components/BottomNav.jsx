import { CompareIcon, NotesIcon, PlusIcon, ProgressIcon, SunIcon, TargetIcon } from './Icons'

const ITEMS = [
  { id: 'today', label: 'Today', Icon: SunIcon },
  { id: 'goals', label: 'Goals', Icon: TargetIcon },
  { id: 'progress', label: 'Progress', Icon: ProgressIcon },
  { id: 'notes', label: 'Notes', Icon: NotesIcon },
]

export default function BottomNav({ view, onChange, showAdd, onAdd }) {
  const comparing = view === 'compare'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-safe">
      <button
        onClick={onAdd}
        aria-label="Add a goal"
        className={`pointer-events-auto absolute -top-[70px] right-5 grid h-14 w-14 place-items-center rounded-full bg-yellow text-ink shadow-soft ring-4 ring-canvas transition duration-500 ease-bouncy active:scale-90 ${
          showAdd ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <PlusIcon />
      </button>

      <nav className="pointer-events-auto flex items-center gap-1 rounded-[28px] border border-line bg-surface/90 p-1.5 shadow-soft backdrop-blur-md">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-[22px] py-2 text-[10.5px] font-semibold tracking-wide transition duration-300 ease-calm active:scale-95 ${
                active ? 'text-blue-deep' : 'text-ink-soft'
              }`}
            >
              <Icon />
              {label}
              <span className={`mt-0.5 h-1 w-1 rounded-full bg-yellow-deep transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          )
        })}

        <button
          onClick={() => onChange('compare')}
          aria-current={comparing ? 'page' : undefined}
          className={`ml-1 flex flex-col items-center gap-0.5 rounded-[22px] px-3.5 py-2 text-[10.5px] font-semibold tracking-wide transition duration-300 ease-calm active:scale-95 ${
            comparing ? 'bg-ink text-canvas' : 'bg-yellow-soft text-ink'
          }`}
        >
          <CompareIcon />
          Compare
          <span className="mt-0.5 h-1 w-1" />
        </button>
      </nav>
    </div>
  )
}

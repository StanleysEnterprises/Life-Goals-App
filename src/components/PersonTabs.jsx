import { PEOPLE } from '../lib/constants'

export default function PersonTabs({ person, comparing, onSelect }) {
  const index = person === 'will' ? 1 : 0
  const indicator = comparing
    ? { width: 'calc(100% - 8px)', transform: 'translateX(0)', opacity: 0.6 }
    : { width: 'calc(50% - 4px)', transform: `translateX(${index * 100}%)`, opacity: 1 }

  return (
    <div role="tablist" className="relative grid grid-cols-2 rounded-full border border-taupe/25 bg-sand/70 p-1">
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-canvas shadow-soft transition-all duration-500 ease-calm"
        style={indicator}
      />
      {['tegan', 'will'].map((p) => {
        const active = !comparing && person === p
        return (
          <button
            key={p}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(p)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-full py-2.5 font-display text-[18px] transition-colors duration-300 ${
              active || comparing ? 'text-ink' : 'text-ink-soft'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${PEOPLE[p].tone} ${
                active || comparing ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
            {PEOPLE[p].name}
          </button>
        )
      })}
    </div>
  )
}

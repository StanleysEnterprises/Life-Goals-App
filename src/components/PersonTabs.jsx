import { PEOPLE } from '../lib/constants'
import { PERSON_HEX } from '../lib/theme'

export default function PersonTabs({ person, comparing, onSelect }) {
  const index = person === 'will' ? 1 : 0
  const indicator = comparing
    ? {
        width: 'calc(100% - 8px)',
        transform: 'translateX(0)',
        background: `linear-gradient(90deg, ${PERSON_HEX.tegan}, ${PERSON_HEX.will})`,
      }
    : {
        width: 'calc(50% - 4px)',
        transform: `translateX(${index * 100}%)`,
        background: PERSON_HEX[person],
      }

  return (
    <div role="tablist" className="relative grid grid-cols-2 rounded-full border border-line bg-surface p-1 shadow-soft">
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full transition-all duration-500 ease-bouncy"
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
            className={`relative z-10 rounded-full py-2.5 font-display text-[18px] font-semibold transition-colors duration-300 ${
              active || comparing ? 'text-onaccent' : 'text-ink-soft'
            }`}
          >
            {PEOPLE[p].name}
          </button>
        )
      })}
    </div>
  )
}

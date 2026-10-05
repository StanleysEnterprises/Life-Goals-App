import { useStore } from '../lib/store'

export function Section({ title, aside, children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="eyebrow">{title}</h2>
        {aside && <div className="text-xs text-ink-soft">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition duration-300 ease-calm active:scale-95 ${
        active ? 'border-sage bg-sage text-canvas' : 'border-taupe/40 bg-canvas text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

export function ProgressRing({ value, size = 120, stroke = 8, color = '#5D866C', track = '#E6D8C3', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value ?? 0))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function EmptyState({ title, body, action, onAction }) {
  return (
    <div className="rounded-3xl border border-dashed border-taupe/50 px-6 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-ink-soft">{body}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-5 rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-canvas transition active:scale-95"
        >
          {action}
        </button>
      )}
    </div>
  )
}

const STATUS = {
  live: ['bg-sage', 'Synced'],
  connecting: ['bg-taupe animate-pulse', 'Connecting'],
  local: ['bg-taupe', 'This phone only'],
  error: ['bg-taupe', 'Offline'],
}

export function SyncStatus() {
  const { status } = useStore()
  const [dot, label] = STATUS[status]
  return (
    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

export function Stat({ label, value, sub }) {
  return (
    <div>
      <div className="font-display text-2xl leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-xs text-ink-soft">{label}</div>
      {sub && <div className="text-[11px] text-ink-soft/70">{sub}</div>}
    </div>
  )
}

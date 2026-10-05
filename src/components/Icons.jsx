const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const SunIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </svg>
)

export const TargetIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
)

export const ProgressIcon = () => (
  <svg {...base}>
    <path d="M3.5 17.5l5-5 4 3.5 8-8.5" />
    <path d="M15.5 7.5h5v5" />
  </svg>
)

export const NotesIcon = () => (
  <svg {...base}>
    <path d="M6 3.5h9l3.5 3.5v13.5H6z" />
    <path d="M9 11h6M9 14.5h6M9 18h3.5" />
  </svg>
)

export const CompareIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="12" r="5.5" />
    <circle cx="15" cy="12" r="5.5" />
  </svg>
)

export const PlusIcon = () => (
  <svg {...base} strokeWidth={1.8}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const CloseIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const MoonIcon = () => (
  <svg {...base} width={19} height={19}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
)

export const SunSmallIcon = () => (
  <svg {...base} width={19} height={19}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </svg>
)

export const PencilIcon = ({ size = 15 }) => (
  <svg {...base} width={size} height={size}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
)

export const ChevronIcon = ({ dir = 'up', size = 15 }) => (
  <svg {...base} width={size} height={size} style={{ transform: { up: 'none', down: 'rotate(180deg)', left: 'rotate(-90deg)', right: 'rotate(90deg)' }[dir] }}>
    <path d="M6 15l6-6 6 6" />
  </svg>
)

export const HeartIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
)

export const StreakIcon = ({ size = 11 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4 2.5-5.2.2 1.7 1 2.7 2 3.2-.6-3.2-.2-6.2.5-9z" />
  </svg>
)

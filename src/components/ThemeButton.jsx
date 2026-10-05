import { useState } from 'react'
import { useTheme } from '../lib/useTheme'
import { MoonIcon, SunSmallIcon } from './Icons'

const LABELS = {
  auto: 'Evening mode: automatic, 6pm to 6am',
  dark: 'Evening mode: always on',
  light: 'Evening mode: off',
}

export default function ThemeButton() {
  const { mode, dark, cycle } = useTheme()
  const [toast, setToast] = useState(null)

  const onClick = () => {
    const next = cycle()
    setToast({ text: LABELS[next], key: Date.now() })
  }

  return (
    <>
      <button
        onClick={onClick}
        aria-label={`${LABELS[mode]}. Tap to change.`}
        className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink shadow-soft transition duration-300 ease-bouncy active:scale-90"
      >
        <span key={dark ? 'moon' : 'sun'} className="animate-pop">
          {dark ? <MoonIcon /> : <SunSmallIcon />}
        </span>
        {mode === 'auto' && (
          <span className="absolute -bottom-0.5 -right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-yellow text-[9px] font-extrabold text-onaccent ring-2 ring-canvas">
            A
          </span>
        )}
      </button>
      {toast && (
        <div
          key={toast.key}
          onAnimationEnd={() => setToast(null)}
          className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+72px)] z-40 animate-toast whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-canvas shadow-soft"
        >
          {toast.text}
        </div>
      )}
    </>
  )
}

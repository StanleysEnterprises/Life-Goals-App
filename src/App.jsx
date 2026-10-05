import { useEffect, useState } from 'react'
import PersonTabs from './components/PersonTabs'
import BottomNav from './components/BottomNav'
import GoalSheet from './components/GoalSheet'
import Settings, { WhosePhone } from './components/Settings'
import { CheerToasts } from './components/Cheers'
import { MoonIcon, SunSmallIcon } from './components/Icons'
import Today from './views/Today'
import Goals from './views/Goals'
import Progress from './views/Progress'
import Notes from './views/Notes'
import Compare from './views/Compare'
import Recap from './views/Recap'
import { useStore } from './lib/store'
import { useTheme } from './lib/useTheme'
import { PEOPLE } from './lib/constants'

const VIEWS = { today: Today, goals: Goals, progress: Progress, notes: Notes }

export default function App() {
  const { me, setMe, needsUpdate } = useStore()
  const theme = useTheme()
  // Each phone opens on its owner's tab
  const [person, setPerson] = useState(me ?? 'tegan')
  const [view, setView] = useState('today')
  const [sheet, setSheet] = useState(null) // null | { goal?: goal }
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [recapMonth, setRecapMonth] = useState(null)

  useEffect(() => window.scrollTo({ top: 0 }), [view, person])

  const selectPerson = (p) => {
    setPerson(p)
    if (view === 'compare') setView('today')
  }

  const pickOwner = (p) => {
    setMe(p)
    setPerson(p)
  }

  const comparing = view === 'compare'
  const View = VIEWS[view]

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-20 bg-canvas/85 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <PersonTabs person={person} comparing={comparing} onSelect={selectPerson} />
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink shadow-soft transition duration-300 ease-bouncy active:scale-90"
          >
            {theme.dark ? <MoonIcon /> : <SunSmallIcon />}
            {me && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full text-[9px] font-extrabold text-onaccent ring-2 ring-canvas ${PEOPLE[me].tone}`}
              >
                {PEOPLE[me].initial}
              </span>
            )}
          </button>
        </div>
      </header>

      {needsUpdate && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="mx-5 mt-1 rounded-2xl bg-pink-soft px-4 py-2.5 text-left text-xs text-ink"
        >
          <b>One-time database update needed</b> for cheers, check-ins and shared notes. Tap for details.
        </button>
      )}

      <main key={`${view}-${person}`} className="flex-1 animate-rise px-5 pb-40 pt-3">
        {comparing ? (
          <Compare />
        ) : (
          <View
            person={person}
            onAdd={() => setSheet({})}
            onEdit={(goal) => setSheet({ goal })}
            onRecap={setRecapMonth}
          />
        )}
      </main>

      <BottomNav view={view} onChange={setView} showAdd={view === 'today' || view === 'goals'} onAdd={() => setSheet({})} />
      <GoalSheet open={Boolean(sheet)} person={person} goal={sheet?.goal} onClose={() => setSheet(null)} />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} />
      <CheerToasts />
      {recapMonth && <Recap month={recapMonth} onMonth={setRecapMonth} onClose={() => setRecapMonth(null)} />}
      {!me && <WhosePhone onPick={pickOwner} />}
    </div>
  )
}

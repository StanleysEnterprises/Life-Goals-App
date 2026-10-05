import { useEffect, useState } from 'react'
import PersonTabs from './components/PersonTabs'
import BottomNav from './components/BottomNav'
import AddGoalSheet from './components/AddGoalSheet'
import Today from './views/Today'
import Goals from './views/Goals'
import Progress from './views/Progress'
import Notes from './views/Notes'
import Compare from './views/Compare'

const VIEWS = { today: Today, goals: Goals, progress: Progress, notes: Notes }

const remembered = () => {
  try {
    return localStorage.getItem('tw:person') === 'will' ? 'will' : 'tegan'
  } catch {
    return 'tegan'
  }
}

export default function App() {
  const [person, setPerson] = useState(remembered)
  const [view, setView] = useState('today')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('tw:person', person)
    } catch {}
  }, [person])

  useEffect(() => window.scrollTo({ top: 0 }), [view, person])

  const selectPerson = (p) => {
    setPerson(p)
    if (view === 'compare') setView('today')
  }

  const comparing = view === 'compare'
  const View = VIEWS[view]

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-20 bg-canvas/85 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-md">
        <PersonTabs person={person} comparing={comparing} onSelect={selectPerson} />
      </header>

      <main key={`${view}-${person}`} className="flex-1 animate-rise px-5 pb-40 pt-3">
        {comparing ? <Compare /> : <View person={person} onAdd={() => setAdding(true)} />}
      </main>

      <BottomNav
        view={view}
        onChange={setView}
        showAdd={view === 'today' || view === 'goals'}
        onAdd={() => setAdding(true)}
      />
      <AddGoalSheet open={adding} person={person} onClose={() => setAdding(false)} />
    </div>
  )
}

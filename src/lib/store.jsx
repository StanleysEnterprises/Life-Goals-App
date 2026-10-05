import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { todayKey } from './dates'

// Accepts our own VITE_ names or the NEXT_PUBLIC_ names the Vercel ↔ Supabase integration creates
const env = import.meta.env
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null

const TABLES = ['goals', 'completions', 'notes']
const LOCAL_KEY = 'tw:data:v1'
const EMPTY = { goals: [], completions: [], notes: [] }

const uid = () =>
  crypto.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

const now = () => new Date().toISOString()

const loadLocal = () => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(LOCAL_KEY)) }
  } catch {
    return EMPTY
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => (supabase ? EMPTY : loadLocal()))
  // 'local' = this phone only, 'connecting', 'live' = syncing, 'error'
  const [status, setStatus] = useState(supabase ? 'connecting' : 'local')
  const dataRef = useRef(data)
  dataRef.current = data

  // Local mode: persist to the browser
  useEffect(() => {
    if (supabase) return
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const fetchAll = useCallback(async () => {
    const res = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')))
    const failed = res.find((r) => r.error)
    if (failed) {
      console.error(failed.error)
      setStatus('error')
      return
    }
    setData(Object.fromEntries(TABLES.map((t, i) => [t, res[i].data])))
    setStatus('live')
  }, [])

  // Sync mode: initial load + realtime updates from the other phone
  useEffect(() => {
    if (!supabase) return
    fetchAll()
    const channel = supabase
      .channel('tegan-will')
      .on('postgres_changes', { event: '*', schema: 'public' }, (p) => {
        if (!TABLES.includes(p.table)) return
        setData((prev) => {
          const rows = prev[p.table]
          if (p.eventType === 'DELETE') return { ...prev, [p.table]: rows.filter((r) => r.id !== p.old.id) }
          const exists = rows.some((r) => r.id === p.new.id)
          return {
            ...prev,
            [p.table]: exists ? rows.map((r) => (r.id === p.new.id ? p.new : r)) : [...rows, p.new],
          }
        })
      })
      .subscribe()
    // Phones suspend tabs — catch up whenever the app comes back into view
    const onVisible = () => document.visibilityState === 'visible' && fetchAll()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchAll])

  // Optimistic writes: update the screen instantly, then persist
  const persist = useCallback(
    async (query) => {
      if (!supabase) return
      const { error } = await query
      if (error) {
        console.error(error)
        fetchAll()
      }
    },
    [fetchAll],
  )

  const insert = useCallback(
    (table, row) => {
      setData((p) => ({ ...p, [table]: [...p[table], row] }))
      if (supabase) persist(supabase.from(table).insert(row))
    },
    [persist],
  )

  const update = useCallback(
    (table, id, patch) => {
      setData((p) => ({ ...p, [table]: p[table].map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
      if (supabase) persist(supabase.from(table).update(patch).eq('id', id))
    },
    [persist],
  )

  const remove = useCallback(
    (table, id) => {
      setData((p) => ({ ...p, [table]: p[table].filter((r) => r.id !== id) }))
      if (supabase) persist(supabase.from(table).delete().eq('id', id))
    },
    [persist],
  )

  const actions = useMemo(
    () => ({
      addGoal: (fields) =>
        insert('goals', { id: uid(), created_at: now(), archived: false, target: null, due_date: null, ...fields }),

      archiveGoal: (id) => update('goals', id, { archived: true }),

      // Daily: toggles that day. Weekly: toggles today's tick. Milestone: done / undone.
      toggle: (goal, person, day = todayKey()) => {
        const own = dataRef.current.completions.filter((c) => c.goal_id === goal.id && c.person === person)
        const existing = goal.type === 'milestone' ? own[0] : own.find((c) => c.day === day)
        if (existing) remove('completions', existing.id)
        else insert('completions', { id: uid(), goal_id: goal.id, person, day, created_at: now() })
      },

      addNote: (person, body) =>
        insert('notes', { id: uid(), person, body, kind: 'note', day: todayKey(), created_at: now() }),

      removeNote: (id) => remove('notes', id),

      setIntention: (person, day, body) => {
        const existing = dataRef.current.notes.find(
          (n) => n.kind === 'intention' && n.person === person && n.day === day,
        )
        if (existing) {
          if (existing.body !== body) update('notes', existing.id, { body })
        } else if (body.trim()) {
          insert('notes', { id: uid(), person, body, kind: 'intention', day, created_at: now() })
        }
      },
    }),
    [insert, update, remove],
  )

  return <StoreContext.Provider value={{ data, status, ...actions }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)

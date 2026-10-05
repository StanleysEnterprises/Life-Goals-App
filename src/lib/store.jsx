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

const CORE = ['goals', 'completions', 'notes']
const TABLES = [...CORE, 'cheers'] // cheers arrive with database update #2
const LOCAL_KEY = 'tw:data:v1'
const ME_KEY = 'tw:me'
const EMPTY = { goals: [], completions: [], notes: [], cheers: [] }

export const uid = () =>
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

const readMe = () => {
  try {
    const v = localStorage.getItem(ME_KEY)
    return v === 'tegan' || v === 'will' ? v : null
  } catch {
    return null
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => (supabase ? EMPTY : loadLocal()))
  // 'local' = this phone only, 'connecting', 'live' = syncing, 'error'
  const [status, setStatus] = useState(supabase ? 'connecting' : 'local')
  const [needsUpdate, setNeedsUpdate] = useState(false) // database update #2 not run yet
  const [me, setMeState] = useState(readMe) // whose phone this is
  const dataRef = useRef(data)
  dataRef.current = data

  const setMe = useCallback((p) => {
    setMeState(p)
    try {
      localStorage.setItem(ME_KEY, p)
    } catch {}
  }, [])

  // Local mode: persist to the browser
  useEffect(() => {
    if (supabase) return
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const fetchAll = useCallback(async () => {
    const res = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')))
    const coreFailed = res.slice(0, CORE.length).find((r) => r.error)
    if (coreFailed) {
      console.error(coreFailed.error)
      setStatus('error')
      return
    }
    const next = Object.fromEntries(TABLES.map((t, i) => [t, res[i].error ? [] : res[i].data]))
    const missingColumns = next.goals.length > 0 && !('retired_on' in next.goals[0])
    setNeedsUpdate(Boolean(res[CORE.length].error) || missingColumns)
    setData(next)
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
          const rows = prev[p.table] ?? []
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
      setData((p) => ({ ...p, [table]: [...(p[table] ?? []), row] }))
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
      // ── Goals ──
      addGoal: (fields) =>
        insert('goals', {
          id: uid(),
          created_at: now(),
          archived: false,
          target: null,
          due_date: null,
          retired_on: null,
          sort_order: Date.now(),
          ...fields,
        }),

      updateGoal: (id, patch) => update('goals', id, patch),

      // Retire = stop showing it from today on, but keep every past tick in your stats
      retireGoal: (id) => update('goals', id, { retired_on: todayKey() }),
      restoreGoal: (id) => update('goals', id, { retired_on: null }),

      // Delete forever = gone, along with its ticks (for mistakes)
      deleteGoal: (id) => {
        setData((p) => ({
          ...p,
          goals: p.goals.filter((g) => g.id !== id),
          completions: p.completions.filter((c) => c.goal_id !== id),
        }))
        if (supabase) persist(supabase.from('goals').delete().eq('id', id))
      },

      // Save a new order for a list of goal ids
      reorderGoals: (ids) => {
        const current = Object.fromEntries(dataRef.current.goals.map((g) => [g.id, g.sort_order]))
        ids.forEach((id, i) => current[id] !== i && update('goals', id, { sort_order: i }))
      },

      // Daily: toggles that day. Weekly: toggles that day's tick. Milestone: done / undone.
      toggle: (goal, person, day = todayKey()) => {
        const own = dataRef.current.completions.filter((c) => c.goal_id === goal.id && c.person === person)
        const existing = goal.type === 'milestone' ? own[0] : own.find((c) => c.day === day)
        if (existing) remove('completions', existing.id)
        else insert('completions', { id: uid(), goal_id: goal.id, person, day, created_at: now() })
      },

      // ── Notes ──
      addNote: (person, body, shared = false) =>
        insert('notes', { id: uid(), person, body, kind: 'note', shared, day: todayKey(), created_at: now() }),

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

      // Weekly check-in, stored against the Monday of the week being reflected on
      saveCheckin: (person, week, answers) => {
        const body = JSON.stringify(answers)
        const existing = dataRef.current.notes.find((n) => n.kind === 'checkin' && n.person === person && n.day === week)
        if (existing) update('notes', existing.id, { body })
        else insert('notes', { id: uid(), person, body, kind: 'checkin', day: week, created_at: now() })
      },

      // ── Cheers ──
      // Tapping the same emoji again takes it back
      toggleCheer: ({ from, to, refId, refText, emoji }) => {
        const existing = (dataRef.current.cheers ?? []).find(
          (c) => c.from_person === from && c.ref_id === refId && c.emoji === emoji,
        )
        if (existing) return remove('cheers', existing.id)
        insert('cheers', {
          id: uid(),
          from_person: from,
          to_person: to,
          ref_id: refId,
          ref_text: refText,
          emoji,
          seen: false,
          created_at: now(),
        })
        // Best effort: buzz their phone if they've turned on notifications
        if (supabase)
          fetch('/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, kind: 'cheer', from, emoji, text: refText }),
          }).catch(() => {})
      },

      markCheerSeen: (id) => update('cheers', id, { seen: true }),
    }),
    [insert, update, remove, persist],
  )

  return (
    <StoreContext.Provider value={{ data, status, needsUpdate, me, setMe, ...actions }}>{children}</StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)

import { useEffect, useState } from 'react'

// 'auto' = light by day, dark in the evening (6pm–6am). Saved per phone.
const KEY = 'tw:theme'
export const EVENING_START = 18
export const EVENING_END = 6

const isEvening = (d = new Date()) => d.getHours() >= EVENING_START || d.getHours() < EVENING_END

const read = () => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function useTheme() {
  const [mode, setMode] = useState(read)
  const [evening, setEvening] = useState(isEvening)

  // Re-check the clock every minute, and whenever the app is reopened
  useEffect(() => {
    const tick = () => setEvening(isEvening())
    const id = setInterval(tick, 60_000)
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const dark = mode === 'dark' || (mode === 'auto' && evening)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim().split(/\s+/).join(',')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${bg})`)
  }, [dark])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, mode)
    } catch {}
  }, [mode])

  const cycle = () => {
    const next = mode === 'auto' ? 'dark' : mode === 'dark' ? 'light' : 'auto'
    setMode(next)
    return next
  }

  return { mode, setMode, dark, cycle }
}

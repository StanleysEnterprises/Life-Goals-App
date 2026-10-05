import { supabase } from './store'

// Public half of the notification key pair (safe to share). The private half lives in Vercel as VAPID_PRIVATE_KEY.
export const VAPID_PUBLIC_KEY =
  'BMZXNxoKlR17p9O6Eivhz8rlbmg5eqH-15Awn62C0Ao0Tb6fOK2wFmZ2T3NzYO0wllQmCoSUawwOYeVKjbFOS6A'

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true

// Why reminders can't be turned on here (null = they can)
export function pushBlocker() {
  if (!supabase) return 'Reminders need syncing set up first.'
  if (!('serviceWorker' in navigator)) return 'This browser doesn’t support reminders.'
  if (isIOS() && !isStandalone()) return 'On iPhone, add the app to your Home Screen first, then open it from there.'
  if (!('PushManager' in window) || !('Notification' in window))
    return 'This browser doesn’t support reminders. On iPhone you need iOS 16.4 or later.'
  if (Notification.permission === 'denied') return 'Notifications are blocked — allow them in Settings → Notifications.'
  return null
}

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
}

const toKey = (base64) => {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function currentSubscription() {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.getRegistration()
  return (await reg?.pushManager?.getSubscription()) ?? null
}

// Must be called from a tap (iOS only asks for permission in response to one)
export async function enableReminders(person) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications weren’t allowed.')
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(VAPID_PUBLIC_KEY) }))
  const json = sub.toJSON()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ endpoint: json.endpoint, person, subscription: json }, { onConflict: 'endpoint' })
  if (error) throw new Error('Couldn’t save — has database update #2 been run?')
  return true
}

export async function disableReminders() {
  const sub = await currentSubscription()
  if (!sub) return
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
}

// Keep the saved owner in step if the phone's owner is changed in settings
export async function updateReminderOwner(person) {
  const sub = await currentSubscription()
  if (sub && supabase) await supabase.from('push_subscriptions').update({ person }).eq('endpoint', sub.endpoint)
}

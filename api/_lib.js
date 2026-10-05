// Shared helpers for the serverless functions (files starting with _ aren't exposed as routes).
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export const VAPID_PUBLIC_KEY =
  'BMZXNxoKlR17p9O6Eivhz8rlbmg5eqH-15Awn62C0Ao0Tb6fOK2wFmZ2T3NzYO0wllQmCoSUawwOYeVKjbFOS6A'

export const APP_TZ = 'Australia/Brisbane'
export const NAMES = { tegan: 'Tegan', will: 'Will' }

export function db() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

export function pushReady() {
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!priv) return false
  webpush.setVapidDetails('https://github.com/StanleysEnterprises/Life-Goals-App', VAPID_PUBLIC_KEY, priv)
  return true
}

// Send to every phone a person has turned reminders on for; tidy up dead subscriptions
export async function sendTo(supabase, person, payload) {
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*').eq('person', person)
  if (error) throw error
  let sent = 0
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(s.subscription, JSON.stringify(payload), { TTL: 60 * 60 * 6 })
      sent++
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      } else {
        console.error('push failed', err.statusCode, err.body)
      }
    }
  }
  return sent
}

// Today's date as YYYY-MM-DD in Brisbane
export function todayInAppTz() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

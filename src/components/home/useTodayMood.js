import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { cairoToday } from '../../lib/cairoDate.js'
import { supabase } from '../../lib/supabase.js'

// One mood check-in per day (Cairo time). After it, the home page hides the
// section until the next day.
// - Signed in: the row in mood_logs is the source of truth (unique per user/day).
// - Guest: only the date is remembered in this browser, never the mood itself.
const GUEST_KEY = 'miora-mood-day'

function guestDoneToday(today) {
  try {
    return localStorage.getItem(GUEST_KEY) === today
  } catch {
    return false
  }
}

function rememberGuest(today) {
  try {
    localStorage.setItem(GUEST_KEY, today)
  } catch {
    // Private mode or blocked storage: the section simply shows again on reload.
  }
}

export function useTodayMood() {
  const { user, loading } = useAuth()
  const [today] = useState(cairoToday)
  const [mood, setMood] = useState(null)
  // checking → open (show the choices) → saving → saved (thank-you card)
  // done: already checked in earlier today, so the section is hidden.
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (loading) return undefined
    if (!user || !supabase) {
      setStatus(guestDoneToday(today) ? 'done' : 'open')
      return undefined
    }
    let active = true
    setStatus('checking')
    supabase
      .from('mood_logs')
      .select('mood')
      .eq('logged_on', today)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        setStatus(!error && data ? 'done' : 'open')
      })
    return () => {
      active = false
    }
  }, [user, loading, today])

  const choose = useCallback(
    async (next) => {
      setMood(next)
      if (!user || !supabase) {
        rememberGuest(today)
        setStatus('saved')
        return
      }
      setStatus('saving')
      const { error } = await supabase.from('mood_logs').insert({ mood: next })
      // 23505: already logged today (e.g. on another device) — that's fine.
      if (!error || error.code === '23505') {
        setStatus('saved')
        return
      }
      // Clear the choice so picking the same mood again retries.
      setMood(null)
      setStatus('error')
    },
    [user, today],
  )

  return { mood, status, choose, signedIn: Boolean(user) }
}

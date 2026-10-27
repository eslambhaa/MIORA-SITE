import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { cairoToday } from '../../lib/cairoDate.js'
import { supabase } from '../../lib/supabase.js'

export function useTodayMood() {
  const { user } = useAuth()
  const [mood, setMood] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!user || !supabase) return
    let active = true
    supabase
      .from('mood_logs')
      .select('mood')
      .eq('logged_on', cairoToday())
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error || !data) return
        setMood(data.mood)
        setStatus('saved')
      })
    return () => {
      active = false
    }
  }, [user])

  const choose = useCallback(
    async (next) => {
      setMood(next)
      if (!user || !supabase) {
        setStatus('guest')
        return
      }
      setStatus('saving')
      const { error } = await supabase
        .from('mood_logs')
        .upsert({ mood: next }, { onConflict: 'user_id,logged_on' })
      setStatus(error ? 'error' : 'saved')
    },
    [user],
  )

  return { mood, status, choose, signedIn: Boolean(user) }
}

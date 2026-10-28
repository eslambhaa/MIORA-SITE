import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthProvider.jsx'

// The browser only learns "am I an admin" from the person's own row in admin_users (RLS).
// Real protection is in the database policies; this only decides what to show.
const known = new Map()

// 'loading' | 'yes' | 'no' | 'error'
export function useIsAdmin() {
  const { user, loading } = useAuth()
  const id = user?.id
  const [failedFor, setFailedFor] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!id || !supabase || known.has(id)) return undefined
    let ignore = false
    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', id)
      .limit(1)
      .then(({ data, error }) => {
        if (ignore) return
        if (error) {
          setFailedFor(id)
          return
        }
        known.set(id, data.length > 0)
        setTick((n) => n + 1)
      })
    return () => {
      ignore = true
    }
  }, [id])

  if (loading) return 'loading'
  if (!id) return 'no'
  if (known.has(id)) return known.get(id) ? 'yes' : 'no'
  return failedFor === id ? 'error' : 'loading'
}

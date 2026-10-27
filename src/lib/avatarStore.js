import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { avatarUrl } from './avatar.js'
import { supabase } from './supabase.js'

// One shared, in-memory copy of the signed-in user's picture URL, so the header
// and the profile page show the same picture without asking Supabase twice.
let state = { userId: null, url: '', loading: false }
const listeners = new Set()

function set(next) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const snapshot = () => state

async function load(userId) {
  set({ userId, url: '', loading: true })
  const { data, error } = await supabase.from('profiles').select('avatar_updated_at').eq('id', userId).maybeSingle()
  if (state.userId !== userId) return
  if (error || !data?.avatar_updated_at) {
    set({ loading: false })
    return
  }
  try {
    const url = await avatarUrl(userId)
    if (state.userId === userId) set({ url, loading: false })
  } catch {
    if (state.userId === userId) set({ loading: false })
  }
}

// After an upload: fetch a fresh signed URL for the new picture.
export async function refreshAvatar(userId) {
  const url = await avatarUrl(userId)
  set({ userId, url, loading: false })
}

export function clearAvatar() {
  set({ url: '' })
}

export function useAvatar() {
  const { user } = useAuth()
  const current = useSyncExternalStore(subscribe, snapshot)
  const userId = user?.id ?? null

  useEffect(() => {
    if (!userId) {
      if (state.userId) set({ userId: null, url: '', loading: false })
      return
    }
    if (state.userId !== userId && supabase) load(userId)
  }, [userId])

  return current.userId === userId ? current.url : ''
}

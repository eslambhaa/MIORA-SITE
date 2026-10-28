import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { supabase } from './supabase.js'

// Email reminders need an email provider on the server; the toggles stay locked until it is connected.
export const EMAIL_LIVE = false

const SEEN_KEY = 'miora-announcements-seen'
const FRESH_MS = 60 * 1000

// Announcements are for everyone, so whether one was seen is kept in this browser.
function readSeen() {
  try {
    const ids = JSON.parse(localStorage.getItem(SEEN_KEY))
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

function writeSeen(seen) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-100)))
  } catch {
    // storage blocked: the badge simply comes back next visit
  }
}

// One shared list for the bell and the notifications page, so a page load asks the server once.
let state = { items: [], status: 'idle', userId: null, fetchedAt: 0 }
let loading = null
const listeners = new Set()

function set(next) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => state

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at)

export async function refreshNotifications(userId, { force = false } = {}) {
  if (!supabase) return set({ status: 'ready', items: [], userId })
  if (!force && state.userId === userId && state.status === 'ready' && Date.now() - state.fetchedAt < FRESH_MS) return undefined
  if (loading && state.userId === userId) return loading

  const sameUser = state.userId === userId
  set({ status: sameUser && state.items.length ? 'ready' : 'loading', userId, items: sameUser ? state.items : [] })

  loading = (async () => {
    const [announcements, mine] = await Promise.all([
      supabase.from('announcements').select('id, title, body, link, created_at').order('created_at', { ascending: false }).limit(10),
      userId
        ? supabase.from('notifications').select('id, kind, title, body, link, read_at, created_at').order('created_at', { ascending: false }).limit(40)
        : Promise.resolve({ data: [] }),
    ])
    if (state.userId !== userId) return
    if (announcements.error || mine.error) return set({ status: 'error' })
    const seen = readSeen()
    const items = [
      ...(announcements.data ?? []).map((row) => ({ ...row, key: `a-${row.id}`, source: 'announcement', read: seen.has(row.id) })),
      ...(mine.data ?? []).map((row) => ({ ...row, key: `n-${row.id}`, source: 'notification', read: Boolean(row.read_at) })),
    ].sort(byNewest)
    set({ items, status: 'ready', fetchedAt: Date.now() })
  })().finally(() => {
    loading = null
  })
  return loading
}

function patch(key, change) {
  set({ items: state.items.map((item) => (item.key === key ? { ...item, ...change } : item)) })
}

export async function markRead(item) {
  if (item.read) return
  if (item.source === 'announcement') {
    const seen = readSeen().add(item.id)
    writeSeen(seen)
    return patch(item.key, { read: true })
  }
  patch(item.key, { read: true })
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', item.id)
  if (error) patch(item.key, { read: false })
}

export async function markAllRead() {
  const unread = state.items.filter((item) => !item.read)
  if (unread.length === 0) return
  const seen = readSeen()
  unread.filter((item) => item.source === 'announcement').forEach((item) => seen.add(item.id))
  writeSeen(seen)
  set({ items: state.items.map((item) => ({ ...item, read: true })) })
  if (unread.some((item) => item.source === 'notification')) {
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
    if (error) refreshNotifications(state.userId, { force: true })
  }
}

export async function removeNotification(item) {
  if (item.source !== 'notification') return
  const before = state.items
  set({ items: state.items.filter((entry) => entry.key !== item.key) })
  const { error } = await supabase.from('notifications').delete().eq('id', item.id)
  if (error) set({ items: before })
}

export function useNotifications() {
  const { user } = useAuth()
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  const userId = user?.id ?? null

  useEffect(() => {
    refreshNotifications(userId)
  }, [userId])

  return {
    items: snapshot.items,
    status: snapshot.status,
    unread: snapshot.items.filter((item) => !item.read).length,
    signedIn: Boolean(userId),
    refresh: () => refreshNotifications(userId),
  }
}

const relative = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' })
const units = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function timeAgo(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'الآن'
}

import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const CACHE_KEY = 'miora-resources-v5'
const CACHE_MS = 2 * 60 * 1000

// Players are only ever built from these hosts (the database and the CSP enforce the same list).
const EMBED_HOSTS = {
  'embed.podcasts.apple.com': '/',
  'www.youtube-nocookie.com': '/embed/',
}

// Every episode has its own page, like an article.
export const mediaPath = (item) => `/content/${item.kind === 'video' ? 'video' : 'podcast'}/${item.id}`

export function safeEmbedUrl(value) {
  try {
    const url = new URL(value)
    const prefix = EMBED_HOSTS[url.hostname]
    if (url.protocol === 'https:' && prefix && url.pathname.startsWith(prefix)) return url.href
  } catch {
    // not a valid address
  }
  return null
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.at < CACHE_MS && Array.isArray(cached.rows)) return cached.rows
  } catch {
    // storage blocked or corrupt: fetch instead
  }
  return null
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows }))
  } catch {
    // storage blocked: skip caching
  }
}

// One small read every two minutes per browser tab session, and only when a video or podcast tab is opened,
// so the free Supabase plan is barely touched.
export function useResources(enabled) {
  const [rows, setRows] = useState(() => (enabled ? readCache() : null))
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!enabled || rows) return undefined
    if (!supabase) {
      setStatus('error')
      return undefined
    }
    let ignore = false
    setStatus('loading')
    supabase
      .from('resources')
      .select('id, kind, title, source, description, details, topic, url, audio_url, embed_url')
      .order('sort_order')
      .then(({ data, error }) => {
        if (ignore) return
        if (error) return setStatus('error')
        const clean = data.filter((row) => safeEmbedUrl(row.embed_url))
        writeCache(clean)
        setRows(clean)
        setStatus('ready')
      })
    return () => {
      ignore = true
    }
  }, [enabled, rows])

  return { rows, status: rows ? 'ready' : status }
}

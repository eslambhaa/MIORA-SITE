import { useEffect, useState } from 'react'
import { articles as fallbackArticles, findArticle as findFallback } from '../data/articles.js'
import { supabase } from './supabase.js'

const LIST_KEY = 'miora-articles-v1'
const CACHE_MS = 2 * 60 * 1000

const LIST_COLUMNS = 'id, slug, title, excerpt, category, minutes, image_src, image_alt'
const FULL_COLUMNS = `${LIST_COLUMNS}, idea, practice, remember, sources, reviewed_by, reviewed_on`

const text = (value) => (typeof value === 'string' ? value : '')
const list = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : [])

// A database row (or a form's saved copy) in the shape the pages use.
export function rowToArticle(row) {
  const idea = row.idea ?? {}
  const practice = row.practice ?? {}
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    minutes: row.minutes,
    image: { src: row.image_src, width: 1200, height: 800, alt: row.image_alt },
    idea: { heading: text(idea.heading), paragraphs: list(idea.paragraphs), quote: text(idea.quote) },
    practice: { heading: text(practice.heading), paragraphs: list(practice.paragraphs), exercise: text(practice.exercise) },
    remember: list(row.remember),
    sources: Array.isArray(row.sources) ? row.sources.filter((source) => source?.url && source?.title) : [],
    reviewedBy: row.reviewed_by ?? null,
    reviewedOn: row.reviewed_on ?? null,
  }
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(LIST_KEY))
    if (cached && Date.now() - cached.at < CACHE_MS && Array.isArray(cached.rows)) return cached.rows
  } catch {
    // storage blocked or corrupt: fetch instead
  }
  return null
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(LIST_KEY, JSON.stringify({ at: Date.now(), rows }))
  } catch {
    // storage blocked: skip caching
  }
}

let listRequest = null

// One small read per two minutes for the cards (no article text). If the database cannot be reached,
// the copy that ships with the site is shown instead, so the library is never empty.
function loadList() {
  const cached = readCache()
  if (cached) return Promise.resolve(cached)
  if (!supabase) return Promise.resolve(fallbackArticles)
  listRequest ??= supabase
    .from('articles')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .order('sort_order')
    .order('id')
    .then(({ data, error }) => {
      if (error) return fallbackArticles
      const rows = data.map(rowToArticle)
      writeCache(rows)
      return rows
    })
    .catch(() => fallbackArticles)
    .finally(() => {
      listRequest = null
    })
  return listRequest
}

// { articles, loading }
export function useArticleList() {
  const [articles, setArticles] = useState(readCache)

  useEffect(() => {
    if (articles) return undefined
    let ignore = false
    loadList().then((rows) => !ignore && setArticles(rows))
    return () => {
      ignore = true
    }
  }, [articles])

  return { articles: articles ?? [], loading: !articles }
}

// { article, status: 'loading' | 'ready' | 'missing' }
export function useArticle(slug) {
  const [state, setState] = useState({ slug: null, article: null, status: 'loading' })

  useEffect(() => {
    let ignore = false
    const done = (article) => !ignore && setState({ slug, article, status: article ? 'ready' : 'missing' })
    if (!supabase) {
      done(findFallback(slug) ?? null)
      return undefined
    }
    supabase
      .from('articles')
      .select(FULL_COLUMNS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error }) => done(error ? (findFallback(slug) ?? null) : data ? rowToArticle(data) : null))
      .catch(() => done(findFallback(slug) ?? null))
    return () => {
      ignore = true
    }
  }, [slug])

  return state.slug === slug ? state : { article: null, status: 'loading' }
}

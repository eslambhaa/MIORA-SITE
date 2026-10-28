// Network side of admin-media-tools: look up an episode from a link, and check that a row still works.
// Every fetch goes through safeFetch: https only, public hostnames only, redirects re-checked, size and time capped.
import {
  appleEmbed,
  appleIds,
  channelInfo,
  firstParagraph,
  isAppleHost,
  isPrivateIp,
  isPublicHostname,
  metaDescription,
  plain,
  readItems,
  secure,
  shorten,
  watchUrl,
  youtubeEmbed,
  youtubeId,
} from './parse.ts'

export interface Deps {
  // Public address check before connecting. In the Edge runtime this is Deno.resolveDns.
  resolve?: (host: string) => Promise<string[]>
}

export class ToolError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

const UA = 'MioraLinkCheck/1.0 (educational project)'
const MAX_HOPS = 4

interface Fetched {
  status: number
  headers: Headers
  text: string
}

async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (total < maxBytes) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    total += value.length
  }
  await reader.cancel().catch(() => {})
  const all = new Uint8Array(Math.min(total, maxBytes))
  let offset = 0
  for (const chunk of chunks) {
    const part = chunk.subarray(0, all.length - offset)
    all.set(part, offset)
    offset += part.length
    if (offset >= all.length) break
  }
  return new TextDecoder().decode(all)
}

export async function safeFetch(rawUrl: string, init: RequestInit, deps: Deps, opts: { maxBytes?: number; wantText?: boolean } = {}): Promise<Fetched> {
  let current = rawUrl
  for (let hop = 0; hop <= MAX_HOPS; hop += 1) {
    let url: URL
    try {
      url = new URL(current)
    } catch {
      throw new ToolError('invalid_url')
    }
    if (url.protocol !== 'https:' || url.port || url.username || url.password) throw new ToolError('invalid_url')
    if (!isPublicHostname(url.hostname)) throw new ToolError('blocked_host')
    if (deps.resolve) {
      const addresses = await deps.resolve(url.hostname).catch(() => [] as string[])
      if (addresses.length === 0 || addresses.some(isPrivateIp)) throw new ToolError('blocked_host')
    }
    const response = await fetch(url, { ...init, redirect: 'manual', headers: { 'user-agent': UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(8000) })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel().catch(() => {})
      current = new URL(location, url).href
      continue
    }
    const text = opts.wantText ? await readCapped(response, opts.maxBytes ?? 2_000_000) : ''
    if (!opts.wantText) await response.body?.cancel().catch(() => {})
    return { status: response.status, headers: response.headers, text }
  }
  throw new ToolError('too_many_redirects')
}

export interface Candidate {
  title: string
  description: string
  details: string
  url: string
  embedUrl: string | null
  audioUrl: string | null
  date: string | null
}

export interface Lookup {
  kind: 'video' | 'podcast'
  source: string
  candidates: Candidate[]
}

const toDescription = (text: string, fallback: string) => shorten(firstParagraph(text) || fallback, 280)

async function lookupYoutube(id: string, deps: Deps): Promise<Lookup> {
  const oembed = await safeFetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl(id))}&format=json`, {}, deps, { wantText: true, maxBytes: 100_000 })
  if (oembed.status === 404) throw new ToolError('video_not_found')
  if (oembed.status === 401) throw new ToolError('embedding_disabled')
  if (oembed.status === 403) throw new ToolError('video_forbidden')
  if (oembed.status !== 200) throw new ToolError('fetch_failed')
  let data: { title?: string; author_name?: string }
  try {
    data = JSON.parse(oembed.text)
  } catch {
    throw new ToolError('fetch_failed')
  }
  const author = plain(data.author_name ?? '')
  let description = ''
  try {
    const page = await safeFetch(watchUrl(id), { headers: { 'accept-language': 'ar,en;q=0.8' } }, deps, { wantText: true, maxBytes: 1_500_000 })
    if (page.status === 200) description = metaDescription(page.text)
  } catch {
    // the description is optional
  }
  const title = shorten(plain(data.title ?? ''), 120)
  const body = plain(description)
  return {
    kind: 'video',
    source: shorten(author ? `${author} على YouTube` : 'YouTube', 120),
    candidates: [{ title, description: toDescription(body, title), details: shorten(body, 1990), url: watchUrl(id), embedUrl: youtubeEmbed(id), audioUrl: null, date: null }],
  }
}

interface AppleEntry {
  wrapperType?: string
  kind?: string
  collectionName?: string
  trackId?: number
  trackName?: string
  trackViewUrl?: string
  description?: string
  shortDescription?: string
  episodeUrl?: string
  releaseDate?: string
}

async function lookupApple(link: string, deps: Deps): Promise<Lookup> {
  const { show, episode, country } = appleIds(link)
  if (!show) throw new ToolError('unsupported')
  const params = new URLSearchParams({ id: show, entity: 'podcastEpisode', limit: '200' })
  if (country) params.set('country', country)
  const response = await safeFetch(`https://itunes.apple.com/lookup?${params}`, {}, deps, { wantText: true, maxBytes: 4_000_000 })
  if (response.status !== 200) throw new ToolError('fetch_failed')
  let results: AppleEntry[]
  try {
    results = JSON.parse(response.text).results ?? []
  } catch {
    throw new ToolError('fetch_failed')
  }
  const name = plain(results.find((entry) => entry.collectionName)?.collectionName ?? '').replace(/^بودكاست\s+/, '')
  const episodes = results.filter((entry) => entry.kind === 'podcast-episode' || entry.wrapperType === 'podcastEpisode')
  const picked = episode ? episodes.filter((entry) => String(entry.trackId) === episode) : episodes.slice(0, 25)
  if (name === '' && picked.length === 0) throw new ToolError('not_found')
  if (picked.length === 0) throw new ToolError(episode ? 'episode_not_found' : 'not_found')
  const base = `https://podcasts.apple.com${new URL(link).pathname}`
  return {
    kind: 'podcast',
    source: shorten(name || 'Apple Podcasts', 120),
    candidates: picked.map((entry) => {
      const body = plain(entry.description ?? entry.shortDescription ?? '')
      const url = entry.trackViewUrl?.startsWith('https://podcasts.apple.com/') ? entry.trackViewUrl : `${base}?i=${entry.trackId}`
      return {
        title: shorten(`${name}: ${plain(entry.trackName ?? '')}`, 120),
        description: toDescription(body, `حلقة من بودكاست ${name}.`),
        details: shorten(body, 1990),
        url: shorten(url, 600),
        embedUrl: appleEmbed(url),
        audioUrl: entry.episodeUrl ? secure(entry.episodeUrl) : null,
        date: entry.releaseDate ?? null,
      }
    }),
  }
}

async function lookupFeed(link: string, deps: Deps): Promise<Lookup> {
  const response = await safeFetch(link, { headers: { accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.5' } }, deps, { wantText: true, maxBytes: 3_000_000 })
  if (response.status !== 200) throw new ToolError('fetch_failed')
  if (!/<rss[\s>]|<channel[\s>]/i.test(response.text)) throw new ToolError('not_a_feed')
  const channel = channelInfo(response.text)
  const items = readItems(response.text).slice(0, 25)
  if (items.length === 0) throw new ToolError('no_episodes')
  const name = channel.title.replace(/^بودكاست\s+/, '')
  const fallbackLink = channel.link.startsWith('https://') ? channel.link : link
  return {
    kind: 'podcast',
    source: shorten(name || new URL(link).hostname, 120),
    candidates: items.map((item) => ({
      title: shorten(name ? `${name}: ${item.title}` : item.title, 120),
      description: toDescription(item.description, `حلقة من بودكاست ${name}.`),
      details: shorten(item.description, 1990),
      url: shorten(item.link.startsWith('https://') ? item.link : fallbackLink, 600),
      embedUrl: null,
      audioUrl: item.audio,
      date: item.date || null,
    })),
  }
}

// A YouTube link, an Apple Podcasts show or episode link, or the address of a podcast's own RSS feed.
export async function lookupLink(input: string, deps: Deps): Promise<Lookup> {
  const link = input.trim()
  if (link.length > 600) throw new ToolError('invalid_url')
  let parsed: URL
  try {
    parsed = new URL(link)
  } catch {
    throw new ToolError('invalid_url')
  }
  if (parsed.protocol !== 'https:') throw new ToolError('invalid_url')
  const id = youtubeId(link)
  if (id) return lookupYoutube(id, deps)
  if (isAppleHost(link)) return lookupApple(link, deps)
  if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(parsed.hostname)) throw new ToolError('unsupported')
  return lookupFeed(link, deps)
}

export interface RowToCheck {
  id: number
  kind: 'video' | 'podcast' | 'guide'
  url: string
  embed_url: string | null
  audio_url: string | null
}

export interface CheckResult {
  status: 'ok' | 'failed' | 'unknown'
  detail: string[]
}

const blocked = (status: number) => status === 403 || status === 429 || status === 999

async function checkAudio(url: string, deps: Deps): Promise<string> {
  try {
    const response = await safeFetch(url, { headers: { range: 'bytes=0-0' } }, deps)
    if (response.status === 200 || response.status === 206) {
      const type = response.headers.get('content-type') ?? ''
      return /^audio\/|octet-stream|mpeg|mp4/i.test(type) ? 'ok' : 'audio_not_audio'
    }
    return blocked(response.status) ? 'audio_blocked' : `audio_http_${response.status}`
  } catch (error) {
    return error instanceof ToolError ? `audio_${error.code}` : 'audio_unreachable'
  }
}

async function checkPage(url: string, deps: Deps): Promise<string> {
  try {
    const response = await safeFetch(url, { method: 'GET' }, deps)
    if (response.status < 400) return 'ok'
    return blocked(response.status) ? 'page_blocked' : `page_http_${response.status}`
  } catch (error) {
    return error instanceof ToolError ? `page_${error.code}` : 'page_unreachable'
  }
}

async function checkYoutube(id: string, deps: Deps): Promise<string> {
  try {
    const response = await safeFetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl(id))}&format=json`, {}, deps)
    if (response.status === 200) return 'ok'
    if (response.status === 404) return 'video_removed'
    if (response.status === 401) return 'embedding_disabled'
    if (response.status === 403) return 'video_forbidden'
    return `video_http_${response.status}`
  } catch (error) {
    return error instanceof ToolError ? `video_${error.code}` : 'video_unreachable'
  }
}

async function checkApple(link: string, deps: Deps): Promise<string> {
  const { show, episode, country } = appleIds(link)
  if (!show) return 'ok'
  try {
    const params = new URLSearchParams({ id: show, entity: 'podcastEpisode', limit: '200' })
    if (country) params.set('country', country)
    const response = await safeFetch(`https://itunes.apple.com/lookup?${params}`, {}, deps, { wantText: true, maxBytes: 4_000_000 })
    if (response.status !== 200) return `apple_http_${response.status}`
    const results: AppleEntry[] = JSON.parse(response.text).results ?? []
    if (results.length === 0) return 'apple_not_found'
    if (!episode) return 'ok'
    // Episodes older than the latest 200 are not listed by Apple; those rows should carry their own audio_url.
    return results.some((entry) => String(entry.trackId) === episode && entry.episodeUrl) ? 'ok' : 'apple_episode_not_listed'
  } catch {
    return 'apple_unreachable'
  }
}

export async function checkRow(row: RowToCheck, deps: Deps): Promise<CheckResult> {
  const codes: string[] = []
  if (row.kind === 'video') {
    const id = row.embed_url ? youtubeId(row.embed_url) : null
    codes.push(id ? await checkYoutube(id, deps) : 'video_bad_embed')
  } else if (row.kind === 'podcast') {
    if (row.audio_url) codes.push(await checkAudio(row.audio_url, deps))
    else if (isAppleHost(row.url)) codes.push(await checkApple(row.url, deps))
    else codes.push('no_audio_source')
  }
  if (!isAppleHost(row.url) && !youtubeId(row.url)) codes.push(await checkPage(row.url, deps))
  const problems = codes.filter((code) => code !== 'ok')
  const hard = problems.filter((code) => !/_blocked$|unreachable$|^apple_episode_not_listed$/.test(code))
  if (hard.length) return { status: 'failed', detail: hard }
  if (problems.length) return { status: 'unknown', detail: problems }
  return { status: 'ok', detail: [] }
}

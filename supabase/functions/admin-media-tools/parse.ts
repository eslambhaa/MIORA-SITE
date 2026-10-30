// Pure helpers for admin-media-tools (no network, no Deno APIs), so they can be unit-tested with Vitest.

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }
const INVISIBLE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g

export function decodeEntities(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (match) => ENTITIES[match])
}

// The publisher's description without tags, entities, links and extra blank space.
export function plain(value: string): string {
  return decodeEntities(value.replace(/<br\s*\/?>|<\/p>/gi, '\n').replace(/<[^>]*>/g, ''))
    .replace(/https?:\/\/[\x21-\x7e]+/g, '')
    .replace(INVISIBLE, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()
}

const tagText = (xml: string, tag: string): string => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').replace(INVISIBLE, '').trim() : ''
}

// The http audio links some feeds publish are blocked on an https site, so ask for https instead.
export const secure = (url: string): string => (url.startsWith('http://') ? `https://${url.slice(7)}` : url)

export interface FeedItem {
  title: string
  link: string
  date: string
  description: string
  audio: string
}

export function channelInfo(xml: string): { title: string; link: string } {
  const head = xml.split(/<item[\s>]/i)[0]
  return { title: plain(tagText(head, 'title')), link: tagText(head, 'link') }
}

export function readItems(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)]
    .map(([item]) => ({
      title: plain(tagText(item, 'title')),
      link: tagText(item, 'link'),
      date: tagText(item, 'pubDate'),
      description: plain(tagText(item, 'itunes:summary') || tagText(item, 'description')),
      audio: secure(decodeEntities(item.match(/<(?:enclosure|media:content)[^>]*\burl=["']([^"']+)["']/i)?.[1] ?? '')),
    }))
    .filter((item) => item.title && item.audio.startsWith('https://'))
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'])
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

export function youtubeId(input: string): string | null {
  try {
    const url = new URL(input)
    if (url.protocol !== 'https:' || !YOUTUBE_HOSTS.has(url.hostname)) return null
    let id: string | null = null
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1).split('/')[0]
    else if (url.pathname === '/watch') id = url.searchParams.get('v')
    else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null
    return id && VIDEO_ID.test(id) ? id : null
  } catch {
    return null
  }
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`

export function isAppleHost(input: string): boolean {
  try {
    const url = new URL(input)
    return url.protocol === 'https:' && url.hostname === 'podcasts.apple.com'
  } catch {
    return false
  }
}

export function appleIds(value: string): { show: string | null; episode: string | null; country: string | null } {
  try {
    const url = new URL(value)
    const episode = url.searchParams.get('i')
    return {
      show: url.pathname.match(/\/id(\d+)/)?.[1] ?? null,
      episode: episode && /^\d+$/.test(episode) ? episode : null,
      country: url.pathname.match(/^\/([a-z]{2})\//)?.[1] ?? null,
    }
  } catch {
    return { show: null, episode: null, country: null }
  }
}

export const appleEmbed = (link: string): string => link.replace('https://podcasts.apple.com/', 'https://embed.podcasts.apple.com/')

export function isPrivateIp(ip: string): boolean {
  const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  const address = mapped ? mapped[1] : ip.toLowerCase()
  const v4 = address.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])]
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)) || (a === 192 && b === 0)
  }
  if (address.includes(':')) return address === '::' || address === '::1' || /^f[cd]/.test(address) || /^fe[89ab]/.test(address)
  return false
}

// Names a server-side fetch may contact: a real public hostname, never an address, localhost or an internal name.
export function isPublicHostname(host: string): boolean {
  const name = host.toLowerCase()
  if (!name.includes('.') || name.endsWith('.')) return false
  if (/^[\d.]+$/.test(name) || name.includes(':') || name.startsWith('[')) return false
  return !/(^|\.)(localhost|local|internal|lan|home|corp|intranet)$/.test(name)
}

export function shorten(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6))}…`
}

export const firstParagraph = (text: string): string => text.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim()

// The page's own description for a video (oEmbed has none): the <meta name="description"> tag.
export function metaDescription(html: string): string {
  const tag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] ?? ''
  const content = tag.match(/content=(?:"([^"]*)"|'([^']*)')/i)
  return decodeEntities((content?.[1] ?? content?.[2] ?? '').replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))).replace(INVISIBLE, '').trim()
}

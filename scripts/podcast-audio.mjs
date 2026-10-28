// Finds the direct audio file of a podcast episode from the podcast's own RSS feed,
// and prints the SQL that stores it in Miora's `resources` table.
//
// Run on your own computer (Node 18 or newer, no install needed):
//   node scripts/podcast-audio.mjs "<Apple Podcasts show or episode link>" "<words from the episode title>" [row id]
// Example:
//   node scripts/podcast-audio.mjs "https://podcasts.apple.com/sa/podcast/x/id985515827" "كيف تفهم نفسك"
//
// Then paste the printed `update` line into Supabase SQL Editor, with the right row id.
//
// To add whole episodes as new pages, use --add (several words can be separated by a comma):
//   node scripts/podcast-audio.mjs "<Apple link>" "الاحتراق,الحنين" --add [--topic "فهم المشاعر"]
// It prints `insert` statements (title, the publisher's own description, audio link). Read them before running.
import { pathToFileURL } from 'node:url'

export function showId(value) {
  return /^\d+$/.test(value) ? value : new URL(value).pathname.match(/\/id(\d+)/)?.[1] ?? null
}

const text = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : ''
}

const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }

// The publisher's description, without tags, entities, links and extra blank space.
export function plain(value) {
  return value
    .replace(/<br\s*\/?>|<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (match) => entities[match])
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()
}

export function readItems(xml) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map(([item]) => ({
    title: text(item, 'title'),
    date: text(item, 'pubDate'),
    duration: text(item, 'itunes:duration'),
    description: plain(text(item, 'itunes:summary') || text(item, 'description')),
    audio: item.match(/<(?:enclosure|media:content)[^>]*\burl=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;', '&') ?? '',
    raw: item.match(/<(?:enclosure|media:content)[^>]*>/i)?.[0] ?? '(no <enclosure> or <media:content> in this item)',
  }))
}

// The site is served over https, so an http audio link would be blocked: ask for https instead.
const secure = (url) => (url.startsWith('http://') ? `https://${url.slice(7)}` : url)

export function parseFeed(xml) {
  return readItems(xml)
    .map((episode) => ({ ...episode, audio: secure(episode.audio) }))
    .filter((episode) => episode.title && episode.audio.startsWith('https://'))
}

export async function findEpisodes(show, words) {
  const lookup = await (await fetch(`https://itunes.apple.com/lookup?id=${show}`)).json()
  const name = lookup.results?.[0]?.collectionName ?? lookup.results?.[0]?.trackName ?? ''
  const feed = lookup.results?.[0]?.feedUrl
  if (!feed) throw new Error('Apple did not return a feed address for this podcast.')
  const items = readItems(await (await fetch(feed)).text())
  const episodes = items
    .map((episode) => ({ ...episode, audio: secure(episode.audio) }))
    .filter((episode) => episode.title && episode.audio.startsWith('https://'))
  const needles = words.split(/[,،]/).map((word) => word.trim()).filter(Boolean)
  const matches = needles.length ? episodes.filter((episode) => needles.some((word) => episode.title.includes(word))) : episodes.slice(0, 15)
  return { feed, name, items: items.length, usable: episodes.length, matches, latest: episodes.slice(0, 15), sample: items.slice(0, 2).map((item) => `${item.title || '(no title)'} -> ${item.raw}`) }
}

const dollar = (value) => `$m$${value}$m$`

export function embedOf(link) {
  return link.replace('https://podcasts.apple.com/', 'https://embed.podcasts.apple.com/')
}

// One `insert` per episode: the episode title, the publisher's description and the audio file.
export function insertSql({ name, link, topic }, episode) {
  const details = episode.description.slice(0, 1990)
  const short = details.split('\n')[0].slice(0, 280) || `حلقة من بودكاست ${name}.`
  return `insert into public.resources (kind, title, source, description, details, url, embed_url, audio_url, topic, sort_order)
values ('podcast', ${dollar(`${name}: ${episode.title}`.slice(0, 120))}, ${dollar(name.slice(0, 120))}, ${dollar(short)}, ${details ? dollar(details) : 'null'},
  ${dollar(link)}, ${dollar(embedOf(link))}, ${dollar(episode.audio)}, ${dollar(topic)}, 200);`
}

async function main() {
  const args = process.argv.slice(2)
  const add = args.includes('--add')
  const topicAt = args.indexOf('--topic')
  const topic = topicAt >= 0 ? args[topicAt + 1] : 'فهم المشاعر'
  const [link, words = '', rowId = ''] = args.filter((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--topic')
  const target = /^\d+$/.test(rowId) ? rowId : '<ROW ID>'
  const show = link && showId(link)
  if (!show) {
    console.log('Usage: node scripts/podcast-audio.mjs "<Apple Podcasts link>" "<words from the episode title>"')
    process.exit(1)
  }
  const { feed, name, items, usable, matches, latest, sample } = await findEpisodes(show, words)
  // With --add the output is pasted into the SQL editor, so the info lines are written as SQL comments.
  const note = add ? '-- ' : ''
  console.log(`${note}Feed: ${feed}`)
  console.log(`${note}${items} item(s) in the feed, ${usable} with an audio link (http is upgraded to https), ${matches.length} matching "${words}"\n`)
  if (!usable) console.log(`Nothing usable. The first items look like this:\n  ${sample.join('\n  ')}\n`)
  if (add) {
    if (!matches.length) console.log('No episode title matched: nothing to add.')
    for (const episode of matches.slice(0, 15)) console.log(`-- ${episode.title} (${episode.duration})\n${insertSql({ name, link, topic }, episode)}\n`)
    return
  }
  // Nothing matched the words: show the latest episodes so the right one can be picked by eye.
  const list = matches.length ? matches : latest
  if (!matches.length && latest.length) console.log('No title matched; the latest episodes are:\n')
  for (const episode of list.slice(0, 15)) {
    console.log(`${episode.title}\n  ${episode.date}  ${episode.duration}\n  update public.resources set audio_url = '${episode.audio.replaceAll("'", "''")}' where id = ${target};\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}

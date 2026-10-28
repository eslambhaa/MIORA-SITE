// Finds the direct audio file of a podcast episode from the podcast's own RSS feed,
// and prints the SQL that stores it in Miora's `resources` table.
//
// Run on your own computer (Node 18 or newer, no install needed):
//   node scripts/podcast-audio.mjs "<Apple Podcasts show or episode link>" "<words from the episode title>"
// Example:
//   node scripts/podcast-audio.mjs "https://podcasts.apple.com/sa/podcast/x/id985515827" "كيف تفهم نفسك"
//
// Then paste the printed `update` line into Supabase SQL Editor, with the right row id.
import { pathToFileURL } from 'node:url'

export function showId(value) {
  return /^\d+$/.test(value) ? value : new URL(value).pathname.match(/\/id(\d+)/)?.[1] ?? null
}

const text = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : ''
}

export function parseFeed(xml) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)]
    .map(([item]) => ({
      title: text(item, 'title'),
      date: text(item, 'pubDate'),
      duration: text(item, 'itunes:duration'),
      audio: item.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;', '&') ?? '',
    }))
    .filter((episode) => episode.title && episode.audio.startsWith('https://'))
}

export async function findEpisodes(show, words) {
  const lookup = await (await fetch(`https://itunes.apple.com/lookup?id=${show}`)).json()
  const feed = lookup.results?.[0]?.feedUrl
  if (!feed) throw new Error('Apple did not return a feed address for this podcast.')
  const episodes = parseFeed(await (await fetch(feed)).text())
  const needle = words.trim()
  return { feed, episodes: needle ? episodes.filter((episode) => episode.title.includes(needle)) : episodes.slice(0, 15) }
}

async function main() {
  const [link, words = ''] = process.argv.slice(2)
  const show = link && showId(link)
  if (!show) {
    console.log('Usage: node scripts/podcast-audio.mjs "<Apple Podcasts link>" "<words from the episode title>"')
    process.exit(1)
  }
  const { feed, episodes } = await findEpisodes(show, words)
  console.log(`Feed: ${feed}\n${episodes.length} episode(s) found\n`)
  for (const episode of episodes.slice(0, 15)) {
    console.log(`${episode.title}\n  ${episode.date}  ${episode.duration}\n  update public.resources set audio_url = '${episode.audio.replaceAll("'", "''")}' where id = <ROW ID>;\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}

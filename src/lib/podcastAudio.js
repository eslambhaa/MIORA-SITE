// Finds the audio files of a podcast row, only when the visitor presses play.
// Order: a link stored in the database (audio_url), then Apple's public lookup service
// (it returns the episode file addresses that the podcast's own feed publishes).
const LOOKUP = 'https://itunes.apple.com/lookup'

export function appleIds(value) {
  try {
    const url = new URL(value)
    const show = url.pathname.match(/\/id(\d+)/)?.[1]
    const episode = url.searchParams.get('i')
    return { show: show ?? null, episode: episode && /^\d+$/.test(episode) ? episode : null }
  } catch {
    return { show: null, episode: null }
  }
}

function httpsOnly(value) {
  try {
    return new URL(value).protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

export async function loadTracks(item, signal) {
  const stored = httpsOnly(item.audio_url)
  if (stored) return [{ id: 'stored', title: item.title, src: stored }]

  const { show, episode } = appleIds(item.url)
  const id = episode ?? show
  if (!id) throw new Error('no apple id')

  const response = await fetch(`${LOOKUP}?id=${id}&entity=podcastEpisode&limit=25`, { signal })
  if (!response.ok) throw new Error(`lookup ${response.status}`)
  const { results } = await response.json()

  const tracks = (Array.isArray(results) ? results : [])
    .map((entry) => ({ id: String(entry.trackId), title: entry.trackName, src: httpsOnly(entry.episodeUrl) }))
    .filter((track) => track.src && track.title)
  if (tracks.length === 0) throw new Error('no episodes')
  return tracks
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

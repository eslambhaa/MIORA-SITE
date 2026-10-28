import { useEffect, useRef, useState } from 'react'
import { formatTime, loadTracks } from '../../lib/podcastAudio.js'
import { safeEmbedUrl } from '../../lib/resources.js'

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

// Apple's own player, shown only if the audio files cannot be found or do not play.
// Its play bar is cropped to a fixed band (measured from the live embed at 175px high) and restyled dark.
const FALLBACK_FRAME = 175
const FALLBACK_BAR_TOP = 122
const FALLBACK_BAR_HEIGHT = 36

const iconProps = { 'aria-hidden': true, width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor' }
const Play = () => (
  <svg {...iconProps} width="26" height="26"><path d="M8 5.5v13l11-6.5z" /></svg>
)
const Pause = () => (
  <svg {...iconProps} width="26" height="26"><rect x="6.5" y="5" width="4" height="14" rx="1" /><rect x="13.5" y="5" width="4" height="14" rx="1" /></svg>
)
const Prev = () => (
  <svg {...iconProps}><rect x="5" y="5" width="2.5" height="14" rx="1" /><path d="M19 5.5v13L9 12z" /></svg>
)
const Next = () => (
  <svg {...iconProps}><rect x="16.5" y="5" width="2.5" height="14" rx="1" /><path d="M5 5.5v13L15 12z" /></svg>
)
const Waves = () => (
  <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="11" r="2" fill="currentColor" stroke="none" />
    <path d="M12 14v6" />
    <path d="M8.5 7.5a5 5 0 0 1 7 0M6 5a8.5 8.5 0 0 1 12 0M8.5 14.5a5 5 0 0 1 0-7M15.5 14.5a5 5 0 0 0 0-7" />
  </svg>
)
const Settings = () => (
  <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" />
  </svg>
)

const roundButton = 'flex size-11 cursor-pointer items-center justify-center rounded-full text-white outline-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none'

export default function PodcastPlayer({ item }) {
  const audioRef = useRef(null)
  const menuRef = useRef(null)
  const [tracks, setTracks] = useState(null)
  const [index, setIndex] = useState(0)
  const [state, setState] = useState('idle') // idle | loading | ready | fallback
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate, index])

  useEffect(() => {
    if (!menuOpen) return undefined
    const close = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
      if (event.type === 'pointerdown' && !menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [menuOpen])

  async function startTrack(list, position) {
    const audio = audioRef.current
    setIndex(position)
    setTime(0)
    setDuration(0)
    audio.src = list[position].src
    audio.playbackRate = rate
    try {
      await audio.play()
    } catch {
      setState('fallback')
    }
  }

  async function toggle() {
    const audio = audioRef.current
    if (state === 'loading') return
    if (!tracks) {
      setState('loading')
      try {
        const list = await loadTracks(item)
        setTracks(list)
        setState('ready')
        await startTrack(list, 0)
      } catch {
        setState('fallback')
      }
      return
    }
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setState('fallback')
      }
    } else audio.pause()
  }

  function go(step) {
    const next = index + step
    if (tracks && next >= 0 && next < tracks.length) startTrack(tracks, next)
  }

  function seek(event) {
    const value = Number(event.target.value)
    audioRef.current.currentTime = value
    setTime(value)
  }

  if (state === 'fallback') {
    const src = safeEmbedUrl(item.embed_url)
    if (!src) return null
    return (
      <div>
        <div className="rounded-[22px] bg-(--color-page-guide-panel) p-4">
          <div className="overflow-hidden rounded-[14px]" style={{ height: FALLBACK_BAR_HEIGHT }}>
            <iframe
              src={src}
              title={`بودكاست: ${item.title}`}
              width="100%"
              allow="autoplay *; encrypted-media *; clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              className="block w-full border-0"
              style={{ height: FALLBACK_FRAME, marginTop: -FALLBACK_BAR_TOP, filter: 'grayscale(1) invert(1)' }}
            />
          </div>
        </div>
        <p role="status" className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">يُشغَّل من Apple Podcasts داخل ميورا.</p>
      </div>
    )
  }

  const current = tracks?.[index]
  const title = current?.title ?? item.title
  const loading = state === 'loading'
  const hasSeveral = (tracks?.length ?? 0) > 1

  return (
    <div>
      <div dir="ltr" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 rounded-[30px] bg-(image:--gradient-podcast-player) px-4 py-3 text-white shadow-(--shadow-page-card) sm:flex-nowrap sm:rounded-full sm:px-5">
        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => (tracks && index + 1 < tracks.length ? go(1) : setPlaying(false))}
          onError={() => tracks && setState('fallback')}
        />
        <div className="order-2 flex items-center gap-1 sm:order-1">
          <button type="button" className={roundButton} onClick={() => go(-1)} disabled={!hasSeveral || index === 0}>
            <Prev />
            <span className="sr-only">الحلقة السابقة</span>
          </button>
          <button type="button" onClick={toggle} aria-busy={loading} className={`${roundButton} size-14 border-2 border-white`}>
            {playing ? <Pause /> : <Play />}
            <span className="sr-only">{loading ? 'جارٍ التحميل' : playing ? 'إيقاف مؤقت' : 'تشغيل'}: {title}</span>
          </button>
          <button type="button" className={roundButton} onClick={() => go(1)} disabled={!hasSeveral || index === tracks.length - 1}>
            <Next />
            <span className="sr-only">الحلقة التالية</span>
          </button>
        </div>

        <div className="order-1 min-w-0 basis-full rounded-[22px] bg-black/25 px-4 py-3 sm:order-2 sm:basis-auto sm:flex-1">
          <div dir="rtl" className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-white/15">
              <Waves />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base leading-6 font-bold">{loading ? 'جارٍ التحميل…' : title}</p>
              <p className="truncate text-[13px] leading-5 text-(color:--color-page-guide-panel-text)">{item.source}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-(color:--color-page-guide-panel-text)">
            <span className="w-11 text-end tabular-nums">{formatTime(time)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="1"
              value={Math.min(time, duration || 0)}
              onChange={seek}
              disabled={!duration}
              aria-label="موضع التشغيل"
              aria-valuetext={`${formatTime(time)} من ${formatTime(duration)}`}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-(--color-page-guide-panel-muted) disabled:cursor-default"
            />
            <span className="w-11 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="relative order-3 flex items-center gap-1">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={roundButton}>
              <Waves />
              <span className="sr-only">افتح في Apple Podcasts (يفتح في نافذة جديدة)</span>
            </a>
          )}
          <div ref={menuRef} className="relative">
            <button type="button" className={roundButton} aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <Settings />
              <span className="sr-only">الإعدادات</span>
            </button>
            {menuOpen && (
              <div dir="rtl" role="group" aria-label="سرعة التشغيل" className="absolute right-0 bottom-[calc(100%+8px)] z-10 w-44 rounded-2xl bg-(--color-page-surface) p-2 text-(color:--color-page-heading) shadow-(--shadow-page-card) ring-1 ring-(--color-page-border)">
                <p className="px-3 pt-1 pb-2 text-sm font-bold">سرعة التشغيل</p>
                {SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    aria-pressed={speed === rate}
                    onClick={() => {
                      setRate(speed)
                      setMenuOpen(false)
                    }}
                    className={`flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-base outline-(--color-page-primary) ${speed === rate ? 'bg-(--color-page-guide-selected) font-bold text-(color:--color-page-primary)' : 'hover:bg-(--color-page-card)'}`}
                  >
                    <span dir="ltr">{speed}×</span>
                    {speed === 1 && <span className="text-xs text-(color:--color-page-muted)">عادية</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">
        {state === 'idle' ? 'اضغط تشغيل لتحميل الحلقة.' : 'يُشغَّل الصوت من مصدر الحلقة الأصلي داخل ميورا.'}
      </p>
    </div>
  )
}

import { useState } from 'react'
import { safeEmbedUrl } from '../../lib/resources.js'

// Apple draws the same 175px player for a show and for an episode, with the play bar in a fixed band
// (measured from the live embed at 175px high). Podcasts show only that band, restyled dark.
const PODCAST_FRAME = 175
const BAR_TOP = 122
const BAR_HEIGHT = 36

const playIcon = (size) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 2.5v11l9-5.5z" />
  </svg>
)

// The player is only loaded after the visitor presses play: nothing is sent to YouTube or Apple before that.
export default function MediaPlayer({ item }) {
  const [playing, setPlaying] = useState(false)
  const src = safeEmbedUrl(item.embed_url)
  if (!src) return null
  const isVideo = item.kind === 'video'

  if (isVideo) {
    return (
      <div>
        <div className="relative aspect-video overflow-hidden rounded-[28px] bg-black">
          {playing ? (
            <iframe
              src={src}
              title={`فيديو: ${item.title}`}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 text-white outline-offset-[-6px] outline-white"
            >
              <span className="flex size-20 items-center justify-center rounded-full border-2 border-white">{playIcon(30)}</span>
              <span className="text-lg font-bold">شاهد هنا<span className="sr-only">: {item.title}</span></span>
            </button>
          )}
        </div>
        {playing && <p className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">يُشغَّل من YouTube داخل ميورا.</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-[22px] bg-black p-4 text-white">
        {playing ? (
          <div className="overflow-hidden rounded-[14px]" style={{ height: BAR_HEIGHT }}>
            <iframe
              src={src}
              title={`بودكاست: ${item.title}`}
              width="100%"
              allow="autoplay *; encrypted-media *; clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              className="block w-full border-0"
              style={{ height: PODCAST_FRAME, marginTop: -BAR_TOP, filter: 'grayscale(1) invert(1)' }}
            />
          </div>
        ) : (
          <>
            <div aria-hidden="true" className="h-3.5 rounded-full border border-white/80 p-px">
              <div className="h-full w-[12%] rounded-full bg-white/50" />
            </div>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="mx-auto mt-5 flex size-16 cursor-pointer items-center justify-center rounded-full border-2 border-white outline-offset-4 outline-white"
            >
              {playIcon(26)}
              <span className="sr-only">استمع هنا: {item.title}</span>
            </button>
          </>
        )}
      </div>
      {playing && <p className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">يُشغَّل من Apple Podcasts داخل ميورا.</p>}
    </div>
  )
}

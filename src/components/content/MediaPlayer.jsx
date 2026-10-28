import { useState } from 'react'
import { safeEmbedUrl } from '../../lib/resources.js'
import PodcastPlayer from './PodcastPlayer.jsx'

// Nothing is sent to YouTube or Apple before the visitor presses play.
export default function MediaPlayer({ item }) {
  return item.kind === 'video' ? <VideoPlayer item={item} /> : <PodcastPlayer item={item} />
}

function VideoPlayer({ item }) {
  const [playing, setPlaying] = useState(false)
  const src = safeEmbedUrl(item.embed_url)
  if (!src) return null

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
            <span className="flex size-20 items-center justify-center rounded-full border-2 border-white">
              <svg aria-hidden="true" width="30" height="30" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
            </span>
            <span className="text-lg font-bold">
              شاهد هنا<span className="sr-only">: {item.title}</span>
            </span>
          </button>
        )}
      </div>
      {playing && <p className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">يُشغَّل من YouTube داخل ميورا.</p>}
    </div>
  )
}

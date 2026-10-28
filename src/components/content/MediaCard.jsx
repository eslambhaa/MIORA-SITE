import { useState } from 'react'
import { safeEmbedUrl } from '../../lib/resources.js'

const kindLabel = { video: 'فيديو', podcast: 'بودكاست' }

// Apple draws the same 175px player for a show and for an episode, with the play bar in a fixed band
// (measured from the live embed at 175px high). Podcasts show only that band; the title and source
// are already on our card.
const PODCAST_FRAME = 175
const BAR_TOP = 122
const BAR_HEIGHT = 36

function KindIcon({ kind }) {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'video' ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M10.5 9.5v5l4-2.5z" />
        </>
      ) : (
        <>
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <rect x="3" y="14" width="4" height="6" rx="1.5" />
          <rect x="17" y="14" width="4" height="6" rx="1.5" />
        </>
      )}
    </svg>
  )
}

// The player is only loaded after the visitor presses play: nothing is sent to YouTube or Apple before that.
export default function MediaCard({ item, headingLevel = 'h2' }) {
  const [playing, setPlaying] = useState(false)
  const Heading = headingLevel
  const src = safeEmbedUrl(item.embed_url)
  const isVideo = item.kind === 'video'

  return (
    <article className="flex h-full flex-col rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) p-[22px]">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-(--color-page-guide-selected) text-(color:--color-page-primary)">
          <KindIcon kind={item.kind} />
        </span>
        <span className="rounded-full bg-(--color-page-card) px-3 py-[5px] text-xs leading-[21px] font-bold">{kindLabel[item.kind]}</span>
        {item.topic && <span className="text-[13px] leading-[22.75px] text-(color:--color-page-muted)">{item.topic}</span>}
      </div>
      <Heading className="pt-4 text-[21px] leading-[1.5] tracking-[-0.02em]">{item.title}</Heading>
      <p className="pt-1 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">{item.source}</p>
      <p className="pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{item.description}</p>
      <div className="mt-auto pt-4">
        {playing && src ? (
          <div className={isVideo ? '' : 'overflow-hidden rounded-[14px]'} style={isVideo ? undefined : { height: BAR_HEIGHT }}>
            <iframe
              src={src}
              title={`${kindLabel[item.kind]}: ${item.title}`}
              width="100%"
              loading="lazy"
              allow={isVideo ? 'encrypted-media; picture-in-picture; fullscreen' : 'autoplay *; encrypted-media *; clipboard-write'}
              allowFullScreen={isVideo}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              className={`block w-full border-0 ${isVideo ? 'aspect-video rounded-[14px]' : ''}`}
              style={isVideo ? undefined : { height: PODCAST_FRAME, marginTop: -BAR_TOP }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-(--radius-page-button) bg-(--color-page-button) px-[22px] text-base font-bold text-white outline-(--color-page-primary)"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
            {isVideo ? 'شاهد هنا' : 'استمع هنا'}
            <span className="sr-only">: {item.title}</span>
          </button>
        )}
        {playing && (
          <p className="pt-2 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">يُشغَّل من {isVideo ? 'YouTube' : 'Apple Podcasts'} داخل ميورا.</p>
        )}
      </div>
    </article>
  )
}

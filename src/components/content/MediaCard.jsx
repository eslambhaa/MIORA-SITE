import { Link } from 'react-router'
import { excerpt, mediaPath } from '../../lib/resources.js'

export const kindLabel = { video: 'فيديو', podcast: 'بودكاست' }

export function KindIcon({ kind, size = 26 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

// A summary card, like an article card: the player lives on the episode's own page.
export default function MediaCard({ item, headingLevel = 'h2' }) {
  const Heading = headingLevel
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
      <p className="pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{excerpt(item.details || item.description)}</p>
      <Link
        to={mediaPath(item)}
        className="mt-auto inline-flex items-center gap-[7px] pt-4 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline"
      >
        {isVideo ? 'شاهد الحلقة' : 'استمع للحلقة'}
        <span className="sr-only">: {item.title}</span>
        <img src="/icons/home/read-arrow.svg" alt="" width="17" height="17" className="-scale-x-100" />
      </Link>
    </article>
  )
}

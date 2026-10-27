import { Link } from 'react-router'

export default function ArticleCard({ article, headingLevel = 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)">
      <div className="relative h-[230px]">
        <img src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height} loading="lazy" className="size-full object-cover" />
        <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-[5px] text-xs leading-[21px] font-bold backdrop-blur-[8px]">{article.category}</span>
      </div>
      <div className="flex flex-1 flex-col items-start p-[22px]">
        <p className="flex items-center gap-1.5 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">
          <img src="/icons/home/clock.svg" alt="" width="16" height="16" />
          {article.minutes} دقائق قراءة
        </p>
        <Heading className="pt-2.5 text-[21px] leading-[27.3px] tracking-[-0.02em]">{article.title}</Heading>
        <p className="min-h-[58px] pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{article.excerpt}</p>
        <Link
          to={`/content/${article.slug}`}
          className="mt-auto inline-flex items-center gap-[7px] pt-2 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline"
        >
          اقرأ المقال
          <span className="sr-only">: {article.title}</span>
          <img src="/icons/home/read-arrow.svg" alt="" width="17" height="17" className="-scale-x-100" />
        </Link>
      </div>
    </article>
  )
}

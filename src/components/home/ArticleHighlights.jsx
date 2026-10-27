import { Link } from 'react-router'
import { articles } from '../../data/articles.js'
import SectionTitle from './SectionTitle.jsx'

export default function ArticleHighlights() {
  return (
    <section aria-labelledby="articles-title" className="px-6 pt-0.5 pb-[105px]">
      <div className="mx-auto max-w-[1026px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 md:flex-1 md:[&>div]:max-w-none">
            <SectionTitle id="articles-title" title="خطوات صغيرة لفهم نفسك بشكل أفضل" description="معلومات عملية بلغة بسيطة تساعدك في مواقف الحياة اليومية." />
          </div>
          <Link
            to="/content"
            className="inline-flex min-h-12 shrink-0 items-center justify-center self-start rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold shadow-(--shadow-home-soft) outline-(--color-page-primary) md:self-auto"
          >
            استكشف كل المحتوى
          </Link>
        </div>
        <ul className="mt-10 grid gap-[22px] md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)">
                <div className="relative h-[230px]">
                  <img src={article.image} alt={article.imageAlt} width="660" height="440" loading="lazy" className="size-full object-cover" />
                  <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-[5px] text-xs leading-[21px] font-bold backdrop-blur-[8px]">{article.category}</span>
                </div>
                <div className="flex flex-1 flex-col items-start p-[22px]">
                  <p className="flex items-center gap-1.5 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">
                    <img src="/icons/home/clock.svg" alt="" width="16" height="16" />
                    {article.minutes} دقائق قراءة
                  </p>
                  <h3 className="pt-2.5 text-[21px] leading-[27.3px] tracking-[-0.02em]">{article.title}</h3>
                  <p className="min-h-[58px] pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{article.excerpt}</p>
                  <Link to={`/content/${article.slug}`} className="mt-auto inline-flex items-center gap-[7px] pt-2 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline">
                    اقرأ المقال
                    <span className="sr-only">: {article.title}</span>
                    <img src="/icons/home/read-arrow.svg" alt="" width="17" height="17" className="-scale-x-100" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

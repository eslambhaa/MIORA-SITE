import { Link } from 'react-router'
import { articles } from '../../data/articles.js'
import ArticleCard from '../content/ArticleCard.jsx'
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
          {articles.slice(0, 3).map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

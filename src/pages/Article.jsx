import { Link, useParams } from 'react-router'
import ArticleCard from '../components/content/ArticleCard.jsx'
import { articles, findArticle } from '../data/articles.js'
import NotFound from './NotFound.jsx'

const toc = [
  { id: 'idea', label: 'فهم الفكرة' },
  { id: 'practice', label: 'خطوة عملية' },
  { id: 'remember', label: 'ما الذي تتذكره؟' },
]

const sectionHeading = 'scroll-mt-28 pt-[38px] text-[26px] leading-[39px] tracking-[-0.02em] md:text-[30px]'
const bodyText = 'pt-2.5 text-lg leading-9'

export default function Article() {
  const { slug } = useParams()
  const article = findArticle(slug)
  if (!article) return <NotFound />

  const related = articles.filter((item) => item.slug !== article.slug && item.category === article.category)
  const more = (related.length ? related : articles.filter((item) => item.slug !== article.slug)).slice(0, 3)

  return (
    <>
      <title>{`${article.title} | ميورا`}</title>
      <meta name="description" content={article.excerpt} />
      <main className="flex-1 px-6 pt-[43px] pb-[100px]">
        <div className="mx-auto max-w-[980px]">
          <Link to="/content" className="inline-flex items-center gap-[7px] text-xl leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline md:text-2xl">
            <img src="/icons/content/back.svg" alt="" width="41" height="41" className="size-8 md:size-[41px]" />
            العودة إلى المكتبة
          </Link>
          <header className="mx-auto max-w-[800px] pt-[45px] text-center">
            <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">{article.category}</p>
            <h1 className="text-[34px] leading-[1.3] tracking-[-0.02em] md:text-[58px]">{article.title}</h1>
            <p className="pt-2 text-lg leading-[35px] text-(color:--color-page-muted) md:text-xl">{article.excerpt}</p>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">
              <img src="/icons/content/clock.svg" alt="" width="17" height="17" />
              {article.minutes} دقائق قراءة · محتوى تعليمي
            </p>
          </header>
          <img
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            className="mt-[45px] h-[260px] w-full rounded-[28px] object-cover md:h-[480px]"
          />
          <div className="mt-[65px] grid gap-10 lg:grid-cols-[minmax(0,710px)_210px] lg:justify-between">
            <article>
              <section aria-labelledby="idea">
                <h2 id="idea" className={sectionHeading}>{article.idea.heading}</h2>
                {article.idea.paragraphs.map((text) => (
                  <p key={text} className={bodyText}>{text}</p>
                ))}
                <blockquote className="mt-[30px] rounded-[14px] border-s-4 border-(--color-page-button) bg-(--color-page-guide-selected) p-[22px] text-lg leading-9 text-(color:--color-page-primary)">
                  {article.idea.quote}
                </blockquote>
              </section>
              <section aria-labelledby="practice">
                <h2 id="practice" className={sectionHeading}>{article.practice.heading}</h2>
                {article.practice.paragraphs.map((text) => (
                  <p key={text} className={bodyText}>{text}</p>
                ))}
                <div className="mt-7 flex items-start gap-4 rounded-[18px] bg-(--color-page-card) p-[22px]">
                  <img src="/icons/content/practice.svg" alt="" width="20" height="20" className="mt-1 shrink-0" />
                  <div>
                    <h3 className="text-lg leading-[23.4px] tracking-[-0.02em]">تمرين عملي</h3>
                    <p className="pt-1 text-lg leading-9">{article.practice.exercise}</p>
                  </div>
                </div>
              </section>
              <section aria-labelledby="remember">
                <h2 id="remember" className={sectionHeading}>نقاط تستحق أن تتذكرها</h2>
                <ul className="list-disc ps-5 pt-2.5 text-lg leading-9 marker:text-(color:--color-page-button)">
                  {article.remember.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
              {article.sources?.length > 0 && (
                <p className="mt-12 text-lg leading-9 text-(color:--color-page-muted)">
                  <span className="font-bold text-(color:--color-page-heading)">للاستزادة: </span>
                  {article.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 && ' · '}
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                        {source.title}
                      </a>{' '}
                      ({source.org})
                      <span className="sr-only"> يفتح في نافذة جديدة</span>
                    </span>
                  ))}
                </p>
              )}
              <div role="note" className="mt-8 flex items-start gap-5 rounded-(--radius-page-card) bg-(--color-page-card) p-7 shadow-(--shadow-page-card)">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="26" height="29" viewBox="0 0 17.9125 20" fill="none" stroke="currentColor" strokeWidth="1.34344" strokeLinecap="round" strokeLinejoin="round" className="mt-2 shrink-0 text-(color:--color-page-primary)">
                  <path d="M8.95625 17.4635C8.95625 17.4635 14.9271 14.4781 14.9271 10V4.77552L8.95625 2.53646L2.98542 4.77552V10C2.98542 14.4781 8.95625 17.4635 8.95625 17.4635Z" />
                  <path d="M6.71719 10L8.2099 11.4927L11.1953 8.50729" />
                </svg>
                <p className="text-lg leading-9 md:text-xl md:leading-10">
                  هذا المقال محتوى تعليمي عام، ولا يغني عن التشخيص أو العلاج المتخصص.{' '}
                  <Link to="/help" className="font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                    متى أطلب دعمًا متخصصًا؟
                  </Link>
                </p>
              </div>
            </article>
            <aside aria-label="في هذا المقال" className="order-first lg:order-none">
              <nav className="rounded-2xl border-s-[1.6px] border-(--color-page-guide-selected) bg-(--color-page-surface) px-4 py-2 drop-shadow-[0_4px_2px_rgb(0_0_0/0.25)] lg:sticky lg:top-32">
                <p className="text-base leading-7 font-bold">في هذا المقال</p>
                <ul className="pb-1">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="block pt-3 text-sm leading-[24.5px] text-(color:--color-page-muted) outline-(--color-page-primary) hover:text-(color:--color-page-primary)">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
          <section aria-labelledby="more-title" className="mt-20">
            <h2 id="more-title" className="text-[26px] leading-[39px] tracking-[-0.02em] md:text-[30px]">
              {related.length ? 'مقالات من نفس الموضوع' : 'مقالات قد تهمك'}
            </h2>
            <ul className="mt-6 grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <li key={item.slug}>
                  <ArticleCard article={item} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}

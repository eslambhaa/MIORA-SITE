import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import ArticleCard from '../components/content/ArticleCard.jsx'
import { articles, categories } from '../data/articles.js'
import { normalizeArabic } from '../lib/arabicSearch.js'

const ALL = 'الكل'

const chipBase =
  'min-h-[45.6px] cursor-pointer rounded-full border px-[15px] py-2 text-base leading-7 outline-(--color-page-primary) transition-colors duration-200 motion-reduce:transition-none'
const chipIdle = 'border-(--color-page-border) bg-(--color-page-surface) text-(color:--color-page-heading) hover:border-(--color-page-button)'
const chipActive = 'border-(--color-page-button) bg-(--color-page-button) text-white'

export default function Content() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = categories.includes(params.get('category')) ? params.get('category') : ALL

  const results = useMemo(() => {
    const needle = normalizeArabic(query)
    return articles.filter((article) => {
      if (category !== ALL && article.category !== category) return false
      if (!needle) return true
      return normalizeArabic(`${article.title} ${article.excerpt} ${article.category}`).includes(needle)
    })
  }, [query, category])

  function update(next) {
    const merged = { q: query, category, ...next }
    const clean = {}
    if (merged.q) clean.q = merged.q
    if (merged.category && merged.category !== ALL) clean.category = merged.category
    setParams(clean, { replace: true })
  }

  return (
    <>
      <title>المحتوى التوعوي | ميورا</title>
      <meta name="description" content="مقالات قصيرة ومبسّطة عن المشاعر والتوتر والنوم ومهارات التعامل والعادات، بلغة محترمة وغير وصمية." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[50px] text-center md:pb-[90px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">المحتوى التوعوي</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">معرفة بسيطة، أثرها يمتد</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">اقرأ في وقتك، وخذ من كل موضوع ما يناسب لحظتك دون ضغط.</p>
        </section>
        <section aria-label="مقالات المكتبة" className="px-6 pb-[105px]">
          <div className="mx-auto max-w-[1026px]">
            <div role="search" className="flex flex-col items-center gap-[22px]">
              <label className="flex h-[58px] w-full max-w-[550px] items-center gap-2.5 rounded-full border border-(--color-page-input-border) bg-(--color-page-surface) px-5 focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-(--color-page-primary)">
                <img src="/icons/content/search.svg" alt="" width="19" height="20" />
                <span className="sr-only">البحث في المحتوى</span>
                <input
                  type="search"
                  value={query}
                  maxLength={80}
                  onChange={(event) => update({ q: event.target.value })}
                  placeholder="ابحث عن موضوع أو كلمة…"
                  className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-(color:--color-page-muted)"
                />
              </label>
              <div role="group" aria-label="التصنيفات" className="flex flex-wrap justify-center gap-2">
                {[ALL, ...categories].map((item) => {
                  const active = item === category
                  return (
                    <button key={item} type="button" aria-pressed={active} onClick={() => update({ category: item })} className={`${chipBase} ${active ? chipActive : chipIdle}`}>
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
            <p role="status" className="mt-[35px] mb-4 text-base leading-7 text-(color:--color-page-muted)">
              {results.length === 0 ? 'لا توجد مقالات مطابقة.' : `${results.length} ${results.length > 10 ? 'مقالًا' : results.length > 2 ? 'مقالات' : results.length === 2 ? 'مقالان' : 'مقال'}`}
            </p>
            {results.length > 0 ? (
              <ul className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                {results.map((article) => (
                  <li key={article.slug}>
                    <ArticleCard article={article} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) px-6 py-14 text-center">
                <p className="text-xl leading-8">لم نجد ما تبحث عنه.</p>
                <p className="text-base leading-7 text-(color:--color-page-muted)">جرّب كلمة أخرى، أو اعرض كل المقالات.</p>
                <button type="button" onClick={() => setParams({}, { replace: true })} className="min-h-12 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-[22px] text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary)">
                  عرض كل المقالات
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

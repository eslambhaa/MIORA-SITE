import { useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import ArticleCard from '../components/content/ArticleCard.jsx'
import MediaCard from '../components/content/MediaCard.jsx'
import { categories } from '../data/articles.js'
import { useArticleList } from '../lib/articles.js'
import { normalizeArabic } from '../lib/arabicSearch.js'
import { useResources } from '../lib/resources.js'

const ALL = 'الكل'

const tabs = [
  { id: 'articles', label: 'مقالات', nouns: ['مقال', 'مقالان', 'مقالات', 'مقالًا'], none: 'لا توجد مقالات مطابقة.', reset: 'عرض كل المقالات' },
  { id: 'videos', label: 'فيديوهات', nouns: ['فيديو', 'فيديوهان', 'فيديوهات', 'فيديو'], none: 'لا توجد فيديوهات مطابقة.', reset: 'عرض كل الفيديوهات', soon: 'نجهّز فيديوهات عربية مختارة، وستظهر هنا قريبًا.' },
  { id: 'podcasts', label: 'بودكاست', nouns: ['بودكاست', 'بودكاستان', 'بودكاست', 'بودكاست'], none: 'لا توجد حلقات مطابقة.', reset: 'عرض كل البودكاست', soon: 'نجهّز بودكاست عربيًا مختارًا، وسيظهر هنا قريبًا.' },
]

const chipBase =
  'min-h-[45.6px] cursor-pointer rounded-full border px-[15px] py-2 text-base leading-7 outline-(--color-page-primary) transition-colors duration-200 motion-reduce:transition-none'
const chipIdle = 'border-(--color-page-border) bg-(--color-page-surface) text-(color:--color-page-heading) hover:border-(--color-page-button)'
const chipActive = 'border-(--color-page-button) bg-(--color-page-button) text-white'

function countText(total, [one, two, few, many]) {
  if (total === 1) return `1 ${one}`
  if (total === 2) return two
  return `${total} ${total > 10 ? many : few}`
}

export default function Content() {
  const [params, setParams] = useSearchParams()
  const tab = tabs.find((item) => item.id === params.get('type')) ?? tabs[0]
  const query = params.get('q') ?? ''
  const category = categories.includes(params.get('category')) ? params.get('category') : ALL
  const tabRefs = useRef({})

  const isMedia = tab.id !== 'articles'
  const { rows, status } = useResources(isMedia)
  const { articles, loading: articlesLoading } = useArticleList()
  const mediaKind = tab.id === 'videos' ? 'video' : 'podcast'

  const needle = normalizeArabic(query)
  const results = useMemo(() => {
    const matches = (text, itemCategory) => (category === ALL || itemCategory === category) && (!needle || normalizeArabic(text).includes(needle))
    if (tab.id === 'articles') {
      return articles.filter((article) => matches(`${article.title} ${article.excerpt} ${article.category}`, article.category))
    }
    return (rows ?? []).filter((row) => row.kind === mediaKind && matches(`${row.title} ${row.description} ${row.source} ${row.topic ?? ''}`, row.topic))
  }, [tab.id, rows, mediaKind, needle, category, articles])

  const kindTotal = isMedia ? (rows ?? []).filter((row) => row.kind === mediaKind).length : articles.length

  function update(next) {
    const merged = { type: tab.id, q: query, category, ...next }
    const clean = {}
    if (merged.type && merged.type !== 'articles') clean.type = merged.type
    if (merged.q) clean.q = merged.q
    if (merged.category && merged.category !== ALL) clean.category = merged.category
    setParams(clean, { replace: true })
  }

  // The page is right-to-left: the left arrow moves to the next tab, the right arrow to the previous one.
  function onTabKeyDown(event, index) {
    const moves = { ArrowLeft: 1, ArrowRight: -1 }
    let target
    if (event.key in moves) target = (index + moves[event.key] + tabs.length) % tabs.length
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = tabs.length - 1
    if (target === undefined) return
    event.preventDefault()
    update({ type: tabs[target].id })
    tabRefs.current[tabs[target].id]?.focus()
  }

  const loading = isMedia ? !rows && status !== 'error' : articlesLoading
  const failed = isMedia && !rows && status === 'error'
  const nothingYet = isMedia && rows && kindTotal === 0

  return (
    <>
      <title>المحتوى التوعوي | ميورا</title>
      <meta name="description" content="مقالات وفيديوهات وبودكاست عربي عن المشاعر والتوتر والنوم ومهارات التعامل والعادات، بلغة محترمة وغير وصمية." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[50px] text-center md:pb-[90px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">المحتوى التوعوي</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">معرفة بسيطة، أثرها يمتد</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">اقرأ أو شاهد أو استمع في وقتك، وخذ من كل موضوع ما يناسب لحظتك دون ضغط.</p>
        </section>
        <section aria-label="مكتبة المحتوى" className="px-6 pb-[105px]">
          <div className="mx-auto max-w-[1026px]">
            <div className="flex flex-col items-center gap-[22px]">
              <div role="tablist" aria-label="نوع المحتوى" className="flex w-full max-w-[550px] gap-1 rounded-full border border-(--color-page-border) bg-(--color-page-surface) p-1">
                {tabs.map((item, index) => {
                  const active = item.id === tab.id
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        tabRefs.current[item.id] = node
                      }}
                      type="button"
                      role="tab"
                      id={`tab-${item.id}`}
                      aria-selected={active}
                      aria-controls="content-panel"
                      tabIndex={active ? 0 : -1}
                      onClick={() => update({ type: item.id })}
                      onKeyDown={(event) => onTabKeyDown(event, index)}
                      className={`min-h-12 flex-1 cursor-pointer rounded-full px-3 text-base leading-7 font-bold outline-(--color-page-primary) transition-colors duration-200 motion-reduce:transition-none ${active ? 'bg-(--color-page-button) text-white' : 'text-(color:--color-page-heading) hover:bg-(--color-page-card)'}`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
              <div role="search" className="flex w-full flex-col items-center gap-[22px]">
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
            </div>
            <div role="tabpanel" id="content-panel" aria-labelledby={`tab-${tab.id}`} tabIndex={-1}>
              <p role="status" className="mt-[35px] mb-4 text-base leading-7 text-(color:--color-page-muted)">
                {loading ? 'جارٍ التحميل…' : failed ? 'تعذّر تحميل المحتوى الآن. حاول مرة أخرى بعد قليل.' : nothingYet ? tab.soon : results.length === 0 ? tab.none : countText(results.length, tab.nouns)}
              </p>
              {isMedia && (
                <p className="mb-6 max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">
                  {tab.id === 'videos' ? 'الفيديوهات' : 'الحلقات'} تعبّر عن رأي أصحابها وتُعرض هنا للتوعية، ولا تغني عن استشارة متخصص.
                </p>
              )}
              {results.length > 0 ? (
                <ul className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item) => (
                    <li key={item.slug ?? item.id}>
                      {isMedia ? <MediaCard item={item} headingLevel="h2" /> : <ArticleCard article={item} headingLevel="h2" />}
                    </li>
                  ))}
                </ul>
              ) : (
                !loading &&
                !failed &&
                !nothingYet && (
                  <div className="flex flex-col items-center gap-4 rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) px-6 py-14 text-center">
                    <p className="text-xl leading-8">لم نجد ما تبحث عنه.</p>
                    <p className="text-base leading-7 text-(color:--color-page-muted)">جرّب كلمة أخرى، أو اعرض كل المحتوى.</p>
                    <button type="button" onClick={() => update({ q: '', category: ALL })} className="min-h-12 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-[22px] text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary)">
                      {tab.reset}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { isReviewed, listAllArticles } from '../lib/adminArticles.js'

const date = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeZone: 'Africa/Cairo' })
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryLink =
  'inline-flex min-h-11 items-center rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary)'

function Badge({ tone, children }) {
  const tones = {
    ok: 'bg-(--color-page-guide-selected) text-(color:--color-page-primary)',
    warn: 'bg-(--color-page-card) text-(color:--color-page-heading)',
    muted: 'border border-(--color-page-border) text-(color:--color-page-muted)',
  }
  return <span className={`rounded-full px-3 py-1 text-sm leading-5 font-bold ${tones[tone]}`}>{children}</span>
}

export default function AdminArticles() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')
    try {
      setRows(await listAllArticles())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    let ignore = false
    listAllArticles()
      .then((data) => {
        if (ignore) return
        setRows(data)
        setStatus('ready')
      })
      .catch(() => !ignore && setStatus('error'))
    return () => {
      ignore = true
    }
  }, [])

  const published = rows.filter((row) => row.status === 'published')
  const unreviewed = published.filter((row) => !isReviewed(row))

  return (
    <>
      <title>المقالات | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">المقالات</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">اكتب وعدّل وانشر وأخفِ، وتابع مراجعة المتخصص.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>
            <Link to="/admin/articles/new" className={primaryLink}>مقال جديد</Link>
          </div>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-muted)">
              تعذّر تحميل المقالات.{' '}
              <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && (
            <>
              <section aria-labelledby="summary-title" className={`${card} p-6`}>
                <h2 id="summary-title" className="text-xl leading-[1.4]">الملخص</h2>
                <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">
                  {published.length} منشورة · {rows.length - published.length} مسودة
                </p>
                {unreviewed.length > 0 ? (
                  <p role="status" className="mt-3 rounded-[14px] bg-(--color-page-card) p-4 text-base leading-7">
                    <strong>{unreviewed.length}</strong> من المقالات المنشورة لم يراجعها متخصص بعد. المحتوى تعليمي عام، والأفضل أن يراجعه متخصص نفسي، خصوصًا مقالات الوعي بالإدمان.
                  </p>
                ) : (
                  published.length > 0 && <p className="mt-3 text-base leading-7">كل المقالات المنشورة عليها مراجعة متخصص.</p>
                )}
              </section>

              <section aria-labelledby="list-title">
                <h2 id="list-title" className="sr-only">قائمة المقالات</h2>
                {rows.length === 0 ? (
                  <p className={`${card} p-6 text-base text-(color:--color-page-muted)`}>لا توجد مقالات بعد.</p>
                ) : (
                  <ul className="grid gap-3">
                    {rows.map((row) => (
                      <li key={row.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg leading-7 font-bold">{row.title}</p>
                          <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">
                            {row.category} · آخر تعديل {date.format(new Date(row.updated_at))} · ترتيب {row.sort_order}
                          </p>
                          <p className="mt-2 flex flex-wrap gap-2">
                            <Badge tone={row.status === 'published' ? 'ok' : 'muted'}>{row.status === 'published' ? 'منشور' : 'مسودة'}</Badge>
                            <Badge tone={isReviewed(row) ? 'ok' : 'warn'}>{isReviewed(row) ? `راجعه: ${row.reviewed_by}` : 'لم يُراجَع'}</Badge>
                          </p>
                        </div>
                        <Link
                          to={`/admin/articles/${row.id}`}
                          className="inline-flex min-h-11 items-center rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary)"
                        >
                          تعديل<span className="sr-only">: {row.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}

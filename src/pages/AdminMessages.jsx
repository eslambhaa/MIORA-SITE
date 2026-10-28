import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PAGE_SIZE, countMessages, deleteMessage, listMessages, messageErrorMessage, replyLink, setStatus, statusLabel } from '../lib/adminMessages.js'

const dateTime = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' })
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const outlineButton =
  'inline-flex min-h-11 cursor-pointer items-center rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const chipBase = 'min-h-11 cursor-pointer rounded-full border px-4 text-base leading-7 outline-(--color-page-primary)'

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'new', label: 'جديدة' },
  { id: 'replied', label: 'تم الرد' },
]

export default function AdminMessages() {
  const [filter, setFilter] = useState('all')
  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState(null)
  const [status, setStatus_] = useState('loading')
  const [more, setMore] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [message, setMessage] = useState(null)

  const load = useCallback(async (nextFilter) => {
    setStatus_('loading')
    try {
      const [page, totals] = await Promise.all([listMessages({ filter: nextFilter }), countMessages()])
      setRows(page)
      setMore(page.length === PAGE_SIZE)
      setCounts(totals)
      setStatus_('ready')
    } catch {
      setStatus_('error')
    }
  }, [])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  async function loadMore() {
    setBusyId('more')
    try {
      const page = await listMessages({ filter, offset: rows.length })
      setRows((current) => [...current, ...page])
      setMore(page.length === PAGE_SIZE)
    } catch (error) {
      setMessage({ ok: false, text: messageErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  async function changeStatus(row, next) {
    setBusyId(row.id)
    setMessage(null)
    try {
      await setStatus(row.id, next)
      setMessage({ ok: true, text: next === 'replied' ? 'عُلّمت الرسالة بأنه تم الرد.' : 'أُعيدت الرسالة إلى «جديدة».' })
      await load(filter)
    } catch (error) {
      setMessage({ ok: false, text: messageErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(row) {
    setBusyId(row.id)
    setMessage(null)
    try {
      await deleteMessage(row.id)
      setConfirming(null)
      setMessage({ ok: true, text: 'حُذفت الرسالة.' })
      await load(filter)
    } catch (error) {
      setMessage({ ok: false, text: messageErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <title>رسائل التواصل | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">رسائل التواصل</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">ما أرسله الزوار عبر صفحة «تواصل معنا».</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>

          <aside className={`${card} p-5`}>
            <p className="text-base leading-7 text-(color:--color-page-muted)">
              هذه رسائل كتبها أصحابها ليقرأها فريق ميورا فقط. لا يظهر هنا حساب المرسل ولا أي محتوى آخر من استخدامه للمنصة. الرد يتم من بريدك، ثم تعلّم الرسالة بأنه تم الرد.
            </p>
          </aside>

          <div role="group" aria-label="تصفية الرسائل" className="flex flex-wrap items-center gap-2">
            {filters.map((item) => {
              const active = item.id === filter
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={`${chipBase} ${active ? 'border-(--color-page-button) bg-(--color-page-button) text-white' : 'border-(--color-page-border) bg-(--color-page-surface) text-(color:--color-page-heading)'}`}
                >
                  {item.label}
                  {counts && item.id !== 'replied' && <span className="ms-1">({item.id === 'all' ? counts.total : counts.fresh})</span>}
                </button>
              )
            })}
          </div>

          <div aria-live="polite">
            {message && <p role="status" className={`text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
          </div>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-muted)">
              تعذّر تحميل الرسائل.{' '}
              <button type="button" onClick={() => load(filter)} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && rows.length === 0 && <p className={`${card} p-6 text-base text-(color:--color-page-muted)`}>لا توجد رسائل هنا.</p>}

          {status === 'ready' && rows.length > 0 && (
            <ul className="grid gap-3">
              {rows.map((row) => {
                const mailto = replyLink(row)
                return (
                  <li key={row.id} className={`${card} p-5`}>
                    <article aria-labelledby={`m-${row.id}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 id={`m-${row.id}`} className="min-w-0 text-lg leading-7 font-bold break-words">{row.subject}</h2>
                        <span className={`rounded-full px-3 py-1 text-sm leading-5 font-bold ${row.status === 'new' ? 'bg-(--color-page-card) text-(color:--color-page-heading)' : 'border border-(--color-page-border) text-(color:--color-page-muted)'}`}>{statusLabel[row.status]}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">
                        {row.name} · <bdi dir="ltr">{row.email}</bdi> · <time dateTime={row.created_at}>{dateTime.format(new Date(row.created_at))}</time>
                      </p>
                      <p className="mt-3 text-base leading-8 break-words whitespace-pre-wrap">{row.message}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {mailto && (
                          <a href={mailto} className={outlineButton}>رد بالبريد<span className="sr-only"> على: {row.subject}</span></a>
                        )}
                        {row.status === 'new' ? (
                          <button type="button" disabled={busyId === row.id} onClick={() => changeStatus(row, 'replied')} className={primaryButton}>تم الرد<span className="sr-only">: {row.subject}</span></button>
                        ) : (
                          <button type="button" disabled={busyId === row.id} onClick={() => changeStatus(row, 'new')} className={outlineButton}>أعدها جديدة<span className="sr-only">: {row.subject}</span></button>
                        )}
                        {confirming === row.id ? (
                          <span className="flex items-center gap-2">
                            <button type="button" disabled={busyId === row.id} onClick={() => remove(row)} className={primaryButton}>تأكيد الحذف</button>
                            <button type="button" onClick={() => setConfirming(null)} className={outlineButton}>تراجع</button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => setConfirming(row.id)} className={outlineButton}>حذف<span className="sr-only"> الرسالة: {row.subject}</span></button>
                        )}
                      </div>
                      {!mailto && <p className="mt-2 text-sm leading-6 text-(color:--color-page-muted)">هذا البريد بصيغة غير معتادة فلا يوجد زر رد. انسخه يدويًا بعد التأكد منه.</p>}
                    </article>
                  </li>
                )
              })}
            </ul>
          )}

          {status === 'ready' && more && (
            <button type="button" disabled={busyId === 'more'} onClick={loadMore} className={`${outlineButton} justify-self-center`}>عرض المزيد</button>
          )}
        </div>
      </main>
    </>
  )
}

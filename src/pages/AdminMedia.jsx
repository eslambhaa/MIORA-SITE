import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { checkLabel, kindLabel, listAllMedia, mediaErrorMessage, runCheck } from '../lib/adminMedia.js'

const dateTime = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' })
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const outlineLink =
  'inline-flex min-h-11 items-center rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary)'

function Badge({ tone, children }) {
  const tones = {
    ok: 'bg-(--color-page-guide-selected) text-(color:--color-page-primary)',
    warn: 'bg-(--color-page-card) text-(color:--color-page-heading)',
    muted: 'border border-(--color-page-border) text-(color:--color-page-muted)',
  }
  return <span className={`rounded-full px-3 py-1 text-sm leading-5 font-bold ${tones[tone]}`}>{children}</span>
}

function CheckBadge({ check }) {
  if (!check) return <Badge tone="muted">لم يُفحص</Badge>
  if (check.status === 'ok') return <Badge tone="ok">يعمل</Badge>
  return <Badge tone="warn">{check.status === 'failed' ? 'به مشكلة' : 'غير مؤكد'}</Badge>
}

export default function AdminMedia() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  async function load() {
    try {
      setRows(await listAllMedia())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    let ignore = false
    listAllMedia()
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

  async function checkAll() {
    setBusy(true)
    setMessage(null)
    try {
      const results = await runCheck(null)
      const failed = results.filter((result) => result.status === 'failed').length
      setMessage({ ok: failed === 0, text: failed ? `انتهى الفحص: ${failed} من ${results.length} بها مشكلة.` : `انتهى الفحص: ${results.length} من ${results.length} تعمل.` })
      await load()
    } catch (error) {
      setMessage({ ok: false, text: mediaErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  const published = rows.filter((row) => row.published)
  const failing = rows.filter((row) => row.check?.status === 'failed')
  const never = published.filter((row) => !row.check)

  return (
    <>
      <title>الحلقات | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">الحلقات</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">أضف الفيديو والبودكاست من رابط، وتأكد أنها ما زالت تعمل.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>
            <Link to="/admin/media/new" className="inline-flex min-h-11 items-center rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary)">حلقة جديدة</Link>
          </div>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-muted)">
              تعذّر تحميل الحلقات.{' '}
              <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && (
            <>
              <section aria-labelledby="summary-title" className={`${card} p-6`}>
                <h2 id="summary-title" className="text-xl leading-[1.4]">الملخص وفحص الروابط</h2>
                <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">
                  {published.length} ظاهرة للزوار · {rows.length - published.length} مخفية
                </p>
                {failing.length > 0 && (
                  <p role="status" className="mt-3 rounded-[14px] bg-(--color-page-card) p-4 text-base leading-7">
                    <strong>{failing.length}</strong> من الحلقات بها مشكلة في آخر فحص. روابط الناشرين تتغير وتنتهي، فعدّل الرابط أو أخفِ الحلقة.
                  </p>
                )}
                {never.length > 0 && <p className="mt-3 text-base leading-7 text-(color:--color-page-muted)">{never.length} من الحلقات الظاهرة لم تُفحص بعد.</p>}
                <p className="mt-3 text-sm leading-6 text-(color:--color-page-muted)">الفحص يتأكد من الفيديو (يوتيوب)، وملف الصوت، وصفحة الحلقة. بعض المواقع ترفض الفحص الآلي فتظهر «غير مؤكد».</p>
                <button type="button" onClick={checkAll} disabled={busy} aria-busy={busy} className={`${primaryButton} mt-4`}>
                  {busy ? 'جارٍ الفحص…' : 'افحص كل الروابط'}
                </button>
                <div aria-live="polite">
                  {message && <p role="status" className={`mt-3 text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
                </div>
              </section>

              <section aria-labelledby="list-title">
                <h2 id="list-title" className="sr-only">قائمة الحلقات</h2>
                {rows.length === 0 ? (
                  <p className={`${card} p-6 text-base text-(color:--color-page-muted)`}>لا توجد حلقات بعد.</p>
                ) : (
                  <ul className="grid gap-3">
                    {rows.map((row) => (
                      <li key={row.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg leading-7 font-bold">{row.title}</p>
                          <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">
                            {kindLabel[row.kind]} · {row.topic ?? 'بلا موضوع'} · ترتيب {row.sort_order}
                          </p>
                          <p className="mt-2 flex flex-wrap gap-2">
                            <Badge tone={row.published ? 'ok' : 'muted'}>{row.published ? 'ظاهرة' : 'مخفية'}</Badge>
                            <CheckBadge check={row.check} />
                          </p>
                          {row.check && row.check.status !== 'ok' && row.check.detail && (
                            <p className="mt-2 text-sm leading-6">{checkLabel(row.check.detail)}</p>
                          )}
                          {row.check && <p className="mt-1 text-xs leading-5 text-(color:--color-page-muted)">آخر فحص: {dateTime.format(new Date(row.check.checked_at))}</p>}
                        </div>
                        <Link to={`/admin/media/${row.id}`} className={outlineLink}>
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

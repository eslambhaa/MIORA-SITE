import { useCallback, useEffect, useState } from 'react'
import { adminErrorMessage, auditLabels, listAdmins, listAudit, setAdmin } from '../lib/admin.js'

const dateTime = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' })

const upcoming = [
  { title: 'المقالات', text: 'كتابة وتعديل وإخفاء، وقائمة مراجعة المتخصص.' },
  { title: 'الحلقات', text: 'إضافة الفيديو والبودكاست وفحص الروابط.' },
  { title: 'رسائل التواصل', text: 'قراءة وحالة الرد والحذف.' },
  { title: 'أرقام الطوارئ', text: 'تعديل أرقام صفحة المساعدة.' },
  { title: 'الإحصاءات', text: 'أعداد مجمّعة فقط، بلا أي محتوى شخصي.' },
  { title: 'الإشعارات والنسخ الاحتياطي', text: 'رسائل الإشعارات وتصدير المحتوى.' },
]

const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const outlineButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'

function AdminsSection({ onChanged }) {
  const [admins, setAdmins] = useState([])
  const [status, setStatus] = useState('loading')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [confirming, setConfirming] = useState(null)

  const load = useCallback(async () => {
    try {
      setAdmins(await listAdmins())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function change(target, makeAdmin) {
    setBusy(true)
    setMessage(null)
    try {
      await setAdmin(target, makeAdmin)
      setMessage({ ok: true, text: makeAdmin ? 'أُضيف المشرف.' : 'سُحبت الصلاحية.' })
      if (makeAdmin) setEmail('')
      setConfirming(null)
      onChanged()
      await load()
    } catch (error) {
      setMessage({ ok: false, text: adminErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(event) {
    event.preventDefault()
    const value = email.trim()
    if (!value) {
      setMessage({ ok: false, text: 'اكتب البريد الإلكتروني للمشرف الجديد.' })
      return
    }
    change(value, true)
  }

  return (
    <section aria-labelledby="admins-title" className={`${card} p-6`}>
      <h2 id="admins-title" className="text-2xl leading-[1.4]">المشرفون</h2>
      <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">من يملك صلاحية لوحة التحكم. يجب أن يكون للشخص حساب في ميورا أولًا.</p>

      {status === 'loading' && <p role="status" className="mt-4 text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
      {status === 'error' && (
        <p role="status" className="mt-4 text-base text-(color:--color-page-muted)">
          تعذّر تحميل المشرفين.{' '}
          <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
            أعد المحاولة
          </button>
        </p>
      )}

      {status === 'ready' && (
        <ul className="mt-4 divide-y divide-(--color-page-border)">
          {admins.map((admin) => (
            <li key={admin.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-base leading-7" dir="ltr">{admin.email}</p>
                <p className="text-sm leading-6 text-(color:--color-page-muted)">منذ {dateTime.format(new Date(admin.added_at))}{admin.is_me ? ' · أنت' : ''}</p>
              </div>
              {admins.length > 1 && !admin.is_me &&
                (confirming === admin.user_id ? (
                  <span className="flex items-center gap-2">
                    <button type="button" disabled={busy} onClick={() => change(admin.email, false)} className={primaryButton}>
                      تأكيد السحب
                    </button>
                    <button type="button" onClick={() => setConfirming(null)} className={outlineButton}>
                      تراجع
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirming(admin.user_id)} className={outlineButton}>
                    سحب الصلاحية
                  </button>
                ))}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="admin-email" className="mb-1 block text-sm font-bold leading-6">بريد مشرف جديد</label>
          <input
            id="admin-email"
            type="email"
            dir="ltr"
            autoComplete="off"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full rounded-[14px] border border-(--color-page-input-border) bg-(--color-page-surface) px-4 text-base outline-(--color-page-primary)"
          />
        </div>
        <button type="submit" disabled={busy} className={primaryButton}>إضافة مشرف</button>
      </form>
      {message && (
        <p role="status" className={`mt-3 text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>
          {message.text}
        </p>
      )}
    </section>
  )
}

function AuditSection({ refreshKey }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    let ignore = false
    Promise.all([listAudit(50), listAdmins()])
      .then(([log, admins]) => {
        if (ignore) return
        setRows(log)
        setMyId(admins.find((admin) => admin.is_me)?.user_id ?? null)
        setStatus('ready')
      })
      .catch(() => !ignore && setStatus('error'))
    return () => {
      ignore = true
    }
  }, [refreshKey])

  return (
    <section aria-labelledby="audit-title" className={`${card} p-6`}>
      <h2 id="audit-title" className="text-2xl leading-[1.4]">سجل التعديلات</h2>
      <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">آخر 50 إجراءً: من فعل ماذا ومتى. لا يحتوي على أي نص شخصي.</p>
      {status === 'loading' && <p role="status" className="mt-4 text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
      {status === 'error' && <p role="status" className="mt-4 text-base text-(color:--color-page-muted)">تعذّر تحميل السجل الآن.</p>}
      {status === 'ready' && rows.length === 0 && <p className="mt-4 text-base text-(color:--color-page-muted)">لا توجد إجراءات مسجّلة بعد.</p>}
      {rows.length > 0 && (
        <ul className="mt-4 divide-y divide-(--color-page-border)">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-base leading-7">
              <span>
                {auditLabels[row.action] ?? row.action}
                <span className="text-(color:--color-page-muted)"> · {row.admin_id && row.admin_id === myId ? 'أنت' : 'مشرف'}</span>
              </span>
              <time dateTime={row.created_at} className="text-sm text-(color:--color-page-muted)">{dateTime.format(new Date(row.created_at))}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Admin() {
  const [auditKey, setAuditKey] = useState(0)
  return (
    <>
      <title>لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">ميورا</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">لوحة التحكم</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">إدارة محتوى ميورا وفريقها.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <aside className={`${card} p-6`}>
            <h2 className="text-xl leading-[1.4]">الخصوصية أولًا</h2>
            <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">
              هذه اللوحة لا تعرض أبدًا نص المذكرات ولا محادثات المساعد ولا نتائج التقييمات ولا تسجيلات المزاج الفردية، ولا تدير حسابات المستخدمين بأسمائهم. الإحصاءات تكون أعدادًا مجمّعة فقط.
            </p>
          </aside>
          <section aria-labelledby="soon-title">
            <h2 id="soon-title" className="mb-3 text-2xl leading-[1.4]">أقسام قادمة</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((item) => (
                <li key={item.title} className={`${card} p-5`}>
                  <p className="text-lg font-bold leading-7">{item.title}</p>
                  <p className="mt-1 text-base leading-7 text-(color:--color-page-muted)">{item.text}</p>
                  <p className="mt-2 text-sm font-bold text-(color:--color-page-primary)">قريبًا</p>
                </li>
              ))}
            </ul>
          </section>
          <AdminsSection onChanged={() => setAuditKey((n) => n + 1)} />
          <AuditSection refreshKey={auditKey} />
        </div>
      </main>
    </>
  )
}

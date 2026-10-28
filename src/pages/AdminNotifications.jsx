import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  announcementState,
  announcementToForm,
  createAnnouncement,
  deleteAnnouncement,
  emptyAnnouncement,
  listAnnouncements,
  listTemplates,
  notificationErrorMessage,
  previewWeekly,
  saveTemplate,
  stateLabel,
  templateDefaults,
  templateInfo,
  updateAnnouncement,
  validateAnnouncement,
  validateTemplate,
} from '../lib/adminNotifications.js'

const dateTime = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' })
const input = 'min-h-11 w-full rounded-[14px] border border-(--color-page-input-border) bg-(--color-page-surface) px-4 text-base outline-(--color-page-primary)'
const area = `${input} py-3 leading-7`
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const outlineButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm leading-6 font-bold">{label}</label>
      {hint && <p id={`${id}-hint`} className="mb-1 text-sm leading-6 text-(color:--color-page-muted)">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-sm leading-6 text-(color:--color-page-error-text)">{error}</p>}
    </div>
  )
}

function AnnouncementForm({ prefix, initial, submitLabel, busy, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const set = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const props = (name) => ({
    id: `${prefix}-${name}`,
    value: form[name],
    onChange: set(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${prefix}-${name}-error` : undefined,
  })

  function submit(event) {
    event.preventDefault()
    const found = validateAnnouncement(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`${prefix}-${Object.keys(found)[0]}`)?.focus()
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field id={`${prefix}-title`} label="العنوان" error={errors.title}><input type="text" maxLength={120} {...props('title')} className={input} /></Field>
      <Field id={`${prefix}-body`} label="النص" hint="حتى 400 حرف. عبارات قصيرة وهادئة، بلا تشخيص أو نصائح علاجية." error={errors.body}><textarea rows={3} maxLength={400} {...props('body')} className={area} /></Field>
      <Field id={`${prefix}-link`} label="رابط داخل الموقع (اختياري)" hint="مثل /content?type=podcasts أو /relaxation. روابط خارجية غير مسموحة." error={errors.link}><input type="text" dir="ltr" maxLength={200} {...props('link')} className={input} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${prefix}-startsAt`} label="يظهر من" hint="اختر وقتًا لاحقًا لجدولته." error={errors.startsAt}><input type="datetime-local" dir="ltr" {...props('startsAt')} className={input} /></Field>
        <Field id={`${prefix}-expiresAt`} label="ينتهي في (اختياري)" error={errors.expiresAt}><input type="datetime-local" dir="ltr" {...props('expiresAt')} className={input} /></Field>
        <Field id={`${prefix}-published`} label="الحالة">
          <select {...props('published')} className={input}>
            <option value="true">منشور</option>
            <option value="false">مخفي</option>
          </select>
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'جارٍ الحفظ…' : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className={outlineButton}>إلغاء</button>}
      </div>
    </form>
  )
}

function TemplateEditor({ template, busy, onSave }) {
  const info = templateInfo[template.kind]
  const [form, setForm] = useState({ title: template.title, body: template.body })
  const [errors, setErrors] = useState({})
  const id = `tpl-${template.kind}`
  const set = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function submit(event) {
    event.preventDefault()
    const found = validateTemplate(template.kind, form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus()
      return
    }
    onSave(template.kind, form)
  }

  const changed = form.title.trim() !== template.title || form.body.trim() !== template.body

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 py-5">
      <h3 className="text-lg leading-7 font-bold">{info.label}</h3>
      <p className="text-sm leading-6 text-(color:--color-page-muted)">{info.when}</p>
      <Field id={`${id}-title`} label="العنوان" error={errors.title}>
        <input id={`${id}-title`} type="text" maxLength={120} value={form.title} onChange={set('title')} aria-invalid={errors.title ? true : undefined} aria-describedby={errors.title ? `${id}-title-error` : undefined} className={input} />
      </Field>
      <Field id={`${id}-body`} label="النص" error={errors.body}>
        <textarea id={`${id}-body`} rows={2} maxLength={380} value={form.body} onChange={set('body')} aria-invalid={errors.body ? true : undefined} aria-describedby={errors.body ? `${id}-body-error` : undefined} className={area} />
      </Field>
      {template.kind === 'weekly_some' && !errors.body && form.body.includes('{days}') && (
        <p className="text-sm leading-6 text-(color:--color-page-muted)">هكذا سيقرؤه من سجّل 3 أيام: «{previewWeekly(form.body.trim())}»</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy || !changed} className={primaryButton}>حفظ<span className="sr-only">: {info.label}</span></button>
        <button type="button" disabled={busy} onClick={() => { setForm({ ...templateDefaults[template.kind] }); setErrors({}) }} className={outlineButton}>استرجاع النص الأصلي<span className="sr-only">: {info.label}</span></button>
      </div>
    </form>
  )
}

export default function AdminNotifications() {
  const [announcements, setAnnouncements] = useState([])
  const [templates, setTemplates] = useState([])
  const [status, setStatus] = useState('loading')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const load = useCallback(async () => {
    try {
      const [list, texts] = await Promise.all([listAnnouncements(), listTemplates()])
      setAnnouncements(list)
      setTemplates(texts)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function run(action, success) {
    setBusy(true)
    setMessage(null)
    try {
      const result = await action()
      setMessage({ ok: true, text: result?.audited === false ? `${success} لكن تعذّر تسجيله في سجل التعديلات.` : success })
      setEditing(null)
      setAdding(false)
      setConfirming(null)
      await load()
    } catch (error) {
      setMessage({ ok: false, text: notificationErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <title>الإشعارات | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">الإشعارات</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">إعلانات الموقع ونصوص التذكيرات.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>

          <div aria-live="polite">
            {message && <p role="status" className={`text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
          </div>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-muted)">
              تعذّر التحميل.{' '}
              <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && (
            <>
              <section aria-labelledby="ann-title" className={`${card} min-w-0 p-6`}>
                <h2 id="ann-title" className="text-2xl leading-[1.4]">إعلانات الموقع</h2>
                <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">تظهر لكل الزوار في جرس الإشعارات وصفحة الإشعارات، في وقتها بين «يظهر من» و«ينتهي في». الإعلانات المخفية والمجدولة لا يراها الزوار.</p>
                {announcements.length === 0 && <p className="mt-4 text-base text-(color:--color-page-muted)">لا توجد إعلانات بعد.</p>}
                <ul className="mt-4 divide-y divide-(--color-page-border)">
                  {announcements.map((row) => {
                    const state = announcementState(row)
                    return (
                      <li key={row.id} className="py-4">
                        {editing === row.id ? (
                          <AnnouncementForm prefix={`edit-${row.id}`} initial={announcementToForm(row)} submitLabel="حفظ" busy={busy} onCancel={() => setEditing(null)} onSubmit={(form) => run(() => updateAnnouncement(row, form), 'حُفظ الإعلان.')} />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-lg leading-7 font-bold break-words">{row.title}</p>
                              <p className="mt-1 text-base leading-7 break-words text-(color:--color-page-muted)">{row.body}</p>
                              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm leading-6 text-(color:--color-page-muted)">
                                <span className={`rounded-full px-3 py-1 font-bold ${state === 'live' ? 'bg-(--color-page-guide-selected) text-(color:--color-page-primary)' : 'border border-(--color-page-border)'}`}>{stateLabel[state]}</span>
                                من {dateTime.format(new Date(row.starts_at))}
                                {row.expires_at && <> إلى {dateTime.format(new Date(row.expires_at))}</>}
                                {row.link && <bdi dir="ltr">· {row.link}</bdi>}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button type="button" onClick={() => { setAdding(false); setEditing(row.id) }} className={outlineButton}>تعديل<span className="sr-only">: {row.title}</span></button>
                              {!row.published &&
                                (confirming === row.id ? (
                                  <span className="flex items-center gap-2">
                                    <button type="button" disabled={busy} onClick={() => run(() => deleteAnnouncement(row.id), 'حُذف الإعلان.')} className={primaryButton}>تأكيد الحذف</button>
                                    <button type="button" onClick={() => setConfirming(null)} className={outlineButton}>تراجع</button>
                                  </span>
                                ) : (
                                  <button type="button" onClick={() => setConfirming(row.id)} className={outlineButton}>حذف<span className="sr-only">: {row.title}</span></button>
                                ))}
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {adding ? (
                  <div className="mt-4 rounded-[14px] border border-(--color-page-border) p-4">
                    <h3 id="add-heading" className="mb-3 text-lg leading-7 font-bold">إعلان جديد</h3>
                    <AnnouncementForm prefix="add" initial={emptyAnnouncement()} submitLabel="إضافة" busy={busy} onCancel={() => setAdding(false)} onSubmit={(form) => run(() => createAnnouncement(form), 'أُضيف الإعلان.')} />
                  </div>
                ) : (
                  <button type="button" onClick={() => { setEditing(null); setAdding(true) }} className={`${primaryButton} mt-4`}>إعلان جديد</button>
                )}
                <p className="mt-3 text-sm leading-6 text-(color:--color-page-muted)">الإعلان المنشور لا يُحذف مباشرة: اجعله مخفيًا أولًا ثم احفظ.</p>
              </section>

              <section aria-labelledby="tpl-title" className={`${card} min-w-0 p-6`}>
                <h2 id="tpl-title" className="text-2xl leading-[1.4]">نصوص التذكيرات</h2>
                <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">
                  رسائل يرسلها الموقع تلقائيًا لكل شخص حسب إعداداته. التعديل يسري على الرسائل القادمة فقط. الملخص الأسبوعي يعدّ أيام تسجيل الشعور <strong>لصاحبه وحده</strong>، ولا يراها أحد. اكتب بلغة لطيفة قصيرة، بلا ضغط أو تشخيص. الإيميل لم يُفعَّل بعد، فكلها داخل الموقع.
                </p>
                <div className="mt-2 divide-y divide-(--color-page-border)">
                  {templates.map((template) => (
                    <TemplateEditor key={`${template.kind}-${template.updated_at}`} template={template} busy={busy} onSave={(kind, form) => run(() => saveTemplate(kind, form), 'حُفظ النص.')} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}

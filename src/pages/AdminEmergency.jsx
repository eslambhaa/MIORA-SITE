import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fallbackLines } from '../lib/emergency.js'
import { createEmergency, deleteEmergency, emergencyErrorMessage, emptyForm, listEmergency, rowToForm, updateEmergency, validateForm } from '../lib/adminEmergency.js'

const input = 'min-h-11 w-full rounded-[14px] border border-(--color-page-input-border) bg-(--color-page-surface) px-4 text-base outline-(--color-page-primary)'
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

// One form for adding and editing a number. `prefix` keeps the field ids unique on the page.
function LineForm({ prefix, initial, submitLabel, busy, onSubmit, onCancel }) {
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
    const found = validateForm(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`${prefix}-${Object.keys(found)[0]}`)?.focus()
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${prefix}-title`} label="الاسم" error={errors.title}><input type="text" maxLength={100} {...props('title')} className={input} /></Field>
        <Field id={`${prefix}-number`} label="الرقم" hint="أرقام فقط، ويجوز + في أوله." error={errors.number}><input type="tel" dir="ltr" inputMode="tel" maxLength={20} {...props('number')} className={input} /></Field>
      </div>
      <Field id={`${prefix}-note`} label="وصف قصير (اختياري)" error={errors.note}><input type="text" maxLength={200} {...props('note')} className={input} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${prefix}-country`} label="الدولة" error={errors.country}><input type="text" maxLength={40} {...props('country')} className={input} /></Field>
        <Field id={`${prefix}-sortOrder`} label="الترتيب" hint="الأصغر أولًا." error={errors.sortOrder}><input type="number" inputMode="numeric" {...props('sortOrder')} className={input} /></Field>
        <Field id={`${prefix}-published`} label="الظهور">
          <select {...props('published')} className={input}>
            <option value="true">ظاهر</option>
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

export default function AdminEmergency() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const load = useCallback(async () => {
    try {
      setRows(await listEmergency())
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
      setMessage({ ok: false, text: emergencyErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  const visible = rows.filter((row) => row.published)

  return (
    <>
      <title>أرقام الطوارئ | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">أرقام الطوارئ</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">الأرقام التي تظهر في بطاقة «إذا كنت في خطر الآن» بصفحة المساعدة.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>

          <aside role="note" className={`${card} grid gap-2 p-5 text-base leading-7`}>
            <p><strong>رقم خاطئ هنا قد يضر شخصًا في أزمة.</strong> تأكد من كل رقم من مصدره الرسمي قبل الحفظ.</p>
            <p className="text-(color:--color-page-muted)">
              تتغير هذه الأرقام في صفحة المساعدة فقط. المساعد الذكي وصفحته يذكران الأرقام {fallbackLines.map((line) => line.number).join(' و')} من الكود ولا يتغيران من هنا. وإن أخفيت كل الأرقام أو تعذّرت القراءة تظهر هذه النسخة المحفوظة، فلا تبقى البطاقة فارغة.
            </p>
          </aside>

          <div aria-live="polite">
            {message && <p role="status" className={`text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
          </div>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-muted)">
              تعذّر تحميل الأرقام.{' '}
              <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && (
            <>
              {visible.length === 0 && <p role="status" className="rounded-[14px] bg-(--color-page-card) p-4 text-base leading-7">لا يوجد رقم ظاهر الآن، فالصفحة تعرض النسخة المحفوظة.</p>}
              <ul className="grid gap-3">
                {rows.map((row) => (
                  <li key={row.id} className={`${card} p-5`}>
                    {editing === row.id ? (
                      <LineForm prefix={`edit-${row.id}`} initial={rowToForm(row)} submitLabel="حفظ" busy={busy} onCancel={() => setEditing(null)} onSubmit={(form) => run(() => updateEmergency(row, form), 'حُفظ الرقم.')} />
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-lg leading-7 font-bold">
                            <bdi dir="ltr" className="me-2 text-(color:--color-page-primary)">{row.number}</bdi>
                            {row.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">{row.country} · ترتيب {row.sort_order} · {row.published ? 'ظاهر' : 'مخفي'}</p>
                          {row.note && <p className="mt-1 text-base leading-7 text-(color:--color-page-muted)">{row.note}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => { setAdding(false); setEditing(row.id) }} className={outlineButton}>تعديل<span className="sr-only">: {row.title}</span></button>
                          {!row.published &&
                            (confirming === row.id ? (
                              <span className="flex items-center gap-2">
                                <button type="button" disabled={busy} onClick={() => run(() => deleteEmergency(row.id), 'حُذف الرقم.')} className={primaryButton}>تأكيد الحذف</button>
                                <button type="button" onClick={() => setConfirming(null)} className={outlineButton}>تراجع</button>
                              </span>
                            ) : (
                              <button type="button" onClick={() => setConfirming(row.id)} className={outlineButton}>حذف<span className="sr-only">: {row.title}</span></button>
                            ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {adding ? (
                <section aria-labelledby="add-heading" className={`${card} p-6`}>
                  <h2 id="add-heading" className="mb-4 text-2xl leading-[1.4]">رقم جديد</h2>
                  <LineForm prefix="add" initial={emptyForm((rows.at(-1)?.sort_order ?? 0) + 10)} submitLabel="إضافة" busy={busy} onCancel={() => setAdding(false)} onSubmit={(form) => run(() => createEmergency(form), 'أُضيف الرقم.')} />
                </section>
              ) : (
                <button type="button" onClick={() => { setEditing(null); setAdding(true) }} className={`${primaryButton} justify-self-start`}>إضافة رقم</button>
              )}
              {rows.some((row) => row.published) && <p className="text-sm leading-6 text-(color:--color-page-muted)">الرقم الظاهر لا يُحذف مباشرة: اجعله مخفيًا أولًا ثم احفظ.</p>}
            </>
          )}
        </div>
      </main>
    </>
  )
}

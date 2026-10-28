import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import {
  candidateToForm,
  categories,
  checkLabel,
  createMedia,
  deleteHidden,
  emptyForm,
  getCheck,
  getMediaRow,
  kindLabel,
  lookupEpisode,
  lookupErrorMessage,
  mediaErrorMessage,
  nextSortOrder,
  rowToForm,
  runCheck,
  updateMedia,
  validateForm,
} from '../lib/adminMedia.js'
import NotFound from './NotFound.jsx'

const input = 'min-h-11 w-full rounded-[14px] border border-(--color-page-input-border) bg-(--color-page-surface) px-4 text-base outline-(--color-page-primary)'
const area = `${input} py-3 leading-7`
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const primaryButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'
const outlineButton =
  'min-h-11 cursor-pointer rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'

const date = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeZone: 'UTC' })

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

export default function AdminMediaEdit({ isNew = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(null)
  const [row, setRow] = useState(null)
  const [check, setCheck] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(() => {
    const saved = location.state?.saved
    if (!saved) return null
    return { ok: true, text: saved === 'created' ? 'أُضيفت الحلقة كمخفية. راجعها ثم اجعلها ظاهرة.' : 'أُضيفت الحلقة كمخفية، لكن تعذّر تسجيلها في سجل التعديلات.' }
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [link, setLink] = useState('')
  const [looking, setLooking] = useState(false)
  const [lookup, setLookup] = useState(null)
  const [lookupMessage, setLookupMessage] = useState(null)
  const [suggestedAudio, setSuggestedAudio] = useState(null)
  const dirty = useRef(false)

  const load = useCallback(async () => {
    setLoadState('loading')
    try {
      if (isNew) {
        setForm(emptyForm('podcast', await nextSortOrder()))
      } else {
        const data = /^\d+$/.test(id) ? await getMediaRow(Number(id)) : null
        if (!data) return setLoadState('missing')
        setRow(data)
        setForm(rowToForm(data))
        setCheck(await getCheck(data.id))
      }
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }, [id, isNew])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const warn = (event) => {
      if (dirty.current) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const set = (name) => (event) => {
    dirty.current = true
    setForm((current) => ({ ...current, [name]: event.target.value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage(null)
  }
  const fieldProps = (name) => ({
    id: `f-${name}`,
    value: form[name],
    onChange: set(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `f-${name}-error` : undefined,
  })

  async function onLookup(event) {
    event.preventDefault()
    setLookupMessage(null)
    setLookup(null)
    setSuggestedAudio(null)
    if (!link.trim()) return setLookupMessage({ ok: false, text: 'الصق رابطًا أولًا.' })
    setLooking(true)
    try {
      const result = await lookupEpisode(link.trim())
      if (result.candidates.length === 1) applyCandidate(result, result.candidates[0])
      else setLookup(result)
    } catch (error) {
      setLookupMessage({ ok: false, text: lookupErrorMessage(error) })
    } finally {
      setLooking(false)
    }
  }

  function applyCandidate(result, candidate) {
    dirty.current = true
    setForm((current) => candidateToForm(current, result, candidate))
    setErrors({})
    setLookup(null)
    setSuggestedAudio(candidate.embedUrl && candidate.audioUrl ? candidate.audioUrl : null)
    setLookupMessage({ ok: true, text: 'عُبّئت الحقول. راجعها وعدّلها قبل الحفظ، فالنصوص من الناشر وقد فيها دعايات.' })
  }

  async function onSubmit(event) {
    event.preventDefault()
    setMessage(null)
    const found = validateForm(form, { isNew })
    setErrors(found)
    if (Object.keys(found).length) {
      setMessage({ ok: false, text: 'راجع الحقول المعلَّمة قبل الحفظ.' })
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      if (isNew) {
        const { row: created, audited } = await createMedia({ ...form, published: 'false' })
        dirty.current = false
        navigate(`/admin/media/${created.id}`, { replace: true, state: { saved: audited ? 'created' : 'created-unaudited' } })
      } else {
        const { row: saved, audited, unchanged } = await updateMedia(row, form)
        setRow(saved)
        setForm(rowToForm(saved))
        dirty.current = false
        setMessage({ ok: true, text: unchanged ? 'لا توجد تغييرات للحفظ.' : audited ? 'حُفظت الحلقة.' : 'حُفظت الحلقة، لكن تعذّر تسجيلها في سجل التعديلات.' })
      }
    } catch (error) {
      setMessage({ ok: false, text: mediaErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  async function onCheck() {
    setBusy(true)
    setMessage(null)
    try {
      const [result] = await runCheck([row.id])
      setCheck(result ? { status: result.status, detail: result.detail, checked_at: new Date().toISOString() } : null)
    } catch (error) {
      setMessage({ ok: false, text: mediaErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    setBusy(true)
    setMessage(null)
    try {
      await deleteHidden(row.id)
      dirty.current = false
      navigate('/admin/media', { replace: true })
    } catch (error) {
      setMessage({ ok: false, text: mediaErrorMessage(error) })
      setBusy(false)
    }
  }

  if (loadState === 'missing') return <NotFound />
  if (loadState === 'loading' || !form) {
    return (
      <main className="grid flex-1 place-items-center px-6 py-24">
        <p role="status" className="text-lg text-(color:--color-page-muted)">{loadState === 'error' ? 'تعذّر تحميل الحلقة.' : 'جارٍ التحميل…'}</p>
        {loadState === 'error' && <button type="button" onClick={load} className={outlineButton}>أعد المحاولة</button>}
      </main>
    )
  }

  const isVideo = form.kind === 'video'

  return (
    <>
      <title>{`${isNew ? 'حلقة جديدة' : 'تعديل حلقة'} | لوحة التحكم | ميورا`}</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[48px]">{isNew ? 'حلقة جديدة' : 'تعديل الحلقة'}</h1>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin/media" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى الحلقات</Link>

          {isNew && (
            <section aria-labelledby="lookup-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="lookup-title" className="text-2xl leading-[1.4]">تعبئة تلقائية من رابط</h2>
              <p className="text-base leading-7 text-(color:--color-page-muted)">الصق رابط فيديو YouTube، أو رابط برنامج أو حلقة من Apple Podcasts، أو عنوان خلاصة RSS للبودكاست. تُقرأ البيانات من الموقع نفسه ثم تراجعها أنت.</p>
              <form onSubmit={onLookup} noValidate className="flex flex-wrap items-end gap-3">
                <div className="min-w-[240px] flex-1">
                  <label htmlFor="lookup-link" className="mb-1 block text-sm leading-6 font-bold">الرابط</label>
                  <input id="lookup-link" type="url" dir="ltr" maxLength={600} autoComplete="off" value={link} onChange={(event) => setLink(event.target.value)} className={input} />
                </div>
                <button type="submit" disabled={looking} aria-busy={looking} className={primaryButton}>{looking ? 'جارٍ الجلب…' : 'اجلب البيانات'}</button>
              </form>
              <div aria-live="polite">
                {lookupMessage && <p role="status" className={`text-base leading-7 ${lookupMessage.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{lookupMessage.text}</p>}
              </div>
              {lookup && (
                <fieldset>
                  <legend className="mb-2 text-base leading-7 font-bold">اختر الحلقة من «{lookup.source}»</legend>
                  <ul className="grid gap-2">
                    {lookup.candidates.map((candidate) => (
                      <li key={candidate.url} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-(--color-page-border) p-3">
                        <span className="min-w-0 flex-1 text-base leading-7">
                          {candidate.title}
                          {candidate.date && <span className="block text-sm text-(color:--color-page-muted)">{date.format(new Date(candidate.date))}</span>}
                        </span>
                        <button type="button" onClick={() => applyCandidate(lookup, candidate)} className={outlineButton}>استخدم هذه<span className="sr-only">: {candidate.title}</span></button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}
            </section>
          )}

          <form onSubmit={onSubmit} noValidate className="grid gap-6">
            <section aria-labelledby="basics-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="basics-title" className="text-2xl leading-[1.4]">البيانات</h2>
              {isNew ? (
                <Field id="f-kind" label="النوع" error={errors.kind}>
                  <select {...fieldProps('kind')} className={input}>
                    <option value="podcast">{kindLabel.podcast}</option>
                    <option value="video">{kindLabel.video}</option>
                  </select>
                </Field>
              ) : (
                <p className="text-base leading-7">النوع: <strong>{kindLabel[form.kind]}</strong> <span className="text-(color:--color-page-muted)">(لا يتغير بعد الإضافة حتى يبقى رابط الصفحة صالحًا)</span></p>
              )}
              <Field id="f-title" label="العنوان" error={errors.title}><input type="text" maxLength={120} {...fieldProps('title')} className={input} /></Field>
              <Field id="f-source" label="المصدر" hint="اسم البرنامج أو القناة." error={errors.source}><input type="text" maxLength={120} {...fieldProps('source')} className={input} /></Field>
              <Field id="f-description" label="وصف قصير" hint="يظهر في البطاقة وتحت العنوان (حتى 300 حرف)." error={errors.description}><textarea rows={3} maxLength={300} {...fieldProps('description')} className={area} /></Field>
              <Field id="f-details" label="عن هذه الحلقة (اختياري)" hint="نص أطول لصفحة الحلقة. افصل الفقرات بسطر فارغ، حتى 2000 حرف." error={errors.details}><textarea rows={7} maxLength={2000} {...fieldProps('details')} className={area} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="f-topic" label="الموضوع" error={errors.topic}>
                  <select {...fieldProps('topic')} className={input}>
                    <option value="">بلا موضوع</option>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field id="f-sortOrder" label="الترتيب" hint="الأصغر أولًا." error={errors.sortOrder}><input type="number" inputMode="numeric" {...fieldProps('sortOrder')} className={input} /></Field>
              </div>
            </section>

            <section aria-labelledby="links-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="links-title" className="text-2xl leading-[1.4]">الروابط</h2>
              <Field id="f-url" label="رابط الحلقة" hint={isVideo ? 'صفحة الفيديو على يوتيوب.' : 'صفحة الحلقة عند الناشر أو في Apple Podcasts.'} error={errors.url}><input type="url" dir="ltr" maxLength={600} {...fieldProps('url')} className={input} /></Field>
              <Field id="f-embedUrl" label="رابط المشغّل" hint={isVideo ? 'https://www.youtube-nocookie.com/embed/معرّف_الفيديو' : 'https://embed.podcasts.apple.com/… (اتركه فارغًا إن كان عندك رابط ملف صوت)'} error={errors.embedUrl}><input type="url" dir="ltr" maxLength={600} {...fieldProps('embedUrl')} className={input} /></Field>
              {!isVideo && (
                <Field id="f-audioUrl" label="رابط ملف الصوت (اختياري)" hint="يلزم للحلقات القديمة أو خلاصات RSS. تشغيل ملف الناشر على موقعك يحتاج إذنه." error={errors.audioUrl}>
                  <input type="url" dir="ltr" maxLength={800} {...fieldProps('audioUrl')} className={input} />
                  {suggestedAudio && !form.audioUrl && (
                    <button type="button" onClick={() => { dirty.current = true; setForm((current) => ({ ...current, audioUrl: suggestedAudio })) }} className={`${outlineButton} mt-2`}>
                      استخدم رابط الصوت المقترح من الناشر
                    </button>
                  )}
                </Field>
              )}
            </section>

            <section aria-labelledby="publish-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="publish-title" className="text-2xl leading-[1.4]">النشر والفحص</h2>
              {isNew ? (
                <p className="text-base leading-7 text-(color:--color-page-muted)">تُضاف الحلقة مخفية. بعد الحفظ تفحص روابطها ثم تجعلها ظاهرة.</p>
              ) : (
                <Field id="f-published" label="الظهور للزوار">
                  <select {...fieldProps('published')} className={input}>
                    <option value="false">مخفية</option>
                    <option value="true">ظاهرة</option>
                  </select>
                </Field>
              )}
              {!isNew && (
                <div>
                  <p className="text-base leading-7">
                    آخر فحص:{' '}
                    {check ? (
                      <strong>{check.status === 'ok' ? 'يعمل' : check.status === 'failed' ? 'به مشكلة' : 'غير مؤكد'}</strong>
                    ) : (
                      <strong>لم يُفحص</strong>
                    )}
                  </p>
                  {check && check.status !== 'ok' && check.detail && <p className="mt-1 text-base leading-7">{checkLabel(check.detail)}</p>}
                  <button type="button" onClick={onCheck} disabled={busy || dirty.current} className={`${outlineButton} mt-3`}>افحص روابط هذه الحلقة</button>
                  {dirty.current && <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">احفظ التعديلات أولًا ثم افحص.</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'جارٍ التنفيذ…' : isNew ? 'إضافة' : 'حفظ'}</button>
                {!isNew && row && !row.published && form.published === 'false' && (
                  confirmDelete ? (
                    <span className="flex items-center gap-2">
                      <button type="button" disabled={busy} onClick={onDelete} className={primaryButton}>تأكيد الحذف</button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className={outlineButton}>تراجع</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className={outlineButton}>حذف الحلقة</button>
                  )
                )}
              </div>
              {!isNew && row?.published && <p className="text-sm leading-6 text-(color:--color-page-muted)">الحلقة الظاهرة لا تُحذف مباشرة: اجعلها مخفية أولًا ثم احفظ.</p>}
              <div aria-live="polite">
                {message && <p role="status" className={`text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
              </div>
            </section>
          </form>
        </div>
      </main>
    </>
  )
}

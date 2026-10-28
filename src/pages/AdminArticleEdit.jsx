import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import ArticleBody from '../components/content/ArticleBody.jsx'
import NotFound from './NotFound.jsx'
import {
  articleErrorMessage,
  categories,
  createArticle,
  deleteDraft,
  emptyForm,
  formToArticle,
  getArticleRow,
  imageChoices,
  nextSortOrder,
  rowToForm,
  updateArticle,
  validateForm,
} from '../lib/adminArticles.js'

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

export default function AdminArticleEdit({ isNew = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(null)
  const [row, setRow] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(() => {
    const saved = location.state?.saved
    if (!saved) return null
    return { ok: true, text: saved === 'created' ? 'أُنشئ المقال كمسودة.' : 'أُنشئ المقال كمسودة، لكن تعذّر تسجيله في سجل التعديلات.' }
  })
  const [preview, setPreview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dirty = useRef(false)

  const load = useCallback(async () => {
    setLoadState('loading')
    try {
      if (isNew) {
        setForm(emptyForm(await nextSortOrder()))
      } else {
        const data = Number.isInteger(Number(id)) ? await getArticleRow(Number(id)) : null
        if (!data) return setLoadState('missing')
        setRow(data)
        setForm(rowToForm(data))
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

  function pickImage(image) {
    dirty.current = true
    setForm((current) => {
      const currentAlt = imageChoices.find((item) => item.src === current.imageSrc)?.alt
      // Keep a description the admin wrote; replace only the one that came with the previous drawing.
      const keep = current.imageAlt && current.imageAlt !== currentAlt
      return { ...current, imageSrc: image.src, imageAlt: keep ? current.imageAlt : image.alt }
    })
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
        const { row: created, audited } = await createArticle(form)
        dirty.current = false
        navigate(`/admin/articles/${created.id}`, { replace: true, state: { saved: audited ? 'created' : 'created-unaudited' } })
      } else {
        const { row: saved, audited, unchanged } = await updateArticle(row, form)
        setRow(saved)
        setForm(rowToForm(saved))
        dirty.current = false
        setMessage({ ok: true, text: unchanged ? 'لا توجد تغييرات للحفظ.' : audited ? 'حُفظ المقال.' : 'حُفظ المقال، لكن تعذّر تسجيله في سجل التعديلات.' })
      }
    } catch (error) {
      setMessage({ ok: false, text: articleErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    setBusy(true)
    setMessage(null)
    try {
      await deleteDraft(row.id)
      dirty.current = false
      navigate('/admin/articles', { replace: true })
    } catch (error) {
      setMessage({ ok: false, text: articleErrorMessage(error) })
      setBusy(false)
    }
  }

  if (loadState === 'missing') return <NotFound />
  if (loadState === 'loading' || !form) {
    return (
      <main className="grid flex-1 place-items-center px-6 py-24">
        <p role="status" className="text-lg text-(color:--color-page-muted)">{loadState === 'error' ? 'تعذّر تحميل المقال.' : 'جارٍ التحميل…'}</p>
        {loadState === 'error' && <button type="button" onClick={load} className={outlineButton}>أعد المحاولة</button>}
      </main>
    )
  }

  const published = form.status === 'published'
  const unreviewedPublish = published && !form.reviewedBy.trim()

  return (
    <>
      <title>{`${isNew ? 'مقال جديد' : 'تعديل مقال'} | لوحة التحكم | ميورا`}</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[48px]">{isNew ? 'مقال جديد' : 'تعديل المقال'}</h1>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin/articles" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى المقالات</Link>

          <form onSubmit={onSubmit} noValidate className="grid gap-6">
            <section aria-labelledby="basics-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="basics-title" className="text-2xl leading-[1.4]">البيانات الأساسية</h2>
              <Field id="f-title" label="العنوان" error={errors.title}><input type="text" maxLength={150} {...fieldProps('title')} className={input} /></Field>
              <Field id="f-slug" label="العنوان في الرابط" hint={isNew ? 'حروف إنجليزية صغيرة وأرقام وشرطات، مثل: managing-anger. لا يتغير بعد الحفظ.' : 'لا يتغير بعد الحفظ حتى تبقى الروابط المشاركة تعمل.'} error={errors.slug}>
                <input type="text" dir="ltr" maxLength={80} readOnly={!isNew} {...fieldProps('slug')} aria-describedby={`f-slug-hint${errors.slug ? ' f-slug-error' : ''}`} className={`${input} ${isNew ? '' : 'bg-(--color-page-card)'}`} />
              </Field>
              <Field id="f-excerpt" label="الملخص" hint="يظهر في بطاقة المقال وفي وصف الصفحة." error={errors.excerpt}><textarea rows={2} maxLength={300} {...fieldProps('excerpt')} className={area} /></Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="f-category" label="التصنيف" error={errors.category}>
                  <select {...fieldProps('category')} className={input}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
                </Field>
                <Field id="f-minutes" label="مدة القراءة (دقائق)" error={errors.minutes}><input type="number" min={1} max={60} inputMode="numeric" {...fieldProps('minutes')} className={input} /></Field>
                <Field id="f-sortOrder" label="الترتيب" hint="الأصغر أولًا. أول 3 تظهر في الرئيسية." error={errors.sortOrder}><input type="number" inputMode="numeric" {...fieldProps('sortOrder')} className={input} /></Field>
              </div>
            </section>

            <section aria-labelledby="image-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="image-title" className="text-2xl leading-[1.4]">الصورة</h2>
              <fieldset>
                <legend className="mb-2 text-sm leading-6 font-bold">اختر رسمة</legend>
                <p className="mb-3 text-sm leading-6 text-(color:--color-page-muted)">الرسومات المرفقة بالموقع فقط، لأن سياسة الأمان تمنع الصور من مواقع أخرى.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {imageChoices.map((image) => (
                    <label key={image.key} className="cursor-pointer">
                      <input type="radio" name="image" className="peer sr-only" checked={form.imageSrc === image.src} onChange={() => pickImage(image)} />
                      <img src={image.src} alt="" width="1200" height="800" loading="lazy" className="aspect-[3/2] w-full rounded-[14px] border-2 border-(--color-page-border) object-cover peer-checked:border-(--color-page-button) peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--color-page-primary)" />
                      <span className="mt-1 block text-center text-xs leading-5 text-(color:--color-page-muted)" dir="ltr">{image.key}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field id="f-imageAlt" label="وصف الصورة" hint="لقارئات الشاشة. صف ما في الرسمة." error={errors.imageAlt}><input type="text" maxLength={300} {...fieldProps('imageAlt')} className={input} /></Field>
            </section>

            <section aria-labelledby="idea-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="idea-title" className="text-2xl leading-[1.4]">القسم الأول: فهم الفكرة</h2>
              <Field id="f-ideaHeading" label="العنوان" error={errors.ideaHeading}><input type="text" maxLength={150} {...fieldProps('ideaHeading')} className={input} /></Field>
              <Field id="f-ideaParagraphs" label="الفقرات" hint="افصل بين الفقرات بسطر فارغ." error={errors.ideaParagraphs}><textarea rows={8} {...fieldProps('ideaParagraphs')} className={area} /></Field>
              <Field id="f-ideaQuote" label="الاقتباس (اختياري)"><textarea rows={2} maxLength={400} {...fieldProps('ideaQuote')} className={area} /></Field>
            </section>

            <section aria-labelledby="practice-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="practice-title" className="text-2xl leading-[1.4]">القسم الثاني: خطوة عملية</h2>
              <Field id="f-practiceHeading" label="العنوان" error={errors.practiceHeading}><input type="text" maxLength={150} {...fieldProps('practiceHeading')} className={input} /></Field>
              <Field id="f-practiceParagraphs" label="الفقرات" hint="افصل بين الفقرات بسطر فارغ." error={errors.practiceParagraphs}><textarea rows={6} {...fieldProps('practiceParagraphs')} className={area} /></Field>
              <Field id="f-practiceExercise" label="التمرين العملي (اختياري)"><textarea rows={3} maxLength={500} {...fieldProps('practiceExercise')} className={area} /></Field>
            </section>

            <section aria-labelledby="end-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="end-title" className="text-2xl leading-[1.4]">الخاتمة والمصادر</h2>
              <Field id="f-remember" label="نقاط تستحق أن تتذكرها" hint="كل نقطة في سطر، من 1 إلى 8. أضف تنبيه طلب المساعدة المتخصصة عند الحاجة." error={errors.remember}><textarea rows={5} {...fieldProps('remember')} className={area} /></Field>
              <Field id="f-sources" label="مصادر للاستزادة (اختياري)" hint="كل مصدر في سطر: العنوان | الجهة | https://…" error={errors.sources}><textarea rows={3} dir="ltr" {...fieldProps('sources')} className={area} /></Field>
            </section>

            <section aria-labelledby="review-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="review-title" className="text-2xl leading-[1.4]">مراجعة المتخصص</h2>
              <p className="text-base leading-7 text-(color:--color-page-muted)">اسم المتخصص الذي راجع النص وتاريخ المراجعة. يظهر في آخر المقال للزوار.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="f-reviewedBy" label="اسم المراجع" error={errors.reviewedBy}><input type="text" maxLength={100} {...fieldProps('reviewedBy')} className={input} /></Field>
                <Field id="f-reviewedOn" label="تاريخ المراجعة" error={errors.reviewedOn}><input type="date" dir="ltr" {...fieldProps('reviewedOn')} className={input} /></Field>
              </div>
            </section>

            <section aria-labelledby="publish-title" className={`${card} grid gap-4 p-6`}>
              <h2 id="publish-title" className="text-2xl leading-[1.4]">النشر</h2>
              <Field id="f-status" label="الحالة">
                <select {...fieldProps('status')} className={input}>
                  <option value="draft">مسودة (مخفي عن الزوار)</option>
                  <option value="published">منشور</option>
                </select>
              </Field>
              {unreviewedPublish && (
                <p role="note" className="rounded-[14px] bg-(--color-page-card) p-4 text-base leading-7">
                  هذا المقال سيظهر للزوار دون مراجعة متخصص. المحتوى تعليمي عام، والأفضل مراجعته قبل النشر، خصوصًا مقالات الوعي بالإدمان.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
                <button type="button" aria-pressed={preview} onClick={() => setPreview((value) => !value)} className={outlineButton}>{preview ? 'إخفاء المعاينة' : 'معاينة'}</button>
                {!isNew && row?.status === 'draft' && form.status === 'draft' && (
                  confirmDelete ? (
                    <span className="flex items-center gap-2">
                      <button type="button" disabled={busy} onClick={onDelete} className={primaryButton}>تأكيد حذف المسودة</button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className={outlineButton}>تراجع</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className={outlineButton}>حذف المسودة</button>
                  )
                )}
              </div>
              {!isNew && row?.status === 'published' && <p className="text-sm leading-6 text-(color:--color-page-muted)">المقال المنشور لا يُحذف مباشرة: حوّله إلى مسودة أولًا ثم احفظ.</p>}
              <div aria-live="polite">
                {message && <p role="status" className={`text-base leading-7 ${message.ok ? 'text-(color:--color-page-heading)' : 'text-(color:--color-page-error-text)'}`}>{message.text}</p>}
              </div>
            </section>
          </form>

          {preview && (
            <section aria-label="معاينة المقال" className={`${card} p-4 pb-10 md:p-8`}>
              <p className="mb-2 text-sm font-bold text-(color:--color-page-primary)">معاينة: هكذا سيظهر المقال للزوار</p>
              <ArticleBody article={formToArticle(form)} preview />
            </section>
          )}
        </div>
      </main>
    </>
  )
}

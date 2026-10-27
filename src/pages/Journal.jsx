import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FormAlert, inputClass } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

const PAGE_SIZE = 20
const TITLE_MAX = 120
const BODY_MAX = 10000

const arabicNumber = new Intl.NumberFormat('ar-EG')
const dateFormat = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long', timeZone: 'Africa/Cairo' })
const formatDate = (value) => dateFormat.format(new Date(value))

const primaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-white shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const secondaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const dangerButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-error-text) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-error-text) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'

const unavailable = 'تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.'

function NewButton({ onClick, children = 'ملاحظة جديدة' }) {
  return (
    <button type="button" onClick={onClick} className={primaryButton}>
      {children}
      <img src="/icons/journal/pen.svg" alt="" width="18" height="18" />
    </button>
  )
}

function EntryList({ onOpen, onNew, flash }) {
  const [entries, setEntries] = useState([])
  const [state, setState] = useState('loading')
  const [hasMore, setHasMore] = useState(false)

  async function load(from) {
    if (!supabase) {
      setState('error')
      return
    }
    setState(from === 0 ? 'loading' : 'more')
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE)
    if (error) {
      setState('error')
      return
    }
    setHasMore(data.length > PAGE_SIZE)
    const page = data.slice(0, PAGE_SIZE)
    setEntries((current) => (from === 0 ? page : [...current, ...page]))
    setState('ready')
  }

  useEffect(() => {
    load(0)
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[30px] leading-[39px] tracking-[-0.02em]">ملاحظاتك</h2>
          <p className="text-base leading-7 text-(color:--color-page-muted)">تظهر العناوين والتواريخ هنا فقط.</p>
        </div>
        <NewButton onClick={onNew} />
      </div>
      {flash && (
        <div className="pt-6">
          <FormAlert tone="success">{flash}</FormAlert>
        </div>
      )}
      <div className="pt-10">
        {state === 'loading' && (
          <p role="status" className="py-10 text-center text-base text-(color:--color-page-muted)">
            جارٍ تحميل ملاحظاتك…
          </p>
        )}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <FormAlert>{unavailable}</FormAlert>
            <button type="button" onClick={() => load(0)} className={secondaryButton}>
              أعد المحاولة
            </button>
          </div>
        )}
        {state !== 'loading' && state !== 'error' && entries.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-[22px] border border-dashed border-(--color-page-border) px-[25px] py-[55px] text-center">
            <span className="grid size-[60px] place-items-center rounded-[18px] bg-(--color-page-guide-selected)">
              <img src="/icons/journal/notebook.svg" alt="" width="28" height="28" />
            </span>
            <h3 className="pt-4 text-base leading-[20.8px] tracking-[-0.02em]">مساحتك جاهزة لأول ملاحظة</h3>
            <p className="pt-1.5 text-base leading-7 text-(color:--color-page-muted)">اكتب ما يشغلك، أو شيئًا تريد تذكّره، أو حتى كلمة واحدة تصف يومك.</p>
            <button type="button" onClick={onNew} className={primaryButton}>
              ابدأ الآن
            </button>
          </div>
        )}
        {entries.length > 0 && state !== 'loading' && (
          <>
            <ul className="grid gap-3">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(entry.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-[18px] text-start outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) motion-reduce:transition-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-lg leading-[31.5px]">{entry.title}</span>
                      <span className="block text-sm leading-6 text-(color:--color-page-muted)">{formatDate(entry.created_at)}</span>
                    </span>
                    <img src="/icons/assessment/prev.svg" alt="" width="18" height="18" className="shrink-0 -scale-x-100" />
                  </button>
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button type="button" disabled={state === 'more'} onClick={() => load(entries.length)} className={secondaryButton}>
                  {state === 'more' ? 'جارٍ التحميل…' : 'عرض المزيد'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function Editor({ entryId, onDone }) {
  const isNew = entryId === 'new'
  const [original, setOriginal] = useState({ title: '', body: '' })
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [meta, setMeta] = useState(null)
  const [state, setState] = useState(isNew ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const headingRef = useRef(null)

  const dirty = title !== original.title || body !== original.body
  const busy = state === 'saving' || state === 'deleting'

  useEffect(() => {
    if (isNew) return
    let active = true
    async function fetchEntry() {
      if (!supabase) {
        setState('error')
        return
      }
      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('id, title, body, created_at, updated_at')
        .eq('id', entryId)
        .maybeSingle()
      if (!active) return
      if (fetchError) setState('error')
      else if (!data) setState('missing')
      else {
        setOriginal({ title: data.title, body: data.body })
        setTitle(data.title)
        setBody(data.body)
        setMeta(data)
        setState('ready')
      }
    }
    fetchEntry()
    return () => {
      active = false
    }
  }, [entryId, isNew])

  useEffect(() => {
    if (state === 'ready') headingRef.current?.focus({ preventScroll: true })
  }, [state === 'ready'])

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function save(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      setError('اكتب عنوانًا قصيرًا للملاحظة.')
      return
    }
    if (!supabase) {
      setError(unavailable)
      return
    }
    setError('')
    setConfirm(null)
    setState('saving')
    const values = { title: cleanTitle, body }
    const { error: saveError } = isNew
      ? await supabase.from('journal_entries').insert(values)
      : await supabase.from('journal_entries').update(values).eq('id', entryId)
    if (saveError) {
      setState('ready')
      setError('تعذّر حفظ الملاحظة. تحقق من الاتصال ثم حاول مرة أخرى.')
      return
    }
    onDone('حُفظت الملاحظة.')
  }

  async function remove() {
    setError('')
    setState('deleting')
    const { error: deleteError } = await supabase.from('journal_entries').delete().eq('id', entryId)
    if (deleteError) {
      setState('ready')
      setConfirm(null)
      setError('تعذّر حذف الملاحظة. حاول مرة أخرى.')
      return
    }
    onDone('حُذفت الملاحظة.')
  }

  function cancel() {
    if (dirty && confirm !== 'discard') {
      setConfirm('discard')
      return
    }
    onDone('')
  }

  if (state === 'loading') {
    return (
      <p role="status" className="py-10 text-center text-base text-(color:--color-page-muted)">
        جارٍ فتح الملاحظة…
      </p>
    )
  }

  if (state === 'missing' || state === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <FormAlert>{state === 'missing' ? 'لم نجد هذه الملاحظة. ربما حُذفت.' : unavailable}</FormAlert>
        <button type="button" onClick={() => onDone('')} className={secondaryButton}>
          العودة إلى ملاحظاتك
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={save} noValidate>
      <button type="button" onClick={cancel} className="inline-flex cursor-pointer items-center gap-2 text-base leading-7 text-(color:--color-page-muted) outline-(--color-page-primary) hover:text-(color:--color-page-primary)">
        <img src="/icons/assessment/prev.svg" alt="" width="18" height="18" />
        ملاحظاتك
      </button>
      <h2 ref={headingRef} tabIndex={-1} className="pt-4 text-[30px] leading-[39px] tracking-[-0.02em] outline-none">
        {isNew ? 'ملاحظة جديدة' : 'ملاحظتك'}
      </h2>
      {meta && (
        <p className="text-sm leading-6 text-(color:--color-page-muted)">
          كُتبت في {formatDate(meta.created_at)}
          {formatDate(meta.updated_at) !== formatDate(meta.created_at) && ` · عُدّلت في ${formatDate(meta.updated_at)}`}
        </p>
      )}
      <div className="grid gap-5 pt-7">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="journal-title" className="text-base leading-7 font-bold">
            العنوان
          </label>
          <input
            id="journal-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setError('')
            }}
            maxLength={TITLE_MAX}
            required
            autoComplete="off"
            aria-invalid={error && !title.trim() ? true : undefined}
            placeholder="مثلًا: يوم مزدحم لكنه مرّ"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="journal-body" className="text-base leading-7 font-bold">
            ما الذي يشغلك؟
          </label>
          <textarea
            id="journal-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={BODY_MAX}
            rows={10}
            aria-describedby="journal-body-count"
            className={`${inputClass} h-auto! min-h-[260px] resize-y py-3 leading-8`}
          />
          <p id="journal-body-count" className="text-sm leading-6 text-(color:--color-page-muted)">
            {arabicNumber.format(body.length)} من {arabicNumber.format(BODY_MAX)} حرف
          </p>
        </div>
        <FormAlert>{error}</FormAlert>
        {confirm === 'discard' && (
          <p role="alert" className="rounded-(--radius-page-input) bg-(--color-page-card) px-4 py-3 text-base leading-7">
            لديك تغييرات لم تُحفظ. اضغط "تجاهل التغييرات" للخروج بدون حفظ.
          </p>
        )}
        {confirm === 'delete' && (
          <p role="alert" className="rounded-(--radius-page-input) bg-(--color-page-error-bg) px-4 py-3 text-base leading-7 text-(color:--color-page-error-text)">
            ستُحذف الملاحظة نهائيًا ولا يمكن استعادتها.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryButton}>
            {state === 'saving' ? 'جارٍ الحفظ…' : 'احفظ الملاحظة'}
          </button>
          <button type="button" disabled={busy} onClick={cancel} className={secondaryButton}>
            {confirm === 'discard' ? 'تجاهل التغييرات' : 'إلغاء'}
          </button>
          {!isNew && (
            <span className="ms-auto flex gap-3">
              {confirm === 'delete' && (
                <button type="button" disabled={busy} onClick={() => setConfirm(null)} className={secondaryButton}>
                  تراجع
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => (confirm === 'delete' ? remove() : setConfirm('delete'))}
                className={dangerButton}
              >
                {state === 'deleting' ? 'جارٍ الحذف…' : confirm === 'delete' ? 'نعم، احذفها' : 'حذف'}
              </button>
            </span>
          )}
        </div>
      </div>
    </form>
  )
}

export default function Journal() {
  const [params, setParams] = useSearchParams()
  const [flash, setFlash] = useState('')
  const raw = params.get('entry')
  const entryId = raw === 'new' || /^\d{1,18}$/.test(raw ?? '') ? raw : null

  function open(id) {
    setFlash('')
    setParams({ entry: String(id) })
  }

  function done(message) {
    setFlash(message)
    setParams({})
    window.scrollTo(0, 0)
  }

  return (
    <>
      <title>مذكراتي | ميورا</title>
      <meta name="description" content="مساحة شخصية لترتيب أفكارك وملاحظة ما يهمك في هذه اللحظة." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">مذكراتي</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">اكتب لنفسك، بدون أحكام</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">مساحة شخصية لترتيب أفكارك وملاحظة ما يهمك في هذه اللحظة.</p>
        </section>
        <section className="px-6 pt-2 pb-[105px] lg:px-[58px]">
          <div className="mx-auto grid max-w-[1050px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-[58px]">
            <div>{entryId ? <Editor key={entryId} entryId={entryId} onDone={done} /> : <EntryList onOpen={open} onNew={() => open('new')} flash={flash} />}</div>
            <aside aria-labelledby="journal-privacy" className="rounded-[20px] bg-(--color-page-guide-selected) p-[25px] lg:mt-[107px]">
              <h2 id="journal-privacy" className="flex items-center gap-2 text-base leading-[20.8px] tracking-[-0.02em] text-(color:--color-page-primary)">
                <img src="/icons/journal/shield.svg" alt="" width="20" height="20" />
                خصوصيتك بوضوح
              </h2>
              <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
                تُحفظ ملاحظاتك في حسابك، ولا يستطيع أي مستخدم آخر قراءتها. لا نستخدمها لتدريب المساعد الذكي، ويمكنك حذف أي ملاحظة في أي وقت.
              </p>
              <Link to="/privacy" className="mt-2 inline-block text-sm leading-6 text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                سياسة الخصوصية
              </Link>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}

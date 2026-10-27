import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { FormAlert } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

const MAX_MESSAGE = 1000
const HISTORY_LIMIT = 50
const arabicNumber = new Intl.NumberFormat('ar-EG')

const primaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-white shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const secondaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const link = 'text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)'

const suggestions = ['حاسس بتوتر ومش عارف أبدأ منين', 'إزاي أنظّم نومي؟', 'عايز أفهم مشاعري النهارده']

const errorMessages = {
  consent_required: 'يجب الموافقة على شروط استخدام المساعد أولًا.',
  rate_limited: 'وصلت للحد المسموح من الرسائل الآن. خذ استراحة قصيرة ثم عُد لاحقًا.',
  provider_busy: 'المساعد مشغول الآن. حاول مرة أخرى بعد دقيقة.',
  provider_error: 'تعذّر الحصول على رد الآن. حاول مرة أخرى بعد قليل.',
  invalid_message: 'اكتب رسالة قصيرة (حتى ألف حرف).',
}
const fallbackError = 'تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.'

// Replies are rendered as plain text (never as HTML). Light cleanup of markdown marks.
function cleanReply(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#+\s*/gm, '')
}

function CrisisNote() {
  return (
    <p role="note" className="rounded-[14px] bg-(--color-page-card) px-4 py-3 text-sm leading-6">
      في خطر الآن؟ اتصل بالإسعاف على <bdi className="font-bold">123</bdi>، أو بالخط الساخن للدعم النفسي على{' '}
      <bdi className="font-bold">16328</bdi> أو <bdi className="font-bold">105</bdi>.
    </p>
  )
}

function Hero() {
  return (
    <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[60px] text-center">
      <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">المساعد الذكي</p>
      <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">مساحة للحديث وترتيب أفكارك</h1>
      <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
        مساعد تعليمي داعم يستمع لك ويقترح خطوات بسيطة. ليس مختصًا ولا يقدّم تشخيصًا.
      </p>
    </section>
  )
}

function Guest() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 rounded-[22px] border border-(--color-page-border) bg-(--color-page-surface) p-8 text-center">
      <span className="grid size-[60px] place-items-center rounded-[18px] bg-(--color-page-guide-selected)">
        <img src="/icons/assistant/chat.svg" alt="" width="28" height="28" />
      </span>
      <h2 className="text-[24px] leading-[1.4]">سجّل الدخول لتبدأ المحادثة</h2>
      <p className="text-base leading-7 text-(color:--color-page-muted)">تُحفظ محادثاتك في حسابك لتعود إليها، ويمكنك مسحها في أي وقت.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/login?next=/assistant" className={primaryButton}>تسجيل الدخول</Link>
        <Link to="/register" className={secondaryButton}>إنشاء حساب</Link>
      </div>
    </div>
  )
}

function Consent({ onAccept, saving, error }) {
  const [checked, setChecked] = useState(false)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (checked) onAccept()
      }}
      className="mx-auto max-w-[720px] rounded-[22px] border border-(--color-page-border) bg-(--color-page-surface) p-6 md:p-8"
    >
      <h2 className="flex items-center gap-2.5 text-[24px] leading-[1.4]">
        <img src="/icons/journal/shield.svg" alt="" width="22" height="22" />
        قبل أن تبدأ
      </h2>
      <ul className="mt-4 grid list-disc gap-2 ps-5 text-base leading-7">
        <li>
          رسائلك تُرسَل إلى خدمة <bdi>Gemini</bdi> من شركة <bdi>Google</bdi> لتوليد الرد.
        </li>
        <li>
          نستخدم الخطة المجانية من <bdi>Google</bdi>، وفيها قد تستخدم <bdi>Google</bdi> المحادثات لتحسين خدماتها، وقد يقرؤها مراجعون لديها.
        </li>
        <li>
          <strong>لذلك لا تكتب</strong> اسمك الكامل أو رقم هاتفك أو عنوانك أو تفاصيل تعرّف بك أو بغيرك، ولا تفاصيل حالتك الصحية أو أدويتك.
        </li>
        <li>المساعد ليس طبيبًا ولا معالجًا، وردوده قد تكون غير دقيقة. لا تعتمد عليها في قرارات تخص صحتك.</li>
        <li>تُحفظ المحادثة في حسابك، ويمكنك مسحها أو سحب موافقتك في أي وقت.</li>
      </ul>
      <div className="mt-5">
        <CrisisNote />
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-base leading-7 font-bold">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1.5 size-5 shrink-0 accent-(--color-page-button)"
        />
        قرأت ما سبق وأوافق على استخدام المساعد بهذه الشروط.
      </label>
      {error && (
        <div className="mt-4">
          <FormAlert>{error}</FormAlert>
        </div>
      )}
      <button type="submit" disabled={!checked || saving} className={`${primaryButton} mt-6`}>
        {saving ? 'جارٍ الحفظ…' : 'ابدأ المحادثة'}
      </button>
    </form>
  )
}

function Bubble({ message }) {
  const mine = message.role === 'user'
  return (
    <li className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-[18px] px-[18px] py-3 text-base leading-7 whitespace-pre-wrap [overflow-wrap:anywhere] ${
          mine
            ? 'rounded-ss-[6px] bg-(--color-page-button) text-white'
            : 'rounded-se-[6px] border border-(--color-page-border) bg-(--color-page-surface)'
        }`}
      >
        <span className="sr-only">{mine ? 'أنت: ' : 'المساعد: '}</span>
        {mine ? message.content : cleanReply(message.content)}
      </div>
    </li>
  )
}

function Chat({ user, initial, onWithdraw }) {
  const [messages, setMessages] = useState(initial)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length, sending])

  async function send(value) {
    const message = value.trim()
    if (!message || sending) return
    if (message.length > MAX_MESSAGE) {
      setError(errorMessages.invalid_message)
      return
    }
    setError('')
    setSending(true)
    const pending = { id: `pending-${Date.now()}`, role: 'user', content: message }
    setMessages((current) => [...current, pending])
    setText('')
    const { data, error: invokeError } = await supabase.functions.invoke('assistant', { body: { message } })
    if (invokeError || !Array.isArray(data?.messages)) {
      let code = ''
      try {
        code = (await invokeError?.context?.json())?.error ?? ''
      } catch {
        code = ''
      }
      setMessages((current) => current.filter((item) => item.id !== pending.id))
      setText(message)
      setError(errorMessages[code] ?? fallbackError)
      setSending(false)
      inputRef.current?.focus()
      return
    }
    setMessages((current) => [...current.filter((item) => item.id !== pending.id), ...data.messages])
    setSending(false)
    inputRef.current?.focus()
  }

  async function clearAll() {
    setClearing(true)
    const { error: deleteError } = await supabase.from('assistant_messages').delete().eq('user_id', user.id)
    setClearing(false)
    setConfirmClear(false)
    if (deleteError) {
      setError('تعذّر مسح المحادثة. حاول مرة أخرى.')
      return
    }
    setMessages([])
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="rounded-[22px] border border-(--color-page-border) bg-(--color-page-bg) p-4 md:p-6">
        {messages.length === 0 && !sending ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="grid size-[60px] place-items-center rounded-[18px] bg-(--color-page-guide-selected)">
              <img src="/icons/assistant/chat.svg" alt="" width="28" height="28" />
            </span>
            <h2 className="text-lg leading-[31.5px]">بماذا تشعر الآن؟</h2>
            <p className="text-base leading-7 text-(color:--color-page-muted)">اكتب بحرية، أو ابدأ بإحدى هذه الجمل:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((item) => (
                <button key={item} type="button" onClick={() => send(item)} className={`${secondaryButton} min-h-11 rounded-full px-4 text-sm font-normal`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul role="log" aria-live="polite" aria-label="المحادثة" className="grid max-h-[60vh] gap-3 overflow-y-auto pe-1">
            {messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {sending && (
              <li className="flex justify-end">
                <p role="status" className="rounded-[18px] border border-(--color-page-border) bg-(--color-page-surface) px-[18px] py-3 text-base text-(color:--color-page-muted)">
                  المساعد يكتب…
                </p>
              </li>
            )}
            <li ref={endRef} aria-hidden="true" />
          </ul>
        )}
      </div>

      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          send(text)
        }}
      >
        <label htmlFor="assistant-input" className="sr-only">
          رسالتك
        </label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          rows={3}
          value={text}
          maxLength={MAX_MESSAGE}
          onChange={(event) => {
            setText(event.target.value)
            setError('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              send(text)
            }
          }}
          placeholder="اكتب ما يشغلك… (بدون معلومات شخصية)"
          aria-describedby="assistant-count"
          className="min-h-[96px] w-full resize-y rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-surface) px-[14px] py-3 text-base leading-7 outline-(--color-page-primary) placeholder:text-(color:--color-page-muted)"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="assistant-count" className="text-sm leading-6 text-(color:--color-page-muted)">
            {arabicNumber.format(text.length)} من {arabicNumber.format(MAX_MESSAGE)} · Enter للإرسال، و Shift+Enter لسطر جديد
          </p>
          <button type="submit" disabled={sending || !text.trim()} className={primaryButton}>
            {sending ? 'جارٍ الإرسال…' : 'إرسال'}
          </button>
        </div>
        <FormAlert>{error}</FormAlert>
      </form>

      <div className="mt-6 grid gap-4">
        <CrisisNote />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-6">
          {messages.length > 0 &&
            (confirmClear ? (
              <span className="flex flex-wrap items-center gap-3">
                <span role="alert">ستُحذف المحادثة كلها نهائيًا.</span>
                <button type="button" disabled={clearing} onClick={clearAll} className="cursor-pointer font-bold text-(color:--color-page-error-text) underline underline-offset-4 outline-(--color-page-primary)">
                  {clearing ? 'جارٍ المسح…' : 'نعم، امسحها'}
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className={`cursor-pointer ${link}`}>
                  تراجع
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className={`cursor-pointer ${link}`}>
                مسح المحادثة
              </button>
            ))}
          <button type="button" onClick={onWithdraw} className={`cursor-pointer ${link}`}>
            سحب الموافقة وإيقاف المساعد
          </button>
          <Link to="/terms" className={link}>
            شروط الاستخدام
          </Link>
        </div>
      </div>
    </div>
  )
}

function SignedIn({ user }) {
  const [state, setState] = useState('loading')
  const [consented, setConsented] = useState(false)
  const [messages, setMessages] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!supabase) {
      setState('error')
      return
    }
    setState('loading')
    const [profile, history] = await Promise.all([
      supabase.from('profiles').select('assistant_consent_at').eq('id', user.id).maybeSingle(),
      supabase
        .from('assistant_messages')
        .select('id, role, content, created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(HISTORY_LIMIT),
    ])
    if (profile.error || history.error) {
      setState('error')
      return
    }
    setConsented(Boolean(profile.data?.assistant_consent_at))
    setMessages([...(history.data ?? [])].reverse())
    setState('ready')
  }

  useEffect(() => {
    load()
  }, [user.id])

  async function setConsent(value) {
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ assistant_consent_at: value ? new Date().toISOString() : null })
      .eq('id', user.id)
    setSaving(false)
    if (updateError) {
      setError('تعذّر حفظ اختيارك. حاول مرة أخرى.')
      return
    }
    setConsented(value)
    window.scrollTo(0, 0)
  }

  if (state === 'loading') {
    return (
      <p role="status" className="py-10 text-center text-base text-(color:--color-page-muted)">
        جارٍ التحميل…
      </p>
    )
  }
  if (state === 'error') {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4">
        <FormAlert>{fallbackError}</FormAlert>
        <button type="button" onClick={load} className={secondaryButton}>
          أعد المحاولة
        </button>
      </div>
    )
  }
  if (!consented) return <Consent onAccept={() => setConsent(true)} saving={saving} error={error} />
  return (
    <>
      {error && (
        <div className="mx-auto mb-4 max-w-[760px]">
          <FormAlert>{error}</FormAlert>
        </div>
      )}
      <Chat user={user} initial={messages} onWithdraw={() => setConsent(false)} />
    </>
  )
}

export default function Assistant() {
  const { user, loading } = useAuth()
  return (
    <>
      <title>المساعد الذكي | ميورا</title>
      <meta name="description" content="مساعد تعليمي داعم يستمع لك ويقترح خطوات بسيطة. ليس مختصًا ولا يقدّم تشخيصًا." />
      <main className="flex-1">
        <Hero />
        <section className="px-6 pb-[105px]">
          {loading ? null : user ? <SignedIn user={user} /> : <Guest />}
        </section>
      </main>
    </>
  )
}

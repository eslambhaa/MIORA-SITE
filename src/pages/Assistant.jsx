import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { FormAlert } from '../components/auth/fields.jsx'
import NoteDialog from '../components/NoteDialog.jsx'
import { parseReply } from '../data/assistantActions.js'
import { supabase } from '../lib/supabase.js'

const MAX_MESSAGE = 1000
const HISTORY_LIMIT = 50
const CONVERSATION_LIMIT = 50
const dateFormat = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
const arabicNumber = new Intl.NumberFormat('ar-EG')

const primaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-white shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const secondaryButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'
const link = 'text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)'

const suggestions = ['إزاي أتعامل مع التوتر؟', 'عايز أفهم مشاعري بشكل أفضل.', 'إيه العادات اللي ممكن تساعدني أنام بشكل أفضل؟', 'إزاي أطلب الدعم لما أحتاجه؟']

const errorMessages = {
  consent_required: 'يجب الموافقة على شروط استخدام المساعد أولًا.',
  rate_limited: 'وصلت للحد المسموح من الرسائل الآن. خذ استراحة قصيرة ثم عُد لاحقًا.',
  provider_busy: 'المساعد مشغول الآن. حاول مرة أخرى بعد دقيقة.',
  provider_error: 'تعذّر الحصول على رد الآن. حاول مرة أخرى بعد قليل.',
  invalid_message: 'اكتب رسالة قصيرة (حتى ألف حرف).',
  conversation_not_found: 'لم نجد هذه المحادثة. ربما حُذفت.',
}
const fallbackError = 'تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.'

// Replies are rendered as plain text (never as HTML). Light cleanup of markdown marks.
function cleanReply(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
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

function Arrow({ className = '' }) {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

const actionClass =
  'inline-flex min-h-10 items-center gap-2 rounded-full border border-(--color-page-button) bg-(--color-page-surface) px-4 text-sm leading-6 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) transition-colors duration-200 hover:bg-(--color-page-guide-selected) motion-reduce:transition-none'

function Bubble({ message, onWriteNote }) {
  const mine = message.role === 'user'
  const reply = mine ? null : parseReply(cleanReply(message.content))
  return (
    <li className={`flex flex-col gap-2 ${mine ? 'items-start' : 'items-end'}`}>
      <div
        className={`relative max-w-[85%] rounded-[18px] px-[18px] py-3 text-base leading-7 whitespace-pre-wrap [overflow-wrap:anywhere] ${
          mine
            ? 'rounded-ss-[6px] bg-(--color-page-button) text-white'
            : 'rounded-se-[6px] border border-(--color-page-border) bg-(--color-page-bg)'
        }`}
      >
        <span className="sr-only">{mine ? 'أنت: ' : 'المساعد: '}</span>
        {mine ? message.content : reply.text}
      </div>
      {reply?.actions.length > 0 && (
        <div className="flex max-w-[85%] flex-wrap gap-2">
          {reply.actions.map((action) =>
            action.key === 'journal' ? (
              <button key={action.key} type="button" onClick={onWriteNote} className={`cursor-pointer ${actionClass}`}>
                {action.label}
                <Arrow />
              </button>
            ) : (
              <Link key={action.key} to={action.to} className={actionClass}>
                {action.label}
                <Arrow />
              </Link>
            ),
          )}
        </div>
      )}
    </li>
  )
}

function Sidebar({ conversations, activeId, onNew, onOpen, onDelete, onWithdraw, listState, className = '', onClose }) {
  const [confirmId, setConfirmId] = useState(null)
  return (
    <aside aria-label="المحادثات" className={`flex-col gap-5 bg-[#1d2a6b] p-6 text-white md:w-[272px] md:shrink-0 ${className}`}>
      <div className="flex items-start justify-between gap-3">
      <span className="grid size-[50px] place-items-center rounded-[14px] bg-white/10">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3.5L12.25 9.91667L5.83333 11.6667L12.25 13.4167L14 19.8333L15.75 13.4167L22.1667 11.6667L15.75 9.91667L14 3.5Z" />
          <path d="M5.83333 19.8333L5.01667 22.5167L2.33333 23.3333L5.01667 24.15L5.83333 26.8333L6.65 24.15L9.33333 23.3333L6.65 22.5167L5.83333 19.8333Z" />
        </svg>
      </span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق قائمة المحادثات"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/25 outline-white"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
      </div>
      <div>
        <h2 className="text-lg leading-7">مساعد ميورا</h2>
        <p className="pt-2 text-sm leading-6 text-[#c9cfec]">واجهة تجريبية لتنظيم الأفكار واستكشاف خطوات عامة.</p>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-[12px] border border-white/25 bg-white/5 px-4 text-base outline-white transition-colors duration-200 hover:bg-white/15 motion-reduce:transition-none"
      >
        <img src="/icons/journal/pen.svg" alt="" width="18" height="18" />
        محادثة جديدة
      </button>

      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className="pb-2 text-sm leading-6 text-[#c9cfec]">محادثاتك السابقة</h3>
        {listState === 'loading' && <p className="text-sm text-[#c9cfec]">جارٍ التحميل…</p>}
        {listState === 'ready' && conversations.length === 0 && <p className="text-sm leading-6 text-[#c9cfec]">لا توجد محادثات بعد.</p>}
        {conversations.length > 0 && (
          <ul className="grid min-h-0 flex-1 content-start gap-1 overflow-y-auto pe-1 md:max-h-[380px] md:flex-none">
            {conversations.map((item) => {
              const active = item.id === activeId
              return (
                <li key={item.id} className={`group flex items-center gap-1 rounded-[10px] ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}>
                  {confirmId === item.id ? (
                    <div className="flex w-full flex-wrap items-center gap-2 px-3 py-2 text-sm">
                      <span>حذف المحادثة؟</span>
                      <button type="button" onClick={() => { setConfirmId(null); onDelete(item.id) }} className="cursor-pointer font-bold text-[#ffb4b4] underline underline-offset-4 outline-white">
                        نعم
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="cursor-pointer underline underline-offset-4 outline-white">
                        تراجع
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpen(item.id)}
                        aria-current={active ? 'true' : undefined}
                        className="min-w-0 flex-1 cursor-pointer rounded-[10px] px-3 py-2 text-start outline-white"
                      >
                        <span className="block truncate text-sm leading-6">{item.title}</span>
                        <span className="block text-xs leading-5 text-[#c9cfec]">{dateFormat.format(new Date(item.updated_at))}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(item.id)}
                        aria-label={`حذف المحادثة: ${item.title}`}
                        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#c9cfec] outline-white hover:bg-white/10 hover:text-white"
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-2">
        <Link to="/terms" className="text-sm leading-6 text-[#c9cfec] underline underline-offset-4 outline-white hover:text-white md:hidden">
          شروط الاستخدام
        </Link>
        <button type="button" onClick={onWithdraw} className="cursor-pointer text-start text-sm leading-6 text-[#c9cfec] underline underline-offset-4 outline-white hover:text-white">
          سحب الموافقة وإيقاف المساعد
        </button>
      </div>
    </aside>
  )
}

function Chat({ user, onWithdraw }) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('c')
  const activeId = /^\d{1,18}$/.test(raw ?? '') ? Number(raw) : null

  const [conversations, setConversations] = useState([])
  const [listState, setListState] = useState('loading')
  const [messages, setMessages] = useState([])
  const [threadState, setThreadState] = useState('ready')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const justCreated = useRef(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)

  useEffect(() => {
    const dialog = drawerRef.current
    if (!dialog) return
    if (drawerOpen && !dialog.open) dialog.showModal()
    if (!drawerOpen && dialog.open) dialog.close()
  }, [drawerOpen])

  // Grow the message box with its text (up to about five lines).
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 168)}px`
  }, [text])

  async function loadConversations() {
    setListState('loading')
    const { data, error: listError } = await supabase
      .from('assistant_conversations')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(CONVERSATION_LIMIT)
    if (listError) {
      setListState('error')
      return
    }
    setConversations(data ?? [])
    setListState('ready')
  }

  useEffect(() => {
    loadConversations()
  }, [user.id])

  useEffect(() => {
    setError('')
    if (activeId === null) {
      setMessages([])
      setThreadState('ready')
      return undefined
    }
    if (justCreated.current === activeId) {
      justCreated.current = null
      return undefined
    }
    let active = true
    setThreadState('loading')
    supabase
      .from('assistant_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(HISTORY_LIMIT)
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) {
          setThreadState('error')
          return
        }
        if (!data || data.length === 0) {
          setThreadState('missing')
          return
        }
        setMessages([...data].reverse())
        setThreadState('ready')
      })
    return () => {
      active = false
    }
  }, [activeId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length, sending])

  function openConversation(id) {
    setDrawerOpen(false)
    if (sending) return
    setParams(id ? { c: String(id) } : {})
    setText('')
  }

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
    const { data, error: invokeError } = await supabase.functions.invoke('assistant', {
      body: { message, conversation_id: activeId },
    })
    if (invokeError || !Array.isArray(data?.messages) || !data?.conversation) {
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
    const conversation = data.conversation
    setMessages((current) => [...current.filter((item) => item.id !== pending.id), ...data.messages])
    setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)])
    if (conversation.id !== activeId) {
      justCreated.current = conversation.id
      setParams({ c: String(conversation.id) })
    }
    setSending(false)
    inputRef.current?.focus()
  }

  async function deleteConversation(id) {
    const { error: deleteError } = await supabase.from('assistant_conversations').delete().eq('id', id)
    if (deleteError) {
      setError('تعذّر حذف المحادثة. حاول مرة أخرى.')
      return
    }
    setConversations((current) => current.filter((item) => item.id !== id))
    if (id === activeId) setParams({})
  }

  const empty = activeId === null && messages.length === 0 && !sending

  return (
    <div className="mx-auto max-w-[1062px]">
      <div className="flex h-[calc(100dvh-120px)] overflow-hidden rounded-[24px] border border-(--color-page-border) bg-(--color-page-surface) shadow-(--shadow-page-guide) md:h-[703px] md:flex-row-reverse md:rounded-[28px]">
        <section aria-label="المحادثة الحالية" className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-(--color-page-border) px-3 py-2.5 md:px-6 md:py-5">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="محادثاتي"
                aria-haspopup="dialog"
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-(--color-page-border) outline-(--color-page-primary) md:hidden"
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
              </button>
              <h2 className="truncate text-base leading-7 font-bold">
                <span className="md:hidden">{conversations.find((item) => item.id === activeId)?.title ?? 'مساحة للحوار'}</span>
                <span className="hidden md:inline">مساحة للحوار</span>
              </h2>
            </div>
            <Link to="/help" className="hidden text-sm leading-6 text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline md:inline">
              المساعدة والدعم
            </Link>
            <button
              type="button"
              onClick={() => openConversation(null)}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-(--color-page-border) px-3.5 text-sm font-bold text-(color:--color-page-primary) outline-(--color-page-primary) md:hidden"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              جديدة
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-16 md:py-6">
            {threadState === 'loading' && (
              <p role="status" className="py-10 text-center text-base text-(color:--color-page-muted)">
                جارٍ فتح المحادثة…
              </p>
            )}
            {(threadState === 'error' || threadState === 'missing') && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <FormAlert>{threadState === 'missing' ? errorMessages.conversation_not_found : fallbackError}</FormAlert>
                <button type="button" onClick={() => openConversation(null)} className={secondaryButton}>
                  ابدأ محادثة جديدة
                </button>
              </div>
            )}
            {threadState === 'ready' && empty && (
              <div className="flex flex-col items-center gap-3 py-4 text-center md:py-12">
                <span className="grid size-14 place-items-center rounded-[18px] bg-(--color-page-guide-selected) md:size-16">
                  <img src="/icons/assistant/chat.svg" alt="" width="28" height="28" />
                </span>
                <h3 className="pt-2 text-[24px] leading-[1.3] tracking-[-0.02em] md:pt-3 md:text-[32px]">أهلًا، أنا هنا لأسمعك</h3>
                <p className="max-w-[650px] text-base leading-7 text-(color:--color-page-muted)">
                  أنا هنا لمساعدتك على فهم مشاعرك واستكشاف خطوات صحية للتعامل معها. يمكنك البدء بالحديث عمّا يشغلك.
                </p>
                <ul className="grid w-full max-w-[660px] gap-2.5 pt-3 sm:grid-cols-2 md:pt-5">
                  {suggestions.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => send(item)}
                        className="flex h-full min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-(--color-page-border) bg-(--color-page-bg) px-4 py-2.5 text-start text-base leading-7 outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) motion-reduce:transition-none"
                      >
                        {item}
                        <Arrow className="shrink-0 text-(color:--color-page-muted)" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {threadState === 'ready' && !empty && (
              <ul role="log" aria-live="polite" aria-label="المحادثة" className="grid gap-3">
                {messages.map((message) => (
                  <Bubble key={message.id} message={message} onWriteNote={() => setNoteOpen(true)} />
                ))}
                {sending && (
                  <li className="flex justify-end">
                    <p role="status" className="rounded-[18px] border border-(--color-page-border) bg-(--color-page-bg) px-[18px] py-3 text-base text-(color:--color-page-muted)">
                      المساعد يكتب…
                    </p>
                  </li>
                )}
                <li ref={endRef} aria-hidden="true" />
              </ul>
            )}
          </div>

          <form
            className="border-t border-(--color-page-border) px-3 pt-2 pb-3 md:px-6 md:py-5"
            onSubmit={(event) => {
              event.preventDefault()
              send(text)
            }}
          >
            <p role="note" className="pb-2 text-xs leading-5 text-(color:--color-page-muted) md:hidden">
              في خطر الآن؟ الإسعاف <bdi className="font-bold text-(color:--color-page-heading)">123</bdi> · الدعم النفسي{' '}
              <bdi className="font-bold text-(color:--color-page-heading)">16328</bdi> أو <bdi className="font-bold text-(color:--color-page-heading)">105</bdi>
            </p>
            {error && (
              <div className="pb-2 md:hidden">
                <FormAlert>{error}</FormAlert>
              </div>
            )}
            <label htmlFor="assistant-input" className="sr-only md:not-sr-only md:block md:text-sm md:leading-6 md:text-(color:--color-page-muted)">
              اكتب ما يدور في بالك
            </label>
            <div className="flex items-end gap-2 md:gap-4">
              <textarea
                id="assistant-input"
                ref={inputRef}
                rows={1}
                value={text}
                maxLength={MAX_MESSAGE}
                disabled={threadState !== 'ready'}
                onChange={(event) => {
                  setText(event.target.value)
                  setError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && window.matchMedia('(min-width: 768px)').matches) {
                    event.preventDefault()
                    send(text)
                  }
                }}
                placeholder="اكتب رسالتك هنا…"
                aria-describedby="assistant-count"
                className="max-h-[168px] min-h-12 w-full flex-1 resize-none rounded-[24px] border border-(--color-page-border) bg-(--color-page-bg) px-4 py-2.5 text-base leading-7 outline-(--color-page-primary) placeholder:text-(color:--color-page-muted) md:min-h-14 md:rounded-[10px] md:border-0 md:bg-transparent md:px-0 md:py-2"
              />
              <button
                type="submit"
                aria-label="إرسال"
                disabled={sending || !text.trim() || threadState !== 'ready'}
                className={`${primaryButton} shrink-0 max-md:size-12 max-md:rounded-full max-md:px-0 max-md:py-0`}
              >
                <span className="hidden md:inline">{sending ? 'جارٍ الإرسال…' : 'إرسال'}</span>
                <Arrow />
              </button>
            </div>
            <p id="assistant-count" className={`pt-1 text-xs leading-5 text-(color:--color-page-muted) ${text.length > 800 ? '' : 'max-md:hidden'}`}>
              {arabicNumber.format(text.length)} من {arabicNumber.format(MAX_MESSAGE)}
              <span className="max-md:hidden"> · Enter للإرسال، و Shift+Enter لسطر جديد</span>
            </p>
            {error && (
              <div className="hidden pt-3 md:block">
                <FormAlert>{error}</FormAlert>
              </div>
            )}
          </form>
        </section>

        <Sidebar
          className="hidden md:flex"
          conversations={conversations}
          activeId={activeId}
          listState={listState}
          onNew={() => openConversation(null)}
          onOpen={openConversation}
          onDelete={deleteConversation}
          onWithdraw={onWithdraw}
        />
      </div>

      <dialog
        ref={drawerRef}
        aria-label="محادثاتي"
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === drawerRef.current) setDrawerOpen(false)
        }}
        className="m-0 me-auto h-dvh max-h-dvh w-[86%] max-w-[340px] overflow-hidden bg-transparent p-0 backdrop:bg-black/45 md:hidden"
      >
        <Sidebar
          className="flex h-full"
          onClose={() => setDrawerOpen(false)}
          conversations={conversations}
          activeId={activeId}
          listState={listState}
          onNew={() => openConversation(null)}
          onOpen={openConversation}
          onDelete={deleteConversation}
          onWithdraw={onWithdraw}
        />
      </dialog>

      <NoteDialog open={noteOpen} onClose={() => setNoteOpen(false)} onSaved={() => setNoteSaved(true)} />
      {noteSaved && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-(--radius-page-input) bg-(--color-page-success-bg) px-4 py-3 text-base leading-7 text-(color:--color-page-success-text) max-md:fixed max-md:inset-x-3 max-md:bottom-24 max-md:z-40 max-md:shadow-(--shadow-page-guide)">
          <p role="status">حُفظت الملاحظة في مذكراتك.</p>
          <span className="flex gap-4 text-sm">
            <Link to="/journal" className="font-bold underline underline-offset-4 outline-(--color-page-primary)">افتح مذكراتي</Link>
            <button type="button" onClick={() => setNoteSaved(false)} className="cursor-pointer underline underline-offset-4 outline-(--color-page-primary)">إخفاء</button>
          </span>
        </div>
      )}
      <div className="mt-6 hidden gap-3 md:grid">
        <CrisisNote />
        <p className="text-sm leading-6 text-(color:--color-page-muted)">
          ردود المساعد تُكتب آليًا وقد تكون غير دقيقة.{' '}
          <Link to="/terms" className={link}>
            شروط الاستخدام
          </Link>
        </p>
      </div>
    </div>
  )
}

function SignedIn({ user }) {
  const [state, setState] = useState('loading')
  const [consented, setConsented] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!supabase) {
      setState('error')
      return
    }
    setState('loading')
    const { data, error: loadError } = await supabase.from('profiles').select('assistant_consent_at').eq('id', user.id).maybeSingle()
    if (loadError) {
      setState('error')
      return
    }
    setConsented(Boolean(data?.assistant_consent_at))
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
        <div className="mx-auto mb-4 max-w-[1062px]">
          <FormAlert>{error}</FormAlert>
        </div>
      )}
      <Chat user={user} onWithdraw={() => setConsent(false)} />
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
        {user ? (
          <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-2 pt-[112px] pb-2 md:px-6 md:pt-[132px] md:pb-[80px]">
            <h1 className="sr-only">المساعد الذكي</h1>
            {loading ? null : <SignedIn user={user} />}
          </section>
        ) : (
          <>
            <Hero />
            <section className="px-6 pb-[105px]">{loading ? null : <Guest />}</section>
          </>
        )}
      </main>
    </>
  )
}

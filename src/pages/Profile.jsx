import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { FormAlert, inputClass, secondaryButton } from '../components/auth/fields.jsx'
import DeleteAccountDialog from '../components/profile/DeleteAccountDialog.jsx'
import { AVATAR_ACCEPT, AvatarError, avatarUrl, prepareAvatar, removeAvatar, uploadAvatar } from '../lib/avatar.js'
import { downloadMyData } from '../lib/exportData.js'
import { supabase } from '../lib/supabase.js'

const NAME_MAX = 50
const RECENT_NOTES = 3

// Figma 2:4998: activity summary, recent notes, identity card, quick links.
const summary = [
  { table: 'journal_entries', label: 'ملاحظات محفوظة', icon: 'stat-notes' },
  { table: 'mood_logs', label: 'تسجيلات مزاج', icon: 'stat-mood' },
  { table: 'exercise_sessions', label: 'تمارين مكتملة', icon: 'stat-exercise' },
]

const quickLinks = [
  { to: '/journal', label: 'مذكراتي', icon: 'link-journal' },
  { to: '/relaxation', label: 'تمارين الاسترخاء', icon: 'link-relaxation' },
  { to: '/content', label: 'المحتوى التوعوي', icon: 'link-content' },
  { to: '/assessment', label: 'التقييمات الذاتية', icon: 'link-assessment' },
]

const providerNames = { email: 'البريد وكلمة المرور', google: 'حساب Google' }
const avatarErrors = {
  type: 'اختر صورة بصيغة JPG أو PNG أو WebP.',
  size: 'الصورة كبيرة جدًا. اختر صورة أصغر من 10 ميجابايت.',
  decode: 'تعذّر قراءة هذه الصورة. جرّب صورة أخرى.',
}

const number = new Intl.NumberFormat('ar-EG')
const dateFormat = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long', timeZone: 'Africa/Cairo' })
const shortDate = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' })

const panel = 'rounded-[22px] border border-(--color-page-border) bg-(--color-page-surface)'
const card =
  'rounded-(--radius-page-card) border border-(--color-page-border) bg-(--color-page-surface) p-6 shadow-(--shadow-home-soft) md:p-8'
const link = 'text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)'
const saveButton =
  'flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:w-auto sm:shrink-0'
const dangerButton =
  'flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-error-text) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-error-text) outline-(--color-page-error-text) transition-colors duration-200 hover:bg-(--color-page-error-bg) motion-reduce:transition-none sm:w-auto'

function IdentityCard({ user, name, hasAvatar, onAvatarChange, onSignOut }) {
  const inputRef = useRef(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!hasAvatar) {
      setUrl('')
      return undefined
    }
    avatarUrl(user.id)
      .then((signed) => active && setUrl(signed))
      .catch(() => active && setUrl(''))
    return () => {
      active = false
    }
  }, [user.id, hasAvatar])

  async function choose(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const blob = await prepareAvatar(file)
      await uploadAvatar(user.id, blob)
      onAvatarChange(new Date().toISOString())
      setUrl(await avatarUrl(user.id))
    } catch (problem) {
      setError(problem instanceof AvatarError ? avatarErrors[problem.message] : 'تعذّر حفظ الصورة. تحقق من الاتصال ثم حاول مرة أخرى.')
    }
    setBusy(false)
  }

  async function remove() {
    setBusy(true)
    setError('')
    try {
      await removeAvatar(user.id)
      onAvatarChange(null)
    } catch {
      setError('تعذّر إزالة الصورة الآن. حاول مرة أخرى.')
    }
    setBusy(false)
  }

  return (
    <section aria-label="حسابك" className={`${panel} flex flex-col items-center gap-4 p-[26px] text-center lg:w-[273px] lg:shrink-0`}>
      <span className="grid size-[65px] place-items-center overflow-hidden rounded-full bg-(--color-page-guide-selected)">
        {url ? (
          <img src={url} alt="صورتك الشخصية" width="65" height="65" className="size-full object-cover" />
        ) : (
          <img src="/icons/profile/avatar.svg" alt="" width="30" height="30" />
        )}
      </span>
      <p className="text-xl leading-[20.8px] tracking-[-0.02em] break-all">{name}</p>
      <input ref={inputRef} type="file" accept={AVATAR_ACCEPT} onChange={choose} className="sr-only" tabIndex={-1} aria-hidden="true" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex min-h-[53px] w-full max-w-[219px] cursor-pointer items-center justify-center rounded-[8px] bg-(--color-page-button) px-4 text-lg leading-[20.8px] text-white outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
      >
        {busy ? 'جارٍ الحفظ…' : 'تعديل الصورة الشخصية'}
      </button>
      {hasAvatar && !busy && (
        <button type="button" onClick={remove} className={`-mt-2 cursor-pointer text-sm leading-6 ${link}`}>
          إزالة الصورة
        </button>
      )}
      <p role="status" className="sr-only">
        {busy ? 'جارٍ حفظ الصورة' : ''}
      </p>
      {error && (
        <p role="alert" className="text-sm leading-6 text-(color:--color-page-error-text)">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onSignOut}
        className="cursor-pointer rounded-[8px] p-2 text-lg leading-[20.8px] text-(color:--color-page-error-text) outline-(--color-page-error-text) hover:underline hover:underline-offset-4"
      >
        تسجيل الخروج
      </button>
    </section>
  )
}

function ActivitySummary({ loadState, counts, notes }) {
  return (
    <section aria-labelledby="summary-title" className={`${panel} min-w-0 flex-1 p-[26px]`}>
      <h2 id="summary-title" className="text-base leading-[20.8px] tracking-[-0.02em]">
        ملخّص نشاطك
      </h2>
      <ul className="grid grid-cols-3 gap-2 pt-[18px] sm:gap-3">
        {summary.map(({ table, label, icon }) => (
          <li key={table} className="flex min-w-0 flex-col rounded-[14px] bg-(--color-page-bg) p-3 sm:p-4">
            <img src={`/icons/profile/${icon}.svg`} alt="" width="20" height="20" className="size-5" />
            <span className="text-[25px] leading-[43.75px] font-bold">
              {loadState === 'ready' ? (counts[table] ? number.format(counts[table]) : '—') : '…'}
            </span>
            <span className="text-[13px] leading-[22.75px] text-(color:--color-page-muted)">{label}</span>
          </li>
        ))}
      </ul>
      <h3 className="pt-[30px] text-base leading-[20.8px] tracking-[-0.02em]">آخر الملاحظات</h3>
      {loadState === 'ready' && notes.length > 0 ? (
        <ul className="grid gap-1 pt-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                to={`/journal?entry=${note.id}`}
                className="flex items-baseline justify-between gap-3 rounded-[10px] py-1 text-base leading-7 outline-(--color-page-primary) hover:text-(color:--color-page-primary)"
              >
                <span className="truncate">{note.title}</span>
                <span className="shrink-0 text-[13px] text-(color:--color-page-muted)">{shortDate.format(new Date(note.updated_at))}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
          {loadState === 'ready' ? 'لا توجد ملاحظات بعد. لن نعرض مقتطفات خاصة هنا.' : '…'}
        </p>
      )}
      {loadState === 'ready' && notes.length > 0 && (
        <p className="pt-1 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">نعرض العناوين فقط، من دون مقتطفات خاصة.</p>
      )}
    </section>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState('loading')
  const [savedName, setSavedName] = useState('')
  const [name, setName] = useState('')
  const [consentAt, setConsentAt] = useState(null)
  const [avatarAt, setAvatarAt] = useState(null)
  const [counts, setCounts] = useState({})
  const [notes, setNotes] = useState([])

  const [nameBusy, setNameBusy] = useState(false)
  const [nameMessage, setNameMessage] = useState({ tone: 'success', text: '' })
  const [consentBusy, setConsentBusy] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const providers = [...new Set((user.identities ?? []).map((identity) => identity.provider))]
  const hasPassword = providers.includes('email')

  useEffect(() => {
    let active = true
    setLoadState('loading')
    Promise.all([
      supabase.from('profiles').select('display_name, assistant_consent_at, avatar_updated_at').eq('id', user.id).maybeSingle(),
      supabase.from('journal_entries').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(RECENT_NOTES),
      ...summary.map(({ table }) => supabase.from(table).select('id', { count: 'exact', head: true })),
    ]).then(([profile, recent, ...results]) => {
      if (!active) return
      if (profile.error || recent.error || results.some((result) => result.error)) {
        setLoadState('error')
        return
      }
      const current = profile.data?.display_name ?? ''
      setSavedName(current)
      setName(current)
      setConsentAt(profile.data?.assistant_consent_at ?? null)
      setAvatarAt(profile.data?.avatar_updated_at ?? null)
      setNotes(recent.data ?? [])
      setCounts(Object.fromEntries(summary.map(({ table }, index) => [table, results[index].count ?? 0])))
      setLoadState('ready')
    })
    return () => {
      active = false
    }
  }, [user.id, reloadKey])

  async function saveName(event) {
    event.preventDefault()
    const clean = name.trim()
    if (!clean) {
      setNameMessage({ tone: 'error', text: 'اكتب اسمًا لعرضه في ميورا.' })
      return
    }
    setNameBusy(true)
    setNameMessage({ tone: 'success', text: '' })
    const { error } = await supabase.from('profiles').update({ display_name: clean }).eq('id', user.id)
    setNameBusy(false)
    if (error) {
      setNameMessage({ tone: 'error', text: 'تعذّر حفظ الاسم. تحقق من الاتصال ثم حاول مرة أخرى.' })
      return
    }
    setSavedName(clean)
    setName(clean)
    setNameMessage({ tone: 'success', text: 'تم حفظ الاسم.' })
  }

  async function withdrawConsent() {
    setConsentBusy(true)
    setConsentError('')
    const { error } = await supabase.from('profiles').update({ assistant_consent_at: null }).eq('id', user.id)
    setConsentBusy(false)
    if (error) {
      setConsentError('تعذّر سحب الموافقة الآن. حاول مرة أخرى.')
      return
    }
    setConsentAt(null)
  }

  async function exportData() {
    setExporting(true)
    setExportError('')
    try {
      await downloadMyData(user)
    } catch {
      setExportError('تعذّر تجهيز ملف بياناتك الآن. تحقق من الاتصال ثم حاول مرة أخرى.')
    }
    setExporting(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const nameChanged = name.trim() !== savedName
  const shownName = savedName || user.email?.split('@')[0] || 'مستخدم ميورا'

  return (
    <>
      <title>ملفي الشخصي | ميورا</title>
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[61px] text-center md:pb-[90px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">ملفي الشخصي</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">أهلًا بك في مساحتك</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
            نظرة بسيطة على الخطوات التي سجّلتها أنت، من دون مقارنة أو ضغط.
          </p>
        </section>

        <div className="mx-auto flex max-w-[1074px] flex-col gap-[35px] px-6 pb-[105px]">
          {loadState === 'error' && (
            <div className={`${card} flex flex-col items-start gap-4`}>
              <p role="alert" className="text-base leading-7 text-(color:--color-page-error-text)">
                تعذّر تحميل بيانات ملفك الآن. تحقق من الاتصال ثم أعد المحاولة.
              </p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)} className={`${secondaryButton} sm:w-auto`}>
                أعد المحاولة
              </button>
            </div>
          )}

          <div className="flex flex-col items-stretch gap-[35px] lg:flex-row lg:items-center">
            <IdentityCard
              user={user}
              name={shownName}
              hasAvatar={Boolean(avatarAt)}
              onAvatarChange={setAvatarAt}
              onSignOut={signOut}
            />
            <ActivitySummary loadState={loadState} counts={counts} notes={notes} />
          </div>

          <nav aria-label="اختصارات">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map(({ to, label, icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`${panel} flex min-h-[61.6px] items-center gap-[9px] rounded-[15px] p-4 text-base leading-7 outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) hover:bg-(--color-page-guide-selected) motion-reduce:transition-none`}
                  >
                    <img src={`/icons/profile/${icon}.svg`} alt="" width="20" height="20" className="size-5" />
                    <span className="flex-1">{label}</span>
                    <img src="/icons/profile/chevron.svg" alt="" width="20" height="20" className="size-5 -scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {loadState === 'ready' && (
            <section aria-labelledby="settings-title" className="flex flex-col gap-6 pt-6">
              <h2 id="settings-title" className="text-[30px] leading-[1.3] tracking-[-0.02em]">
                إعدادات الحساب
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <section aria-labelledby="account-title" className={card}>
                  <h3 id="account-title" className="text-2xl leading-[1.3]">
                    حسابي
                  </h3>
                  <form onSubmit={saveName} noValidate className="mt-5 grid gap-2">
                    <label htmlFor="profile-name" className="text-base leading-7 font-bold">
                      الاسم المعروض
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="profile-name"
                        value={name}
                        maxLength={NAME_MAX}
                        autoComplete="nickname"
                        onChange={(event) => {
                          setName(event.target.value)
                          setNameMessage({ tone: 'success', text: '' })
                        }}
                        aria-invalid={nameMessage.tone === 'error' && nameMessage.text ? true : undefined}
                        aria-describedby="profile-name-hint"
                        className={inputClass}
                      />
                      <button type="submit" disabled={nameBusy || !nameChanged} className={saveButton}>
                        {nameBusy ? 'جارٍ الحفظ…' : 'حفظ الاسم'}
                      </button>
                    </div>
                    <p id="profile-name-hint" className="text-sm leading-6 text-(color:--color-page-muted)">
                      حتى {number.format(NAME_MAX)} حرفًا. لا يراه أحد غيرك.
                    </p>
                    <FormAlert tone={nameMessage.tone}>{nameMessage.text}</FormAlert>
                  </form>

                  <dl className="mt-6 grid gap-4 border-t border-(--color-page-border) pt-6 text-base leading-7">
                    <div>
                      <dt className="text-sm text-(color:--color-page-muted)">البريد الإلكتروني</dt>
                      <dd dir="ltr" className="text-right font-bold break-all">
                        {user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-(color:--color-page-muted)">طريقة الدخول</dt>
                      <dd className="font-bold">{providers.map((provider) => providerNames[provider] ?? provider).join(' + ') || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-(color:--color-page-muted)">تاريخ الانضمام</dt>
                      <dd className="font-bold">{user.created_at ? dateFormat.format(new Date(user.created_at)) : '—'}</dd>
                    </div>
                  </dl>
                </section>

                <section aria-labelledby="privacy-title" className={card}>
                  <h3 id="privacy-title" className="text-2xl leading-[1.3]">
                    الخصوصية وبياناتك
                  </h3>

                  <div className="mt-5 grid gap-2 border-b border-(--color-page-border) pb-6">
                    <h4 className="text-lg leading-7 font-bold">مساعد ميورا الذكي</h4>
                    {consentAt ? (
                      <>
                        <p className="text-base leading-7 text-(color:--color-page-muted)">
                          وافقت على إرسال رسائلك إلى Google Gemini (الخطة المجانية) بتاريخ {dateFormat.format(new Date(consentAt))}. يمكنك سحب الموافقة في أي وقت، وسيتوقف المساعد فورًا.
                        </p>
                        <div>
                          <button type="button" onClick={withdrawConsent} disabled={consentBusy} className={`${secondaryButton} sm:w-auto`}>
                            {consentBusy ? 'جارٍ السحب…' : 'سحب الموافقة وإيقاف المساعد'}
                          </button>
                        </div>
                        <FormAlert>{consentError}</FormAlert>
                      </>
                    ) : (
                      <p className="text-base leading-7 text-(color:--color-page-muted)">
                        المساعد غير مفعّل لحسابك. لا تُرسل أي رسائل لأي جهة خارجية. تظهر لك بطاقة الموافقة عند فتح{' '}
                        <Link to="/assistant" className={link}>
                          صفحة المساعد
                        </Link>
                        .
                      </p>
                    )}
                  </div>

                  <div className="mt-6 grid gap-2">
                    <h4 className="text-lg leading-7 font-bold">نسخة من بياناتك</h4>
                    <p className="text-base leading-7 text-(color:--color-page-muted)">
                      نزّل ملفًا واحدًا (JSON) فيه حسابك ومذكراتك وتقييماتك وتمارينك ومحادثاتك. يُجهَّز داخل متصفحك ولا يُرسل لأحد.
                    </p>
                    <div>
                      <button type="button" onClick={exportData} disabled={exporting} className={`${secondaryButton} sm:w-auto`}>
                        {exporting ? 'جارٍ تجهيز الملف…' : 'تنزيل بياناتي'}
                      </button>
                    </div>
                    <FormAlert>{exportError}</FormAlert>
                  </div>
                </section>
              </div>

              <section
                aria-labelledby="danger-title"
                className="rounded-(--radius-page-card) border border-(--color-page-error-text) bg-(--color-page-surface) p-6 md:p-8"
              >
                <h3 id="danger-title" className="text-2xl leading-[1.3] text-(color:--color-page-error-text)">
                  حذف الحساب
                </h3>
                <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
                  يحذف حسابك وكل بياناتك وصورتك نهائيًا، ولا يمكن استرجاعها. ننصحك بتنزيل نسخة من بياناتك قبل الحذف.
                </p>
                <div className="mt-5">
                  <button type="button" onClick={() => setDeleteOpen(true)} className={dangerButton}>
                    حذف حسابي نهائيًا…
                  </button>
                </div>
              </section>
            </section>
          )}
        </div>
      </main>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        user={user}
        hasPassword={hasPassword}
        onExport={exportData}
        exporting={exporting}
        exportError={exportError}
      />
    </>
  )
}

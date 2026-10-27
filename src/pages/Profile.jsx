import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { FormAlert, inputClass, secondaryButton } from '../components/auth/fields.jsx'
import DeleteAccountDialog from '../components/profile/DeleteAccountDialog.jsx'
import { downloadMyData } from '../lib/exportData.js'
import { supabase } from '../lib/supabase.js'

const NAME_MAX = 50

const stats = [
  { table: 'mood_logs', label: 'تسجيلات المزاج', to: '/' },
  { table: 'assessment_results', label: 'تقييمات ذاتية', to: '/assessment' },
  { table: 'exercise_sessions', label: 'تمارين أنهيتها', to: '/relaxation' },
  { table: 'journal_entries', label: 'ملاحظات في مذكراتي', to: '/journal' },
  { table: 'assistant_conversations', label: 'محادثات مع المساعد', to: '/assistant' },
]

const providerNames = { email: 'البريد وكلمة المرور', google: 'حساب Google' }

const number = new Intl.NumberFormat('ar-EG')
const dateFormat = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long', timeZone: 'Africa/Cairo' })

const card =
  'rounded-(--radius-page-card) border border-(--color-page-border) bg-(--color-page-surface) p-6 shadow-(--shadow-home-soft) md:p-8'
const saveButton =
  'flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:w-auto sm:shrink-0'
const dangerButton =
  'flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-error-text) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-error-text) outline-(--color-page-error-text) transition-colors duration-200 hover:bg-(--color-page-error-bg) motion-reduce:transition-none sm:w-auto'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState('loading')
  const [savedName, setSavedName] = useState('')
  const [name, setName] = useState('')
  const [consentAt, setConsentAt] = useState(null)
  const [counts, setCounts] = useState({})

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
      supabase.from('profiles').select('display_name, assistant_consent_at').eq('id', user.id).maybeSingle(),
      ...stats.map(({ table }) => supabase.from(table).select('id', { count: 'exact', head: true })),
    ]).then(([profile, ...results]) => {
      if (!active) return
      if (profile.error || results.some((result) => result.error)) {
        setLoadState('error')
        return
      }
      const current = profile.data?.display_name ?? ''
      setSavedName(current)
      setName(current)
      setConsentAt(profile.data?.assistant_consent_at ?? null)
      setCounts(Object.fromEntries(stats.map(({ table }, index) => [table, results[index].count ?? 0])))
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

  return (
    <>
      <title>ملفي الشخصي | ميورا</title>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 md:py-16">
        <header className="flex flex-col gap-2">
          <p className="text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">ملفي الشخصي</p>
          <h1 className="text-3xl leading-[1.3] md:text-4xl">{savedName ? `أهلًا بك، ${savedName}` : 'أهلًا بك في مساحتك'}</h1>
          <p className="text-base leading-7 text-(color:--color-page-muted)">هنا تدير بياناتك وخصوصيتك في ميورا.</p>
        </header>

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

        {loadState === 'loading' && (
          <p role="status" className="text-base leading-7 text-(color:--color-page-muted)">
            جارٍ تحميل بياناتك…
          </p>
        )}

        {loadState === 'ready' && (
          <>
            <section aria-labelledby="account-title" className={card}>
              <h2 id="account-title" className="text-2xl leading-[1.3]">
                حسابي
              </h2>
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
                  <button
                    type="submit"
                    disabled={nameBusy || !nameChanged}
                    className={saveButton}
                  >
                    {nameBusy ? 'جارٍ الحفظ…' : 'حفظ الاسم'}
                  </button>
                </div>
                <p id="profile-name-hint" className="text-sm leading-6 text-(color:--color-page-muted)">
                  حتى {number.format(NAME_MAX)} حرفًا. لا يراه أحد غيرك.
                </p>
                <FormAlert tone={nameMessage.tone}>{nameMessage.text}</FormAlert>
              </form>

              <dl className="mt-6 grid gap-4 border-t border-(--color-page-border) pt-6 text-base leading-7 sm:grid-cols-3">
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

            <section aria-labelledby="activity-title" className={card}>
              <h2 id="activity-title" className="text-2xl leading-[1.3]">
                ما تحتفظ به ميورا لك
              </h2>
              <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
                هذه أعداد ما حفظته في حسابك فقط. لا يراها أحد غيرك.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {stats.map(({ table, label, to }) => (
                  <li key={table}>
                    <Link
                      to={to}
                      className="flex items-center justify-between gap-3 rounded-[14px] border border-(--color-page-border) bg-(--color-page-bg) px-4 py-3 outline-(--color-page-primary) transition-colors hover:bg-(--color-page-guide-selected) motion-reduce:transition-none"
                    >
                      <span className="text-base leading-7">{label}</span>
                      <span className="text-xl leading-7 font-bold text-(color:--color-page-primary)">{number.format(counts[table] ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="privacy-title" className={card}>
              <h2 id="privacy-title" className="text-2xl leading-[1.3]">
                الخصوصية وبياناتك
              </h2>

              <div className="mt-5 grid gap-2 border-b border-(--color-page-border) pb-6">
                <h3 className="text-lg leading-7 font-bold">مساعد ميورا الذكي</h3>
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
                    <Link to="/assistant" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                      صفحة المساعد
                    </Link>
                    .
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-2">
                <h3 className="text-lg leading-7 font-bold">نسخة من بياناتك</h3>
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

            <section aria-labelledby="session-title" className={card}>
              <h2 id="session-title" className="text-2xl leading-[1.3]">
                الجلسة
              </h2>
              <div className="mt-5">
                <button type="button" onClick={signOut} className={`${secondaryButton} sm:w-auto`}>
                  تسجيل الخروج
                </button>
              </div>
            </section>

            <section
              aria-labelledby="danger-title"
              className="rounded-(--radius-page-card) border border-(--color-page-error-text) bg-(--color-page-surface) p-6 md:p-8"
            >
              <h2 id="danger-title" className="text-2xl leading-[1.3] text-(color:--color-page-error-text)">
                حذف الحساب
              </h2>
              <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
                يحذف حسابك وكل بياناتك نهائيًا، ولا يمكن استرجاعها. ننصحك بتنزيل نسخة من بياناتك قبل الحذف.
              </p>
              <div className="mt-5">
                <button type="button" onClick={() => setDeleteOpen(true)} className={dangerButton}>
                  حذف حسابي نهائيًا…
                </button>
              </div>
            </section>
          </>
        )}
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

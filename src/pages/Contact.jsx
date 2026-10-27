import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { FormAlert } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

const LIMITS = { name: 100, email: 254, subject: 150, message: 3000 }
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState(() => ({ name: '', email: user?.email ?? '', subject: '', message: '' }))
  const [trap, setTrap] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const accountEmail = user?.email ?? ''

  // The session may load after the first render: fill the email once if still empty.
  useEffect(() => {
    if (accountEmail) setForm((value) => (value.email ? value : { ...value, email: accountEmail }))
  }, [accountEmail])

  function update(field) {
    return (event) => {
      setForm((value) => ({ ...value, [field]: event.target.value }))
      setError('')
      setSent(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSent(false)
    const clean = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }
    if (!clean.name || !clean.subject || !clean.message) {
      setError('املأ كل الحقول قبل الإرسال.')
      return
    }
    if (!EMAIL.test(clean.email)) {
      setError('اكتب بريدًا إلكترونيًا صحيحًا لنرد عليك.')
      return
    }
    // Hidden field that only bots fill: pretend success, send nothing.
    if (trap) {
      setSent(true)
      return
    }
    if (!supabase) {
      setError('تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.')
      return
    }
    setSending(true)
    setError('')
    const { error: sendError } = await supabase.from('contact_messages').insert(clean)
    setSending(false)
    if (sendError) {
      setError(
        sendError.message?.includes('contact_rate_limited')
          ? 'وصلتنا رسائل كثيرة الآن. حاول مرة أخرى بعد قليل.'
          : 'تعذّر إرسال الرسالة. تحقق من الاتصال ثم حاول مرة أخرى.',
      )
      return
    }
    setForm((value) => ({ ...value, subject: '', message: '' }))
    setSent(true)
  }

  return (
    <>
      <title>تواصل معنا | ميورا</title>
      <meta name="description" content="شاركنا رأيك في ميورا لنحسّن المنصة." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">تواصل معنا</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">رأيك يساعدنا على التحسّن</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">اكتب لنا ملاحظتك أو سؤالك، وسيقرأها فريق ميورا ويرد عليك على بريدك.</p>
        </section>
        <section className="px-6 pt-[14px] pb-[105px]">
          <form id="contact-form" onSubmit={handleSubmit} noValidate className="relative mx-auto flex max-w-[600px] flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-name" className="text-base leading-7 font-bold">الاسم</label>
              <input id="contact-name" type="text" autoComplete="name" required value={form.name} onChange={update('name')} maxLength={LIMITS.name} className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary)" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-email" className="text-base leading-7 font-bold">البريد الإلكتروني</label>
              <input id="contact-email" type="email" dir="ltr" autoComplete="email" required value={form.email} onChange={update('email')} maxLength={LIMITS.email} className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary) text-right" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-subject" className="text-base leading-7 font-bold">الموضوع</label>
              <input id="contact-subject" type="text" required value={form.subject} onChange={update('subject')} maxLength={LIMITS.subject} className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary)" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-message" className="text-base leading-7 font-bold">الرسالة</label>
              <textarea id="contact-message" required value={form.message} onChange={update('message')} maxLength={LIMITS.message} className="h-[193.6px] w-full resize-y rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 py-3 text-base outline-(--color-page-primary)"></textarea>
            </div>
            <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
              <label htmlFor="contact-website">اترك هذا الحقل فارغًا</label>
              <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} />
            </div>
            <FormAlert>{error}</FormAlert>
            {sent && <FormAlert tone="success">وصلتنا رسالتك، شكرًا لك. سنرد عليك على بريدك في أقرب وقت.</FormAlert>}
            <button type="submit" disabled={sending} className="min-h-12 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 self-start rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-[10px] text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none">{sending ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}</button>
            <p className="text-base leading-7 text-(color:--color-page-muted)">
              هذا النموذج ليس للحالات العاجلة. إذا كنت في خطر الآن، اتصل بالإسعاف على <a href="tel:123" className="text-(color:--color-page-primary) underline underline-offset-4">123</a> أو راجع{' '}
              <Link to="/help#emergency" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أرقام الدعم</Link>.
            </p>
          </form>
        </section>
      </main>
    </>
  )
}

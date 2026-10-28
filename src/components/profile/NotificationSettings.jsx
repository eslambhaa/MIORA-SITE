import { useEffect, useState } from 'react'
import { EMAIL_LIVE } from '../../lib/notifications.js'
import { supabase } from '../../lib/supabase.js'

const DEFAULTS = { inapp_daily: true, inapp_weekly: true, email_daily: false, email_weekly: false, reminder_hour: 20 }
const HOURS = Array.from({ length: 17 }, (_, index) => index + 7)
const hourLabel = (hour) => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', hour12: true, timeZone: 'UTC' }).format(new Date(Date.UTC(2000, 0, 1, hour)))

function Toggle({ label, hint, checked, disabled, onChange }) {
  return (
    <label className={`flex items-start justify-between gap-4 py-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block text-base leading-7 font-bold">{label}</span>
        {hint && <span className="block text-[15px] leading-6 text-(color:--color-page-muted)">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-6 shrink-0 cursor-pointer accent-(--color-page-button) disabled:cursor-not-allowed" />
    </label>
  )
}

export default function NotificationSettings({ email, card }) {
  const [values, setValues] = useState(DEFAULTS)
  const [state, setState] = useState('loading') // loading | ready | error
  const [message, setMessage] = useState({ tone: '', text: '' })

  useEffect(() => {
    if (location.hash === '#notifications') document.getElementById('notifications')?.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    let ignore = false
    supabase
      .from('notification_settings')
      .select('inapp_daily, inapp_weekly, email_daily, email_weekly, reminder_hour')
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return
        if (error) return setState('error')
        setValues({ ...DEFAULTS, ...(data ?? {}) })
        setState('ready')
      })
    return () => {
      ignore = true
    }
  }, [])

  async function change(key, value) {
    const previous = values
    const next = { ...values, [key]: value }
    setValues(next)
    setMessage({ tone: '', text: '' })
    const { error } = await supabase.from('notification_settings').upsert(next, { onConflict: 'user_id' })
    if (error) {
      setValues(previous)
      setMessage({ tone: 'error', text: 'تعذّر حفظ الإعداد. حاول مرة أخرى.' })
    } else setMessage({ tone: 'success', text: 'تم حفظ إعداداتك.' })
  }

  const disabled = state !== 'ready'

  return (
    <section id="notifications" aria-labelledby="notifications-title" className={`${card} scroll-mt-28`}>
      <h3 id="notifications-title" className="text-2xl leading-[1.3]">
        الإشعارات والتذكيرات
      </h3>
      <p className="pt-2 text-base leading-7 text-(color:--color-page-muted)">
        تذكير هادئ بتسجيل شعورك إن لم تسجّله اليوم، وملخص أسبوعي يوم الجمعة فيه عدد الأيام التي سجّلت فيها. لا نقرأ مذكراتك ولا نستخدم محتواها.
      </p>
      {state === 'error' && <p role="alert" className="pt-3 text-base text-(color:--color-page-error-text)">تعذّر تحميل إعداداتك الآن.</p>}
      <div className="mt-4 divide-y divide-(--color-page-border)">
        <Toggle label="تذكير يومي داخل ميورا" hint="يظهر في أيقونة الإشعارات." checked={values.inapp_daily} disabled={disabled} onChange={(value) => change('inapp_daily', value)} />
        <Toggle label="ملخص أسبوعي داخل ميورا" checked={values.inapp_weekly} disabled={disabled} onChange={(value) => change('inapp_weekly', value)} />
        <Toggle
          label="تذكير يومي بالإيميل"
          hint={EMAIL_LIVE ? `يصل إلى ${email}. يمكنك إيقافه في أي وقت.` : 'سيتفعّل قريبًا.'}
          checked={values.email_daily}
          disabled={disabled || !EMAIL_LIVE}
          onChange={(value) => change('email_daily', value)}
        />
        <Toggle
          label="ملخص أسبوعي بالإيميل"
          hint={EMAIL_LIVE ? `يصل إلى ${email}. يمكنك إيقافه في أي وقت.` : 'سيتفعّل قريبًا.'}
          checked={values.email_weekly}
          disabled={disabled || !EMAIL_LIVE}
          onChange={(value) => change('email_weekly', value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="reminder-hour" className="text-base leading-7 font-bold">
          وقت التذكير اليومي (بتوقيت القاهرة)
        </label>
        <select
          id="reminder-hour"
          value={values.reminder_hour}
          disabled={disabled}
          onChange={(event) => change('reminder_hour', Number(event.target.value))}
          className="min-h-11 rounded-xl border border-(--color-page-input-border) bg-(--color-page-surface) px-3 text-base outline-(--color-page-primary)"
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hourLabel(hour)}
            </option>
          ))}
        </select>
      </div>
      <p role="status" className={`min-h-6 pt-3 text-[15px] ${message.tone === 'error' ? 'text-(color:--color-page-error-text)' : 'text-(color:--color-page-success-text)'}`}>
        {message.text}
      </p>
    </section>
  )
}

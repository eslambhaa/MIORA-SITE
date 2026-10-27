import { useState } from 'react'
import { Link } from 'react-router'
import { authErrorMessage } from '../auth/errors.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import { Field, FormAlert, primaryButton, textLink } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

export default function ForgotPassword() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('الخدمة غير مهيأة بعد.')
      return
    }
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    setBusy(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    if (resetError && (resetError.status === 429 || resetError.status === 0)) {
      setError(authErrorMessage(resetError))
      return
    }
    setSent(true)
  }

  return (
    <>
      <title>استعادة كلمة المرور | ميورا</title>
      <AuthCard title="نسيت كلمة المرور؟" subtitle="اكتب بريدك وسنرسل لك رابطًا لتعيين كلمة مرور جديدة.">
        {sent ? (
          <div className="mt-6 flex flex-col gap-4 text-center">
            <FormAlert tone="success">إذا كان البريد مسجّلًا لدينا، فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة. افتحه من نفس المتصفح.</FormAlert>
            <Link to="/login" className={textLink}>
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[14px]">
            <Field id="forgot-email" name="email" type="email" label="البريد الإلكتروني" placeholder="name@example.com" dir="ltr" className="text-right" autoComplete="email" required />
            <FormAlert>{error}</FormAlert>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? 'جارٍ الإرسال…' : 'أرسل رابط الاستعادة'}
            </button>
            <p className="mt-2 text-center text-base leading-7">
              <Link to="/login" className={textLink}>
                العودة إلى تسجيل الدخول
              </Link>
            </p>
          </form>
        )}
      </AuthCard>
    </>
  )
}

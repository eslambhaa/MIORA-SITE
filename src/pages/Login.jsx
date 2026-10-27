import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { authErrorMessage } from '../auth/errors.js'
import { safeRedirect } from '../auth/safeRedirect.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import { Field, FormAlert, PasswordField, primaryButton, textLink } from '../components/auth/fields.jsx'
import GoogleButton from '../components/auth/GoogleButton.jsx'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('الخدمة غير مهيأة بعد.')
      return
    }
    const form = new FormData(event.currentTarget)
    setBusy(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
    })
    setBusy(false)
    if (signInError) {
      setError(authErrorMessage(signInError))
      return
    }
    navigate(safeRedirect(params.get('next')), { replace: true })
  }

  return (
    <>
      <title>تسجيل الدخول | ميورا</title>
      <AuthCard title="مرحبًا بعودتك">
        <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[14px]" noValidate={false}>
          {params.get('reset') === '1' && <FormAlert tone="success">تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.</FormAlert>}
          {params.get('deleted') === '1' && <FormAlert tone="success">تم حذف حسابك وكل بياناتك نهائيًا. يمكنك إنشاء حساب جديد في أي وقت.</FormAlert>}
          <Field id="login-email" name="email" type="email" label="البريد الإلكتروني" placeholder="name@example.com" dir="ltr" className="text-right" autoComplete="email" required />
          <PasswordField id="login-password" name="password" label="كلمة المرور" placeholder="٨ أحرف على الأقل" autoComplete="current-password" required minLength={8} maxLength={72}>
            <Link to="/forgot-password" className={`text-sm ${textLink}`}>
              نسيت كلمة المرور؟
            </Link>
          </PasswordField>
          <FormAlert>{error}</FormAlert>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
          </button>
        </form>
        <GoogleButton />
        <p className="mt-[18px] text-center text-base leading-7">
          <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className={textLink}>
            ليس لديك حساب؟ أنشئ حسابًا
          </Link>
        </p>
      </AuthCard>
    </>
  )
}

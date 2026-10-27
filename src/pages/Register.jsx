import { useState } from 'react'
import { Link } from 'react-router'
import { authErrorMessage } from '../auth/errors.js'
import { passwordHint, passwordProblem } from '../auth/password.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import { Field, FormAlert, PasswordField, primaryButton, textLink } from '../components/auth/fields.jsx'
import GoogleButton from '../components/auth/GoogleButton.jsx'
import { supabase } from '../lib/supabase.js'

export default function Register() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('الخدمة غير مهيأة بعد.')
      return
    }
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    if (!name) {
      setError('اكتب اسمك الأول.')
      return
    }
    const problem = passwordProblem(password)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: { display_name: name, age_confirmed: 'true', terms_accepted: 'true' },
      },
    })
    setBusy(false)
    if (signUpError && signUpError.code !== 'user_already_exists') {
      setError(authErrorMessage(signUpError))
      return
    }
    if (data?.session) return
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <>
        <title>تأكيد البريد | ميورا</title>
        <AuthCard title="تحقق من بريدك">
          <div className="mt-6 flex flex-col gap-4 text-center text-lg leading-8">
            <p>
              إذا كان البريد <span dir="ltr" className="font-bold">{sentTo}</span> صالحًا وغير مسجّل من قبل، فستصلك رسالة فيها رابط لتأكيد حسابك.
            </p>
            <p className="text-base text-(color:--color-page-muted)">افتح الرابط من نفس المتصفح. إن لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها.</p>
            <Link to="/login" className={textLink}>
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </AuthCard>
      </>
    )
  }

  return (
    <>
      <title>إنشاء حساب | ميورا</title>
      <AuthCard title="أنشئ مساحتك" subtitle="ابدأ بخطوات بسيطة، ومن دون معلومات حساسة.">
        <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[14px]">
          <Field id="register-name" name="name" type="text" label="الاسم" placeholder="اسمك الأول" autoComplete="given-name" required maxLength={50} />
          <Field id="register-email" name="email" type="email" label="البريد الإلكتروني" placeholder="name@example.com" dir="ltr" className="text-right" autoComplete="email" required />
          <PasswordField id="register-password" name="password" label="كلمة المرور" placeholder="٨ أحرف على الأقل" autoComplete="new-password" required minLength={8} maxLength={72} hint={passwordHint} />
          <div className="flex items-start gap-3">
            <input id="register-consent" name="consent" type="checkbox" required className="mt-1.5 size-5 shrink-0 cursor-pointer accent-(--color-page-button) outline-(--color-page-primary)" />
            <label htmlFor="register-consent" className="text-base leading-7">
              أؤكد أن عمري 18 عامًا أو أكثر، وأوافق على{' '}
              <Link to="/terms" className={textLink}>شروط الاستخدام</Link> و<Link to="/privacy" className={textLink}>سياسة الخصوصية</Link>.
            </label>
          </div>
          <FormAlert>{error}</FormAlert>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
          </button>
        </form>
        <GoogleButton />
        <p className="mt-[18px] text-center text-base leading-7">
          <Link to="/login" className={textLink}>
            لديك حساب؟ سجّل الدخول
          </Link>
        </p>
      </AuthCard>
    </>
  )
}

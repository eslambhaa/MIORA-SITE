import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { authErrorMessage } from '../auth/errors.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import { FormAlert, PasswordField, primaryButton, textLink } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

export default function ResetPassword() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }
    setBusy(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setBusy(false)
      setError(authErrorMessage(updateError))
      return
    }
    await supabase.auth.signOut({ scope: 'others' })
    setBusy(false)
    navigate('/profile', { replace: true })
  }

  return (
    <>
      <title>كلمة مرور جديدة | ميورا</title>
      <AuthCard title="كلمة مرور جديدة">
        {loading ? (
          <p role="status" className="mt-6 text-center text-lg text-(color:--color-page-muted)">جارٍ التحقق من الرابط…</p>
        ) : !user ? (
          <div className="mt-6 flex flex-col gap-4 text-center">
            <FormAlert>الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.</FormAlert>
            <Link to="/forgot-password" className={textLink}>
              طلب رابط جديد
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[14px]">
            <PasswordField id="reset-password" name="password" label="كلمة المرور الجديدة" placeholder="٨ أحرف على الأقل" autoComplete="new-password" required minLength={8} maxLength={72} />
            <PasswordField id="reset-confirm" name="confirm" label="تأكيد كلمة المرور" autoComplete="new-password" required minLength={8} maxLength={72} />
            <FormAlert>{error}</FormAlert>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}
            </button>
          </form>
        )}
      </AuthCard>
    </>
  )
}

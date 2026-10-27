import { useState } from 'react'
import { Link } from 'react-router'
import { authErrorMessage } from '../../auth/errors.js'
import { supabase } from '../../lib/supabase.js'
import { FormAlert, secondaryButton, textLink } from './fields.jsx'

export default function GoogleButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function signIn() {
    setError('')
    if (!supabase) {
      setError('الخدمة غير مهيأة بعد.')
      return
    }
    setBusy(true)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profile` },
    })
    if (oauthError) {
      setError(authErrorMessage(oauthError))
      setBusy(false)
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm text-(color:--color-page-muted)">
        <span aria-hidden="true" className="h-px flex-1 bg-(--color-page-border)" />
        أو
        <span aria-hidden="true" className="h-px flex-1 bg-(--color-page-border)" />
      </div>
      <button type="button" onClick={signIn} disabled={busy} className={secondaryButton}>
        {busy ? 'جارٍ التحويل…' : 'المتابعة باستخدام حساب Google'}
      </button>
      <p className="text-center text-sm leading-6 text-(color:--color-page-muted)">
        بالمتابعة تؤكد أن عمرك 18 عامًا أو أكثر، وتوافق على{' '}
        <Link to="/terms" className={textLink}>شروط الاستخدام</Link> و<Link to="/privacy" className={textLink}>سياسة الخصوصية</Link>.
      </p>
      <FormAlert>{error}</FormAlert>
    </div>
  )
}

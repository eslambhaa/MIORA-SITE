import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { secondaryButton } from '../components/auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setFailed(true)
        else setName(data?.display_name ?? '')
      })
    return () => {
      active = false
    }
  }, [user.id])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <>
      <title>ملفي الشخصي | ميورا</title>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">ملفي الشخصي</p>
        <h1 className="text-4xl leading-[1.3]">{name ? `أهلًا بك، ${name}` : 'أهلًا بك في مساحتك'}</h1>
        <p dir="ltr" className="text-base text-(color:--color-page-muted)">{user.email}</p>
        {failed && <p role="alert" className="text-base text-(color:--color-page-error-text)">تعذّر تحميل بيانات ملفك الآن.</p>}
        <p className="max-w-xl text-lg leading-8 text-(color:--color-page-muted)">صفحة الملف الكاملة تُبنى في المرحلة 9.</p>
        <div className="w-full max-w-xs">
          <button type="button" onClick={signOut} className={secondaryButton}>
            تسجيل الخروج
          </button>
        </div>
      </main>
    </>
  )
}

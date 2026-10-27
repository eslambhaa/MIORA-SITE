import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { authErrorMessage } from '../../auth/errors.js'
import { supabase } from '../../lib/supabase.js'
import { FormAlert, inputClass } from '../auth/fields.jsx'

const PHRASE = 'حذف حسابي'
const CONFIRMATION = 'DELETE_MY_ACCOUNT'

const pill =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-base leading-7 font-bold outline-(--color-page-primary) transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none'

// Permanent account deletion. Two checks before anything is sent:
// 1) the user types the confirmation phrase, 2) password accounts re-enter their password.
// The real deletion happens in the "delete-account" Edge Function, which deletes only
// the account of the signed-in user (cascades remove every row).
export default function DeleteAccountDialog({ open, onClose, user, hasPassword, onExport, exporting, exportError }) {
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const phraseRef = useRef(null)
  const [phrase, setPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setPhrase('')
      setPassword('')
      setError('')
      dialog.showModal()
      phraseRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function requestClose() {
    if (!busy) onClose()
  }

  const phraseOk = phrase.trim() === PHRASE
  const ready = phraseOk && (!hasPassword || password.length > 0)

  async function submit(event) {
    event.preventDefault()
    if (!ready || busy) return
    if (!supabase) {
      setError('تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.')
      return
    }
    setBusy(true)
    setError('')

    if (hasPassword) {
      const { error: passwordError } = await supabase.auth.signInWithPassword({ email: user.email, password })
      if (passwordError) {
        setBusy(false)
        setPassword('')
        setError(
          passwordError.code === 'invalid_credentials'
            ? 'كلمة المرور غير صحيحة. لم يُحذف شيء.'
            : authErrorMessage(passwordError),
        )
        return
      }
    }

    const { error: invokeError } = await supabase.functions.invoke('delete-account', {
      body: { confirm: CONFIRMATION },
    })
    if (invokeError) {
      setBusy(false)
      setError('تعذّر حذف الحساب الآن. لم يُحذف شيء، حاول مرة أخرى بعد قليل.')
      return
    }

    // The user no longer exists on the server: clear the local session only.
    await supabase.auth.signOut({ scope: 'local' })
    navigate('/login?deleted=1', { replace: true })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClose={() => open && !busy && onClose()}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose()
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(640px,calc(100%-1.5rem))] overflow-y-auto rounded-[28px] bg-(--color-page-surface) p-5 text-(color:--color-page-heading) shadow-(--shadow-page-guide) backdrop:bg-(--color-page-guide-backdrop) md:p-9"
    >
      <form onSubmit={submit} noValidate>
        <p className="text-sm leading-6 font-bold text-(color:--color-page-error-text)">منطقة حساسة</p>
        <h2 id="delete-dialog-title" className="pt-1 text-[26px] leading-[1.3] tracking-[-0.02em] md:text-[30px]">
          حذف الحساب نهائيًا
        </h2>

        <p className="pt-4 text-base leading-7 text-(color:--color-page-muted)">
          سيُحذف حسابك وكل ما فيه فورًا، ولا يمكن التراجع أو استرجاع أي شيء:
        </p>
        <ul className="list-disc space-y-1 ps-6 pt-2 text-base leading-7">
          <li>الاسم والبريد الإلكتروني وبيانات الدخول.</li>
          <li>مذكراتك وكل ملاحظاتك.</li>
          <li>تسجيلات المزاج ونتائج التقييمات وتمارين الاسترخاء.</li>
          <li>كل محادثاتك مع مساعد ميورا.</li>
        </ul>

        <button
          type="button"
          onClick={onExport}
          disabled={exporting || busy}
          className={`${pill} mt-5 border border-(--color-page-button) text-(color:--color-page-primary) hover:bg-(--color-page-guide-selected)`}
        >
          {exporting ? 'جارٍ تجهيز الملف…' : 'نزّل نسخة من بياناتك أولًا'}
        </button>

        <div className="grid gap-5 pt-6">
          <div className="grid gap-2">
            <label htmlFor="delete-phrase" className="text-base leading-7 font-bold">
              للتأكيد، اكتب: <span className="text-(color:--color-page-error-text)">{PHRASE}</span>
            </label>
            <input
              id="delete-phrase"
              ref={phraseRef}
              value={phrase}
              onChange={(event) => {
                setPhrase(event.target.value)
                setError('')
              }}
              autoComplete="off"
              className={inputClass}
            />
          </div>

          {hasPassword && (
            <div className="grid gap-2">
              <label htmlFor="delete-password" className="text-base leading-7 font-bold">
                كلمة المرور الحالية
              </label>
              <input
                id="delete-password"
                type="password"
                dir="ltr"
                value={password}
                maxLength={72}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                autoComplete="current-password"
                className={`${inputClass} text-right`}
              />
            </div>
          )}

          <FormAlert>{error || exportError}</FormAlert>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-7">
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className={`${pill} border border-(--color-page-border) text-(color:--color-page-heading) hover:bg-(--color-page-bg)`}
          >
            إلغاء، احتفظ بحسابي
          </button>
          <button
            type="submit"
            disabled={!ready || busy}
            className={`${pill} bg-(--color-page-error-text) text-white hover:opacity-90`}
          >
            {busy ? 'جارٍ الحذف…' : 'احذف حسابي نهائيًا'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

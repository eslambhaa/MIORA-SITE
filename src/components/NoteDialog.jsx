import { useEffect, useRef, useState } from 'react'
import { FormAlert } from './auth/fields.jsx'
import { supabase } from '../lib/supabase.js'

const TITLE_MAX = 120
const BODY_MAX = 10000

const fieldClass =
  'w-full rounded-[14px] border border-(--color-page-border) bg-(--color-page-bg) px-4 text-base leading-7 outline-(--color-page-primary) placeholder:text-(color:--color-page-muted) aria-invalid:border-(--color-page-error-text)'
const pill =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-base leading-7 font-bold outline-(--color-page-primary) transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none'

// "New note" popup (Figma). Saves to the signed-in user's journal (RLS: own rows only).
export default function NoteDialog({ open, onClose, onSaved }) {
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const dirty = title.trim() !== '' || body.trim() !== ''

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setTitle('')
      setBody('')
      setError('')
      setConfirmDiscard(false)
      dialog.showModal()
      titleRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function requestClose() {
    if (saving) return
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    onClose()
  }

  async function save(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      setError('اكتب عنوانًا قصيرًا للملاحظة.')
      titleRef.current?.focus()
      return
    }
    if (!supabase) {
      setError('تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.')
      return
    }
    setSaving(true)
    setError('')
    const { error: saveError } = await supabase.from('journal_entries').insert({ title: cleanTitle, body })
    setSaving(false)
    if (saveError) {
      setError('تعذّر حفظ الملاحظة. تحقق من الاتصال ثم حاول مرة أخرى.')
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="note-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClose={() => open && onClose()}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose()
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(820px,calc(100%-1.5rem))] overflow-y-auto rounded-[28px] bg-(--color-page-surface) p-5 text-(color:--color-page-heading) shadow-(--shadow-page-guide) backdrop:bg-(--color-page-guide-backdrop) md:p-9"
    >
      <form onSubmit={save} noValidate>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm leading-6 text-(color:--color-page-primary)">ملاحظة جديدة</p>
            <h2 id="note-dialog-title" className="pt-1 text-[26px] leading-[1.3] tracking-[-0.02em] md:text-[32px]">
              ما الذي يدور في بالك؟
            </h2>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={requestClose}
            className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border border-(--color-page-border) outline-(--color-page-primary)"
          >
            <img src="/icons/guide/close.svg" alt="" width="20" height="20" />
          </button>
        </div>

        <div className="grid gap-6 pt-7">
          <div className="grid gap-2">
            <label htmlFor="note-title" className="text-base leading-7 font-bold">
              العنوان
            </label>
            <input
              id="note-title"
              ref={titleRef}
              value={title}
              maxLength={TITLE_MAX}
              autoComplete="off"
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
                setConfirmDiscard(false)
              }}
              aria-invalid={error && !title.trim() ? true : undefined}
              placeholder="عنوان بسيط يساعدك تتذكر"
              className={`${fieldClass} h-[60px]`}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="note-body" className="text-base leading-7 font-bold">
              تأمّلك
            </label>
            <textarea
              id="note-body"
              value={body}
              maxLength={BODY_MAX}
              onChange={(event) => {
                setBody(event.target.value)
                setConfirmDiscard(false)
              }}
              placeholder="اكتب بحرية… هذه المساحة لك."
              className={`${fieldClass} min-h-[220px] resize-y py-3 leading-8 md:min-h-[300px]`}
            />
          </div>
          <FormAlert>{error}</FormAlert>
          {confirmDiscard && (
            <p role="alert" className="rounded-[14px] bg-(--color-page-card) px-4 py-3 text-base leading-7">
              لديك كتابة لم تُحفظ. اضغط "تجاهل" للخروج بدون حفظ.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-7">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className={`${pill} border border-(--color-page-border) bg-(--color-page-surface) text-(color:--color-page-primary)`}
          >
            {confirmDiscard ? 'تجاهل' : 'إلغاء'}
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className={`${pill} bg-(--color-page-button) text-white shadow-(--shadow-page-button) hover:opacity-90`}
          >
            {saving ? 'جارٍ الحفظ…' : 'حفظ الملاحظة'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

import { useState } from 'react'

export const inputClass =
  'h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-[14px] text-base outline-(--color-page-primary) placeholder:text-(color:--color-page-muted) aria-invalid:border-(--color-page-error-text)'

export const primaryButton =
  'mt-[10px] flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'

export const secondaryButton =
  'flex min-h-[49.6px] w-full cursor-pointer items-center justify-center rounded-(--radius-page-button) border border-(--color-page-button) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) transition-colors duration-200 hover:bg-(--color-page-guide-selected) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'

export const textLink =
  'text-(color:--color-page-primary) underline-offset-4 outline-(--color-page-primary) hover:underline'

export function Field({ id, label, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base leading-7 font-bold">
        {label}
      </label>
      <input id={id} className={`${inputClass} ${className}`} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-sm leading-6 text-(color:--color-page-muted)">
          {hint}
        </p>
      )}
    </div>
  )
}

export function PasswordField({ id, label, hint, children, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-base leading-7 font-bold">
          {label}
        </label>
        {children}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          dir="ltr"
          className={`${inputClass} pe-[14px] ps-12 text-right`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 left-1 my-auto grid size-11 cursor-pointer place-items-center rounded-full text-(color:--color-page-muted) outline-(--color-page-primary)"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm leading-6 text-(color:--color-page-muted)">
          {hint}
        </p>
      )}
    </div>
  )
}

export function FormAlert({ tone = 'error', children }) {
  if (!children) return null
  const colors =
    tone === 'success'
      ? 'bg-(--color-page-success-bg) text-(color:--color-page-success-text)'
      : 'bg-(--color-page-error-bg) text-(color:--color-page-error-text)'
  return (
    <p role={tone === 'success' ? 'status' : 'alert'} className={`rounded-(--radius-page-input) px-4 py-3 text-base leading-7 ${colors}`}>
      {children}
    </p>
  )
}

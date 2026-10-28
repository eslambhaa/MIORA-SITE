import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { markAllRead, useNotifications } from '../../lib/notifications.js'
import NotificationItem from './NotificationItem.jsx'

const number = new Intl.NumberFormat('ar-EG')
const PREVIEW = 5

// The bell is in the header for everyone: guests see the site's announcements, members also see their own reminders.
export default function NotificationBell({ buttonClass }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const { pathname } = useLocation()
  const { items, unread, status, signedIn, refresh } = useNotifications()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  function toggle() {
    if (!open) refresh()
    setOpen((value) => !value)
  }

  const label = unread ? `الإشعارات، ${number.format(unread)} غير مقروءة` : 'الإشعارات'

  return (
    <div ref={wrapRef} className="relative sm:static">
      <button ref={buttonRef} type="button" aria-label={label} aria-expanded={open} aria-controls="notifications-panel" onClick={toggle} className={`${buttonClass} relative`}>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span aria-hidden="true" className="absolute -end-1 -top-1 grid min-w-[20px] place-items-center rounded-full bg-(--color-page-error-text) px-1 text-[11px] leading-5 font-bold text-white">
            {unread > 9 ? '٩+' : number.format(unread)}
          </span>
        )}
      </button>
      {open && (
        <div
          id="notifications-panel"
          role="region"
          aria-label="الإشعارات"
          className="fixed inset-x-4 top-[104px] z-50 max-h-[70vh] overflow-y-auto rounded-3xl bg-(--color-page-surface) p-3 shadow-(--shadow-page-header) ring-1 ring-(--color-page-border) sm:absolute sm:inset-x-auto sm:end-4 sm:top-[calc(100%-4px)] sm:w-[400px]"
        >
          <div className="flex items-center justify-between gap-3 px-3 pt-1 pb-2">
            <h2 className="text-lg leading-7 font-bold">الإشعارات</h2>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="cursor-pointer rounded-full px-3 py-1 text-sm font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:bg-(--color-page-guide-selected)">
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          {status === 'loading' && items.length === 0 && <p role="status" className="px-3 py-6 text-center text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && items.length === 0 && <p role="status" className="px-3 py-6 text-center text-base text-(color:--color-page-muted)">تعذّر تحميل الإشعارات الآن.</p>}
          {status === 'ready' && items.length === 0 && <p className="px-3 py-6 text-center text-base text-(color:--color-page-muted)">لا توجد إشعارات حاليًا.</p>}
          {items.length > 0 && (
            <ul>
              {items.slice(0, PREVIEW).map((item) => (
                <NotificationItem key={item.key} item={item} onNavigate={() => setOpen(false)} />
              ))}
            </ul>
          )}
          {!signedIn && (
            <p className="mx-3 mt-2 rounded-2xl bg-(--color-page-card) p-3 text-[15px] leading-6 text-(color:--color-page-muted)">
              <Link to="/login?next=/notifications" className="font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                سجّل الدخول
              </Link>{' '}
              لتصلك تذكيرات بتسجيل شعورك وملخص أسبوعي.
            </p>
          )}
          <div className="px-3 pt-3 pb-1 text-center">
            <Link to="/notifications" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
              عرض كل الإشعارات
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

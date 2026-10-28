import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useAvatar } from '../lib/avatarStore.js'
import NotificationBell from './notifications/NotificationBell.jsx'

const links = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/assistant', label: 'المساعد الذكي' },
  { to: '/content', label: 'المحتوى التوعوي' },
  { to: '/addiction', label: 'الوعي بالإدمان' },
  { to: '/journal', label: 'مذكراتي' },
]

const iconButton =
  'grid size-11 cursor-pointer place-items-center rounded-full border border-(--color-page-border) text-(color:--color-page-heading) outline-(--color-page-primary)'

const navLink =
  'block rounded-full px-[13px] py-[9px] text-base leading-7 text-(color:--color-page-muted) outline-(--color-page-primary) transition-colors duration-200 hover:bg-(--color-page-nav-active) hover:text-(color:--color-page-surface) focus-visible:bg-(--color-page-nav-active) focus-visible:text-(color:--color-page-surface) aria-[current=page]:bg-(--color-page-nav-active) aria-[current=page]:text-(color:--color-page-surface) motion-reduce:transition-none'

const menuLink =
  'flex h-12 items-center rounded-(--radius-page-menu-item) px-4 text-base text-(color:--color-page-muted) outline-(--color-page-primary) transition-colors duration-200 hover:bg-(--color-page-nav-active) hover:text-(color:--color-page-surface) focus-visible:bg-(--color-page-nav-active) focus-visible:text-(color:--color-page-surface) aria-[current=page]:bg-(--color-page-nav-active) aria-[current=page]:text-(color:--color-page-surface) motion-reduce:transition-none'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()
  const avatar = useAvatar()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="relative z-50 px-4 py-5 md:sticky md:top-0">
      <nav
        aria-label="التنقل الرئيسي"
        className="mx-auto grid min-h-[72px] max-w-[1050px] grid-cols-[auto_1fr_auto] items-center gap-[22px] rounded-full px-4 py-[7px] shadow-(--shadow-page-header) backdrop-blur-[18px] lg:grid-cols-[96px_1fr_96px]"
      >
        <Link
          to="/"
          className="flex h-[58px] w-[72px] items-center justify-center justify-self-start rounded-(--radius-page-logo) px-2 py-0.5 outline-(--color-page-primary)"
        >
          <img src="/images/logo-header.webp" alt="ميورا" width="54" height="54" fetchPriority="high" className="size-[54px] object-contain" />
        </Link>
        <ul className="hidden items-center justify-center gap-1.5 lg:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={navLink}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <NotificationBell buttonClass={iconButton} />
          <Link to={user ? '/profile' : '/login'} aria-label={user ? 'ملفي الشخصي' : 'تسجيل الدخول'} className={`${iconButton} overflow-hidden`}>
            {avatar ? (
              <img src={avatar} alt="" width="44" height="44" className="size-full object-cover" />
            ) : (
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.3333 6.66667C13.3333 8.50762 11.8409 10 10 10C8.15905 10 6.66667 8.50762 6.66667 6.66667C6.66667 4.82572 8.15905 3.33333 10 3.33333C11.8409 3.33333 13.3333 4.82572 13.3333 6.66667Z" />
                <path d="M3.33333 18.3333C3.33333 16.5652 4.03571 14.8695 5.28595 13.6193C6.5362 12.369 8.23189 11.6667 10 11.6667C11.7681 11.6667 13.4638 12.369 14.714 13.6193C15.9643 14.8695 16.6667 16.5652 16.6667 18.3333" />
              </svg>
            )}
          </Link>
          <button
            type="button"
            aria-label="القائمة"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={`${iconButton} lg:hidden`}
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={`absolute inset-x-4 top-full rounded-(--radius-page-menu) bg-(--color-page-surface) p-2 shadow-(--shadow-page-header) lg:hidden ${menuOpen ? 'block' : 'hidden'}`}
      >
        <ul className="flex flex-col">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={menuLink}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

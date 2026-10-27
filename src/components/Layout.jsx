import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Pages that link to a section (#emergency, #breathing) scroll there themselves.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-(--color-page-bg) text-(color:--color-page-heading) antialiased">
      <Header />
      <Outlet />
      {pathname !== '/assistant' && <Footer />}
    </div>
  )
}

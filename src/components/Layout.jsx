import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import PageLoader from './ui/PageLoader.jsx'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Pages that link to a section (#emergency, #breathing) scroll there themselves.
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-(--color-page-bg) text-(color:--color-page-heading) antialiased">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      {pathname !== '/assistant' && <Footer />}
    </div>
  )
}

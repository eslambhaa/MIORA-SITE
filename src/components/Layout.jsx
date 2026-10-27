import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-(--color-page-bg) text-(color:--color-page-heading) antialiased">
      <Header />
      <Outlet />
      {pathname !== '/assistant' && <Footer />}
    </div>
  )
}

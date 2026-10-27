import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthProvider.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p role="status" className="text-lg text-(color:--color-page-muted)">جارٍ التحقق من الجلسة…</p>
      </main>
    )
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return children
}

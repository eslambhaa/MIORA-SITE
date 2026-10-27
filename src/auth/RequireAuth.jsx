import { Navigate, useLocation } from 'react-router'
import PageLoader from '../components/ui/PageLoader.jsx'
import { useAuth } from './AuthProvider.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader label="جارٍ التحقق من الجلسة…" />
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return children
}

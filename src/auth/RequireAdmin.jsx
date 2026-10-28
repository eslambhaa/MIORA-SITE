import { Navigate, useLocation } from 'react-router'
import PageLoader from '../components/ui/PageLoader.jsx'
import NotFound from '../pages/NotFound.jsx'
import { useAuth } from './AuthProvider.jsx'
import { useIsAdmin } from './useIsAdmin.js'

// People who are not admins see the ordinary "page not found", so the dashboard is not advertised.
export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  const status = useIsAdmin()
  const location = useLocation()

  if (loading || status === 'loading') return <PageLoader label="جارٍ التحقق من الصلاحية…" />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (status === 'error') {
    return (
      <main className="grid flex-1 place-items-center px-6 py-24 text-center">
        <p role="status" className="text-lg text-(color:--color-page-muted)">تعذّر التحقق من الصلاحية الآن. حاول مرة أخرى بعد قليل.</p>
      </main>
    )
  }
  return status === 'yes' ? children : <NotFound />
}

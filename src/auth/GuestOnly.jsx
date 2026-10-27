import { Navigate, useSearchParams } from 'react-router'
import { useAuth } from './AuthProvider.jsx'
import { safeRedirect } from './safeRedirect.js'

export default function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()

  if (!loading && user) return <Navigate to={safeRedirect(params.get('next'))} replace />
  return children
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-brand-navy">Cargando...</div>
  return isAuthenticated ? <Outlet /> : <Navigate to="/users/login" replace state={{ from: location.pathname }} />
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

interface ProtectedRouteProps {
  requiredRole?: string
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-brand-navy">Cargando...</div>

  if (!isAuthenticated) {
    return <Navigate to="/users/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

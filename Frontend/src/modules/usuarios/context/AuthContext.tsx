import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { tokenManager } from '../services/tokenManager'
import type { Usuario } from '../types/usuario.types'

interface AuthContextValue {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    if (!tokenManager.isValid()) {
      tokenManager.clear()
      setUser(null)
      return
    }
    try {
      setUser(await authService.getCurrentUser())
    } catch {
      tokenManager.clear()
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { accessToken } = await authService.login(email, password)
    tokenManager.set(accessToken)
    await refreshUser()
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

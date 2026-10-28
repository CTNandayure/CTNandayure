import { AUTH_TOKEN_KEY } from '../utils/constants'

function storage() {
  return window.localStorage
}

export const tokenManager = {
  get() {
    return storage().getItem(AUTH_TOKEN_KEY)
  },
  set(token: string) {
    storage().setItem(AUTH_TOKEN_KEY, token)
  },
  clear() {
    storage().removeItem(AUTH_TOKEN_KEY)
  },
  isValid(token?: string) {
    token = token ?? storage().getItem(AUTH_TOKEN_KEY) ?? undefined
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number }
      return !payload.exp || payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  },
}

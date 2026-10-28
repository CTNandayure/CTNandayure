import { API_URL } from '../../../content/api'
import { tokenManager } from './tokenManager'
import type { LoginResponse, User } from '../types/user.types'

type RequestOptions = RequestInit & { auth?: boolean }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (options.auth !== false) {
    const token = tokenManager.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message
    throw new Error(message || `Error del servidor (${response.status})`)
  }
  return body as T
}

export const authService = {
  async login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) })
  },
  async getCurrentUser() {
    return request<User>('/auth/me')
  },
  async forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', { method: 'POST', auth: false, body: JSON.stringify({ email }) })
  },
  async resetPassword(token: string, password: string) {
    return request<User>('/auth/reset-password', { method: 'POST', auth: false, body: JSON.stringify({ token, password }) })
  },
  async activateAccount(token: string, password: string) {
    return request<User>('/auth/activate', { method: 'POST', auth: false, body: JSON.stringify({ token, password }) })
  },
  async resendActivation(email: string) {
    return request<{ message: string }>('/auth/resend-activation', { method: 'POST', auth: false, body: JSON.stringify({ email }) })
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return request<User>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
  },
  logout() {
    tokenManager.clear()
  },
}

export type { RequestOptions }

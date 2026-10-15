import { API_URL } from '../../../content/api'
import { tokenManager } from './tokenManager'

export type UserAdminRole = 'ADMIN' | 'NEGOCIO' | string
export type UserAdminStatus = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE_ACTIVACION' | string

export interface UserAdminRecord {
  id_person: string
  email: string
  role: UserAdminRole
  status: UserAdminStatus
  created_at: string
  updated_at: string
  person?: {
    id_person?: string
    name?: string
    first_lastname?: string
    second_lastname?: string
    phone?: string
  }
}

type RequestOptions = RequestInit & { auth?: boolean }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

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

export const usersAdminService = {
  async getUsers() {
    return request<UserAdminRecord[]>('/users')
  },

  async getUserById(id: string) {
    return request<UserAdminRecord>(`/users/${id}`)
  },

  async createUser(payload: {
    name: string
    first_lastname: string
    second_lastname: string
    phone: string
    email: string
  }) {
    return request<UserAdminRecord>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateUser(
    id: string,
    payload: Partial<{
      name: string
      first_lastname: string
      second_lastname: string
      phone: string
      role: string
      status: string
    }>,
  ) {
    return request<UserAdminRecord>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async updateUserStatus(id: string, status: string) {
    return request<UserAdminRecord>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

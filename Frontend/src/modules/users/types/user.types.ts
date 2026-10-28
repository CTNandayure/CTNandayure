export type UserRole = 'ADMIN' | 'USER' | string
export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE_ACTIVACION' | string

export interface User {
  id_person: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  person?: {
    name?: string
    first_lastname?: string
    second_lastname?: string
    phone?: string
  }
}

export interface LoginResponse {
  accessToken: string
}

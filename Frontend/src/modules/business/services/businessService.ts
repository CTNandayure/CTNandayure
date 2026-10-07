import { API_URL } from '../../../content/api'
import { tokenManager } from '../../users/services/tokenManager'
import type {
  BusinessRequestRecord,
  BusinessRecord,
  UpdateBusinessData,
  PublicBusiness,
  RequestStatus,
  BusinessStatus
} from '../types/business.types'

async function request<T>(path: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(options.headers)

  if (requiresAuth) {
    const token = tokenManager.get()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null

  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message
    throw new Error(message || `Error del servidor (${response.status})`)
  }

  return body as T
}

export const businessService = {
  createRequest(data: Omit<BusinessRequestRecord, 'id' | 'requestStatus' | 'rejectionReason' | 'createdAt' | 'updatedAt'>) {
    return request<BusinessRequestRecord>('/businesses/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  },

  getRequests(status?: RequestStatus) {
    return request<BusinessRequestRecord[]>(
      status ? `/businesses/requests?status=${status}` : '/businesses/requests'
    )
  },

  getRequestById(id: string) {
    return request<BusinessRequestRecord>(`/businesses/requests/${id}`)
  },

  approveRequest(id: string) {
    return request<BusinessRecord>(`/businesses/requests/${id}/approve`, {
      method: 'PATCH',
    })
  },

  rejectRequest(id: string, reason: string) {
    return request<BusinessRequestRecord>(`/businesses/requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  getBusinesses() {
    return request<BusinessRecord[]>('/businesses')
  },

  getPublicBusinesses() {
    return request<PublicBusiness[]>('/businesses/public', {}, false)
  },

  getBusinessById(id: string) {
    return request<BusinessRecord>(`/businesses/${id}`)
  },

  getMyBusiness() {
    return request<BusinessRecord>('/businesses/my-business')
  },

  updateMyBusiness(data: UpdateBusinessData) {
    return request<BusinessRecord>('/businesses/my-business', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updateBusiness(id: string, data: UpdateBusinessData) {
    return request<BusinessRecord>(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updateBusinessStatus(id: string, businessStatus: BusinessStatus) {
    return request<BusinessRecord>(`/businesses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ businessStatus }),
    })
  },

  createBusinessDirect(data: Omit<BusinessRequestRecord, 'id' | 'requestStatus' | 'rejectionReason' | 'createdAt' | 'updatedAt'>) {
    return request<BusinessRecord>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ url: string }>('/businesses/upload', {
      method: 'POST',
      body: formData,
    }, false)
  },
}


import { API_URL } from '../../../content/api'
import type { NewsItem, NewsStatus } from '../../../content/types'
import { tokenManager } from '../../users/services/tokenManager'

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

export interface NewsFormPayload {
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
}

export const newsAdminService = {
  async getNews() {
    return request<NewsItem[]>('/news/admin')
  },

  async getNewsById(id: string) {
    return request<NewsItem>(`/news/admin/${id}`)
  },

  async createNews(payload: NewsFormPayload) {
    return request<NewsItem>('/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateNews(id: string, payload: Partial<NewsFormPayload>) {
    return request<NewsItem>(`/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async updateNewsStatus(id: string, status: NewsStatus) {
    return request<NewsItem>(`/news/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

import { API_URL } from '../../../content/api'
import { tokenManager } from '../../users/services/tokenManager'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  // Public endpoints skip the token; the rest send the logged-in user's JWT.
  auth?: boolean
}

// The backend answers validation failures with a list of messages; keeping the
// list lets forms show one line per problem instead of a single long sentence.
export class ApiError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super(messages.join('. '))
    this.messages = messages
  }
}

// Drops empty values so optional filters never reach the API as "?q=" (the
// backend rejects unknown params and validates every one it receives).
export function buildQuery(params: Record<string, string | number | undefined | null> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function apiRequest<T>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (auth) {
    const token = tokenManager.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null

  if (!response.ok) {
    const messages = Array.isArray(data?.message) ? data.message : data?.message ? [data.message] : []
    throw new ApiError(messages.length > 0 ? messages : [`Error del servidor (${response.status})`])
  }

  return data as T
}

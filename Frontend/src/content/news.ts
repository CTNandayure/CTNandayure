import { useCallback, useEffect, useState } from 'react'
import { API_URL } from './api'
import type { ContentStatus, NewsItem } from './types'

// Only published items — the backend's GET /news already filters by status,
// so nothing here has to know about drafts.
export function useNews() {
  const [data, setData] = useState<NewsItem[]>([])
  const [status, setStatus] = useState<ContentStatus>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/news`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as NewsItem[])
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, status, refetch: load }
}

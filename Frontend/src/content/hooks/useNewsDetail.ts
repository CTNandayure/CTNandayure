import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '../api'
import type { ContentStatus, NewsItem } from '../types'

// GET /news/:slug only returns published items (404 for drafts and unknown
// slugs) — status 'error' covers both "not found" and a real network error,
// which is fine here since the public page just needs to know whether to show
// the article or a not-found message.
export function useNewsDetail(slug: string | undefined) {
  const [data, setData] = useState<NewsItem | null>(null)
  const [status, setStatus] = useState<ContentStatus>('loading')

  const load = useCallback(async () => {
    if (!slug) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/news/${encodeURIComponent(slug)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as NewsItem)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  return { data, status }
}

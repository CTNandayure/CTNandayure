import { useEffect, useState } from 'react'
import type { ContentStatus } from '../../../content/types'
import { activitiesService } from '../services/activitiesService'
import type { ActivityRecord, PublicActivitiesParams } from '../types/activity.types'

// Published, current activities of active businesses (the API already hides
// drafts, inactive ones and expired ones). Same {data, status} shape as the
// other content hooks. A newer request supersedes an older one, so typing in
// the search box can never show stale results.
export function usePublicActivities(params: PublicActivitiesParams = {}) {
  const [data, setData] = useState<ActivityRecord[]>([])
  const [status, setStatus] = useState<ContentStatus>('loading')
  const key = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    activitiesService
      .getPublic(JSON.parse(key) as PublicActivitiesParams)
      .then((items) => {
        if (cancelled) return
        setData(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [key])

  return { data, status }
}

export function useActivityBySlug(slug: string | undefined) {
  const [data, setData] = useState<ActivityRecord | null>(null)
  const [status, setStatus] = useState<ContentStatus>('loading')

  useEffect(() => {
    if (!slug) {
      setStatus('error')
      return
    }
    let cancelled = false
    setStatus('loading')
    activitiesService
      .getPublicBySlug(slug)
      .then((item) => {
        if (cancelled) return
        setData(item)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { data, status }
}

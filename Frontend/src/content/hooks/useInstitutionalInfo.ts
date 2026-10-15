import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '../api'
import type { ContentStatus, InstitutionalInfo } from '../types'

// The one section wired to the real backend (Backend/src/institutional-info).
// The other content hooks return static data with this same {data, status}
// shape, so swapping them for a fetch later means editing the hook only.
// refetch() lets the admin form pull the latest saved values after a PATCH.
export function useInstitutionalInfo() {
  const [data, setData] = useState<InstitutionalInfo | null>(null)
  const [status, setStatus] = useState<ContentStatus>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/institutional-info`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as InstitutionalInfo)
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

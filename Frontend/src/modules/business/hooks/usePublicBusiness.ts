import { useEffect, useState } from 'react'
import type { ContentStatus } from '../../../content/types'
import { businessService } from '../services/businessService'
import type { PublicBusiness } from '../types/business.types'

export function usePublicBusiness(id: string | undefined) {
  const [data, setData] = useState<PublicBusiness | null>(null)
  const [status, setStatus] = useState<ContentStatus>('loading')

  useEffect(() => {
    if (!id) {
      setStatus('error')
      return
    }
    let cancelled = false
    setStatus('loading')
    businessService
      .getPublicBusinessById(id)
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
  }, [id])

  return { data, status }
}


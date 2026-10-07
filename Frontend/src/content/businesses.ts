import { useState, useEffect } from 'react'
import { API_URL } from './api'
import type { Business } from './types'

export function useBusinesses() {
  const [data, setData] = useState<Business[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetch(`${API_URL}/businesses/public`)
      .then((res) => res.json())
      .then((businesses: Business[]) => {
        setData(businesses)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return { data, status }
}

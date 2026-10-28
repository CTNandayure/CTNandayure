import { useState } from 'react'
import type { ContentStatus } from '../types'

// Wraps static example data in the same {data, status} shape the real hooks
// use, so a section never knows whether its content comes from mock data or
// an API — swapping one for the other later doesn't touch the component.
export function useMockContent<T>(data: T) {
  const [status] = useState<ContentStatus>('ready')
  return { data, status }
}

import { useState } from 'react'

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  return { isSubmitting, setIsSubmitting, error, setError }
}

import { useState } from 'react'

export function useValidation<T extends Record<string, string>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  return { errors, setErrors, clearErrors: () => setErrors({}) }
}

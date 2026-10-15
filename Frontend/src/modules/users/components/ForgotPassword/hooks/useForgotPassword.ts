import { useState } from 'react'
import { authService } from '../../../services/authService'
import { useErrorHandler } from '../../../hooks/useErrorHandler'
import { validateEmail } from '../../../utils/validators'

export function useForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formatError = useErrorHandler()
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validateEmail(email)
    if (validation) return setError(validation)
    setError(''); setIsSubmitting(true)
    try { await authService.forgotPassword(email); setSent(true) } catch (cause) { setError(formatError(cause)) } finally { setIsSubmitting(false) }
  }
  return { email, setEmail, error, sent, isSubmitting, submit }
}

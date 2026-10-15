import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { REMEMBERED_EMAIL_KEY } from '../../../utils/constants'
import { validateEmail, validatePassword } from '../../../utils/validators'
import { useErrorHandler } from '../../../hooks/useErrorHandler'

export function useLoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const errorMessage = useErrorHandler()
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)))
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = { email: validateEmail(email), password: validatePassword(password) }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return
    setError('')
    setIsSubmitting(true)
    try {
      if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      await login(email, password)
      navigate('/')
    } catch (cause) {
      setError(errorMessage(cause, 'No fue posible iniciar sesión'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, setEmail, password, setPassword, remember, setRemember, errors, error, isSubmitting, submit }
}

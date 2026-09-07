import { useState } from 'react'
import { authService } from '../../../services/authService'
import { useErrorHandler } from '../../../hooks/useErrorHandler'
import { validatePassword, validatePasswordConfirmation } from '../../../utils/validators'

export function useChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formatError = useErrorHandler()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSuccess(false)
    const validation = validatePassword(newPassword) || validatePasswordConfirmation(newPassword, confirmation)
    if (!currentPassword) return setError('La contraseña actual es obligatoria')
    if (validation) return setError(validation)
    setError('')
    setIsSubmitting(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setSuccess(true)
    } catch (cause) { setError(formatError(cause)) } finally { setIsSubmitting(false) }
  }
  return { currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmation, setConfirmation, error, success, isSubmitting, submit }
}

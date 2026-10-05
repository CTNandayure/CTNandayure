import { validateEmail as sharedValidateEmail, validatePhone as sharedValidatePhone } from '../../../utils/validation'

export function validateName(value: string, label: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return label + ' es obligatorio'
  if (trimmed.length < 2) return label + ' debe tener al menos 2 caracteres'
  if (trimmed.length > 50) return label + ' no puede exceder 50 caracteres'
  if (!/^[\p{L}\s]+$/u.test(trimmed)) return label + ' no es válido'
  return ''
}

export function validateLastName(value: string, label: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return label + ' es obligatorio'
  if (trimmed.length < 2) return label + ' debe tener al menos 2 caracteres'
  if (trimmed.length > 100) return label + ' no puede exceder 100 caracteres'
  if (!/^[\p{L}\s]+$/u.test(trimmed)) return label + ' no es válido'
  return ''
}

export const validatePhone = sharedValidatePhone

export const validateEmail = sharedValidateEmail

export function validatePassword(value: string) {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < 12) return 'La contraseña debe tener al menos 12 caracteres'
  if (value.length > 128) return 'La contraseña no debe exceder 128 caracteres'
  return ''
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation.trim()) return 'Debes confirmar la contraseña'
  return password === confirmation ? '' : 'Las contraseñas no coinciden'
}


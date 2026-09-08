import { PASSWORD_MIN_LENGTH } from './constants'

export function validateEmail(value: string) {
  if (!value.trim()) return 'El correo es obligatorio'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Ingresa un correo válido'
}

export function validatePassword(value: string) {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < PASSWORD_MIN_LENGTH) return `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  if (value.length > 128) return 'No debe exceder 128 caracteres'
  if (/password|12345678|qwerty|admin|letmein|welcome|monkey/i.test(value)) return 'La contraseña es demasiado común'
  return ''
}

export function passwordChecks(value: string) {
  return [
    { label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`, valid: value.length >= PASSWORD_MIN_LENGTH },
    { label: 'Una mayúscula', valid: /[A-Z]/.test(value) },
    { label: 'Una minúscula', valid: /[a-z]/.test(value) },
    { label: 'Un número', valid: /\d/.test(value) },
    { label: 'Un carácter especial', valid: /[^A-Za-z0-9]/.test(value) },
  ]
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  return password === confirmation ? '' : 'Las contraseñas no coinciden'
}

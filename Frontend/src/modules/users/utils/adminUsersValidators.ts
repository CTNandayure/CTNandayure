export function validateName(value: string, label: string) {
  if (!value.trim()) return `${label} es obligatorio`
  if (value.trim().length < 2) return `${label} debe tener al menos 2 caracteres`
  if (value.trim().length > 50) return `${label} no puede exceder 50 caracteres`
  if (!/^[\p{L}\s'-]+$/u.test(value.trim())) return `${label} solo puede incluir letras, espacios, guiones y apóstrofes`
  return ''
}

export function validateLastName(value: string, label: string) {
  if (!value.trim()) return `${label} es obligatorio`
  if (value.trim().length < 2) return `${label} debe tener al menos 2 caracteres`
  if (value.trim().length > 100) return `${label} no puede exceder 100 caracteres`
  if (!/^[\p{L}\s'-]+$/u.test(value.trim())) return `${label} solo puede incluir letras, espacios, guiones y apóstrofes`
  return ''
}

export function validatePhone(value: string) {
  if (!value.trim()) return 'El teléfono es obligatorio'
  if (value.trim().length > 20) return 'El teléfono no puede exceder 20 caracteres'
  if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(value.trim())) return 'El teléfono no es válido'
  return ''
}

export function validateEmail(value: string) {
  if (!value.trim()) return 'El correo es obligatorio'
  if (value.trim().length > 100) return 'El correo no puede exceder 100 caracteres'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Ingresa un correo válido'
}

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

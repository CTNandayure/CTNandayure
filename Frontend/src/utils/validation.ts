export function validateEmail(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'El correo electrónico es requerido'
  if (trimmed.length > 100) return 'El correo no puede exceder 100 caracteres'
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) return 'Formato de correo inválido'
  return ''
}

export function validatePhone(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'El teléfono es requerido'
  const phoneRegex = /^\d{4}-\d{4}$/
  if (!phoneRegex.test(trimmed)) return 'El teléfono debe tener el formato 8888-8888'
  return ''
}

export function stripPhoneFormat(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatPhoneDisplay(value: string): string {
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('506')) {
    digits = digits.slice(3)
  }
  digits = digits.slice(0, 8)
  if (digits.length <= 4) return digits
  return digits.slice(0, 4) + '-' + digits.slice(4)
}

export function applyPhoneMask(rawInput: string): string {
  if (!rawInput) return ''
  let digits = rawInput.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('506')) {
    digits = digits.slice(3)
  }
  digits = digits.slice(0, 8)
  if (digits.length <= 4) return digits
  return digits.slice(0, 4) + '-' + digits.slice(4)
}

export function filterLettersAndSpaces(value: string): string {
  if (!value) return ''
  return value.normalize('NFC').replace(/[^\p{L}\s]/gu, '')
}


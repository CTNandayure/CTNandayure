export const validateBusinessName = (name: string): string => {
  if (!name.trim()) return 'El nombre del negocio es requerido'
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres'
  if (name.length > 150) return 'El nombre no puede exceder 150 caracteres'
  return ''
}

export const validateDescription = (desc: string): string => {
  if (!desc.trim()) return 'La descripción es requerida'
  if (desc.length < 20) return 'La descripción debe tener al menos 20 caracteres'
  if (desc.length > 2000) return 'La descripción no puede exceder 2000 caracteres'
  return ''
}

export const validatePhone = (phone: string): string => {
  if (!phone.trim()) return 'El teléfono es requerido'
  if (phone.length > 20) return 'El teléfono no puede exceder 20 caracteres'
  const phoneRegex = /^[0-9+\-\s()]*$/
  if (!phoneRegex.test(phone)) return 'Formato de teléfono inválido'
  return ''
}

export const validateEmail = (email: string): string => {
  if (!email.trim()) return 'El correo electrónico es requerido'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Formato de correo inválido'
  return ''
}

export const validateAddress = (address: string): string => {
  if (!address.trim()) return 'La dirección es requerida'
  if (address.length < 10) return 'La dirección debe tener al menos 10 caracteres'
  if (address.length > 500) return 'La dirección no puede exceder 500 caracteres'
  return ''
}

export const validateUrl = (url: string | null | undefined): string => {
  if (!url || !url.trim()) return ''
  try {
    new URL(url)
    return ''
  } catch {
    return 'URL inválida'
  }
}

export const validateScheduleText = (schedule: string): string => {
  if (!schedule.trim()) return 'El horario es requerido'
  if (schedule.length < 5) return 'El horario debe tener al menos 5 caracteres'
  if (schedule.length > 500) return 'El horario no puede exceder 500 caracteres'
  return ''
}

export const validateApplicantName = (name: string): string => {
  if (!name.trim()) return 'El nombre es requerido'
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (name.length > 50) return 'El nombre no puede exceder 50 caracteres'
  return ''
}

export const validateApplicantLastname = (lastname: string): string => {
  if (!lastname.trim()) return 'El apellido es requerido'
  if (lastname.length < 2) return 'El apellido debe tener al menos 2 caracteres'
  if (lastname.length > 100) return 'El apellido no puede exceder 100 caracteres'
  return ''
}

export const validateCategories = (categories: string[]): string => {
  if (!categories || categories.length === 0) return 'Debe seleccionar al menos una categoría'
  return ''
}

export const validateGalleryUrls = (urls: string[]): string => {
  if (!urls || urls.length < 3) return 'Debe subir al menos 3 fotos'
  if (urls.length > 5) return 'No puede subir más de 5 fotos'
  return ''
}

export const validateDocumentUrls = (urls: string[]): string => {
  if (!urls || urls.length < 1) return 'Debe subir al menos 1 documento'
  if (urls.length > 5) return 'No puede subir más de 5 documentos'
  return ''
}

export const validateCoverImage = (url: string): string => {
  if (!url || !url.trim()) return 'La foto de portada es requerida'
  return ''
}

export const validateDistrict = (district: string): string => {
  if (!district.trim()) return 'El distrito es requerido'
  return ''
}

export const validateStep = (step: number, data: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (step === 0) {
    const nameErr = validateApplicantName(data.applicantName || '')
    if (nameErr) errors.applicantName = nameErr

    const lastName1Err = validateApplicantLastname(data.applicantFirstLastname || '')
    if (lastName1Err) errors.applicantFirstLastname = lastName1Err

    const lastName2Err = validateApplicantLastname(data.applicantSecondLastname || '')
    if (lastName2Err) errors.applicantSecondLastname = lastName2Err

    const appPhoneErr = validatePhone(data.applicantPhone || '')
    if (appPhoneErr) errors.applicantPhone = appPhoneErr

    const appEmailErr = validateEmail(data.applicantEmail || '')
    if (appEmailErr) errors.applicantEmail = appEmailErr
  }

  if (step === 1) {
    const nameErr = validateBusinessName(data.businessName || '')
    if (nameErr) errors.businessName = nameErr

    const catErr = validateCategories(data.categories || [])
    if (catErr) errors.categories = catErr

    const distErr = validateDistrict(data.district || '')
    if (distErr) errors.district = distErr

    const descErr = validateDescription(data.description || '')
    if (descErr) errors.description = descErr
  }

  if (step === 2) {
    const phoneErr = validatePhone(data.phone || '')
    if (phoneErr) errors.phone = phoneErr

    const emailErr = validateEmail(data.email || '')
    if (emailErr) errors.email = emailErr

    const addrErr = validateAddress(data.address || '')
    if (addrErr) errors.address = addrErr

    const fbErr = validateUrl(data.facebookUrl)
    if (fbErr) errors.facebookUrl = fbErr

    const igErr = validateUrl(data.instagramUrl)
    if (igErr) errors.instagramUrl = igErr

    const schedErr = validateScheduleText(data.scheduleText || '')
    if (schedErr) errors.scheduleText = schedErr

    const hasLat = data.latitude !== undefined && data.latitude !== null && data.latitude !== ''
    const hasLng = data.longitude !== undefined && data.longitude !== null && data.longitude !== ''

    if (hasLat && !hasLng) {
      errors.longitude = 'Debe indicar la longitud si proporciona la latitud'
    } else if (!hasLat && hasLng) {
      errors.latitude = 'Debe indicar la latitud si proporciona la longitud'
    } else if (hasLat && hasLng) {
      const numLat = Number(data.latitude)
      const numLng = Number(data.longitude)

      if (Number.isNaN(numLat) || numLat < -90 || numLat > 90) {
        errors.latitude = 'La latitud debe ser un número entre -90 y 90'
      }
      if (Number.isNaN(numLng) || numLng < -180 || numLng > 180) {
        errors.longitude = 'La longitud debe ser un número entre -180 y 180'
      }
    }
  }

  if (step === 3) {
    const coverErr = validateCoverImage(data.coverImageUrl || '')
    if (coverErr) errors.coverImageUrl = coverErr

    const galleryErr = validateGalleryUrls(data.galleryUrls || [])
    if (galleryErr) errors.galleryUrls = galleryErr
  }

  if (step === 4) {
    const docsErr = validateDocumentUrls(data.documentUrls || [])
    if (docsErr) errors.documentUrls = docsErr
  }

  return errors
}

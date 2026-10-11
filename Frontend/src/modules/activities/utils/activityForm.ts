import type { ActivityFormValues, ActivityPayload, ActivityRecord } from '../types/activity.types'

// Mirrors the backend rules (Backend/src/modules/activities) so the user sees
// problems before submitting. The backend stays the source of truth: whatever it
// rejects is shown as the form's error banner.

export const FIELD_LIMITS = {
  nameMin: 3,
  nameMax: 150,
  descriptionMin: 20,
  descriptionMax: 2000,
  customCategoryMin: 2,
  customCategoryMax: 60,
  requirementsMax: 1000,
  meetingPointMin: 5,
  meetingPointMax: 500,
  durationMinMinutes: 15,
  durationMaxMinutes: 1440,
} as const

export function emptyFormValues(businessId = ''): ActivityFormValues {
  return {
    businessId,
    name: '',
    category: '',
    customCategory: '',
    description: '',
    durationHours: '1',
    durationMinutes: '0',
    requirements: '',
    scheduleType: 'SPECIFIC_DATE',
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '08:00',
    meetingPoint: '',
    meetingLatitude: null,
    meetingLongitude: null,
    imageUrl: null,
  }
}

export function valuesFromRecord(record: ActivityRecord): ActivityFormValues {
  return {
    businessId: record.business.id,
    name: record.name,
    category: record.category,
    customCategory: record.customCategory ?? '',
    description: record.description,
    durationHours: String(Math.floor(record.durationMinutes / 60)),
    durationMinutes: String(record.durationMinutes % 60),
    requirements: record.requirements ?? '',
    scheduleType: record.scheduleType,
    startDate: record.startDate ?? '',
    endDate: record.endDate ?? '',
    daysOfWeek: record.daysOfWeek,
    startTime: record.startTime,
    meetingPoint: record.meetingPoint,
    meetingLatitude: record.meetingLatitude,
    meetingLongitude: record.meetingLongitude,
    imageUrl: record.imageUrl,
  }
}

export function totalMinutes(values: Pick<ActivityFormValues, 'durationHours' | 'durationMinutes'>): number {
  return (Number(values.durationHours) || 0) * 60 + (Number(values.durationMinutes) || 0)
}

// Only the fields that apply to the chosen category / schedule are sent.
export function payloadFromValues(values: ActivityFormValues): ActivityPayload {
  const isSpecific = values.scheduleType === 'SPECIFIC_DATE'
  const hasCoordinates = values.meetingLatitude !== null && values.meetingLongitude !== null
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category as ActivityPayload['category'],
    customCategory: values.category === 'OTHER' ? values.customCategory.trim() : null,
    durationMinutes: totalMinutes(values),
    requirements: values.requirements.trim() || null,
    scheduleType: values.scheduleType,
    startDate: values.startDate || null,
    endDate: isSpecific ? null : values.endDate || null,
    daysOfWeek: isSpecific ? [] : [...values.daysOfWeek].sort((a, b) => a - b),
    startTime: values.startTime,
    meetingPoint: values.meetingPoint.trim(),
    meetingLatitude: hasCoordinates ? values.meetingLatitude : null,
    meetingLongitude: hasCoordinates ? values.meetingLongitude : null,
    imageUrl: values.imageUrl,
  }
}

// True when the user changed when the activity happens (so a past date is rejected).
export function scheduleDiffers(a: ActivityFormValues, b: ActivityFormValues): boolean {
  return (
    a.scheduleType !== b.scheduleType ||
    a.startDate !== b.startDate ||
    a.endDate !== b.endDate ||
    [...a.daysOfWeek].sort().join(',') !== [...b.daysOfWeek].sort().join(',')
  )
}

interface ValidationOptions {
  today: string
  isAdmin: boolean
  // Reject past dates (create, or editing the schedule of an existing activity).
  requireFuture: boolean
}

export type ActivityFormErrors = Partial<Record<keyof ActivityFormValues | 'duration' | 'coordinates', string>>

export function validateActivityForm(values: ActivityFormValues, options: ValidationOptions): ActivityFormErrors {
  const errors: ActivityFormErrors = {}
  const L = FIELD_LIMITS

  if (options.isAdmin && !values.businessId) errors.businessId = 'Seleccione el negocio'

  const name = values.name.trim()
  if (!name) errors.name = 'El nombre es obligatorio'
  else if (name.length < L.nameMin) errors.name = `El nombre debe tener al menos ${L.nameMin} caracteres`
  else if (name.length > L.nameMax) errors.name = `El nombre no puede exceder ${L.nameMax} caracteres`

  if (!values.category) errors.category = 'Seleccione una categoría'
  if (values.category === 'OTHER') {
    const custom = values.customCategory.trim()
    if (!custom) errors.customCategory = 'Escriba el nombre de la categoría'
    else if (custom.length < L.customCategoryMin) errors.customCategory = `Debe tener al menos ${L.customCategoryMin} caracteres`
    else if (custom.length > L.customCategoryMax) errors.customCategory = `No puede exceder ${L.customCategoryMax} caracteres`
  }

  const description = values.description.trim()
  if (!description) errors.description = 'La descripción es obligatoria'
  else if (description.length < L.descriptionMin) errors.description = `La descripción debe tener al menos ${L.descriptionMin} caracteres`
  else if (description.length > L.descriptionMax) errors.description = `La descripción no puede exceder ${L.descriptionMax} caracteres`

  const minutes = totalMinutes(values)
  if (minutes < L.durationMinMinutes) errors.duration = 'La duración mínima es de 15 minutos'
  else if (minutes > L.durationMaxMinutes) errors.duration = 'La duración máxima es de 24 horas'
  else if ((Number(values.durationMinutes) || 0) > 59) errors.duration = 'Los minutos deben estar entre 0 y 59'

  if (values.requirements.trim().length > L.requirementsMax) {
    errors.requirements = `Los requisitos no pueden exceder ${L.requirementsMax} caracteres`
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.startTime)) errors.startTime = 'Indique una hora de inicio válida'

  if (values.scheduleType === 'SPECIFIC_DATE') {
    if (!values.startDate) errors.startDate = 'Indique la fecha de la actividad'
    else if (options.requireFuture && values.startDate < options.today) {
      errors.startDate = 'La fecha no puede estar en el pasado'
    }
  } else {
    if (values.daysOfWeek.length === 0) errors.daysOfWeek = 'Seleccione al menos un día de la semana'
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      errors.endDate = 'La fecha de fin no puede ser anterior a la de inicio'
    } else if (values.endDate && options.requireFuture && values.endDate < options.today) {
      errors.endDate = 'La vigencia ya terminó'
    }
  }

  const meetingPoint = values.meetingPoint.trim()
  if (!meetingPoint) errors.meetingPoint = 'El punto de encuentro es obligatorio'
  else if (meetingPoint.length < L.meetingPointMin) errors.meetingPoint = `Debe tener al menos ${L.meetingPointMin} caracteres`
  else if (meetingPoint.length > L.meetingPointMax) errors.meetingPoint = `No puede exceder ${L.meetingPointMax} caracteres`

  if ((values.meetingLatitude === null) !== (values.meetingLongitude === null)) {
    errors.coordinates = 'Indique la latitud y la longitud, o ninguna de las dos'
  }

  return errors
}

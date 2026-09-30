import type { BusinessCategory, DistrictKey } from '../types/business.types'

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  LODGING: 'Hospedaje',
  FOOD: 'Alimentación',
  TRANSPORT: 'Transporte',
  CRAFTS: 'Artesanías',
  TOURS: 'Tours',
  AGROTOURISM: 'Agroturismo',
  COMMERCE: 'Comercio',
}

export const DISTRICT_LABELS: Record<DistrictKey, string> = {
  CARMONA: 'Carmona',
  SANTA_RITA: 'Santa Rita',
  ZAPOTAL: 'Zapotal',
  SAN_PABLO: 'San Pablo',
  PORVENIR: 'Porvenir',
  BEJUCO: 'Bejuco',
}

export const REQUEST_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
}

export const BUSINESS_STATUS_LABELS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
}

export const SCHEDULE_PLACEHOLDER = 'Ej: Lunes a Viernes: 8:00am - 5:00pm\nSábados: 9:00am - 12:00md\nDomingos: Cerrado'

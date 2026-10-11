import type { BusinessCategory, DistrictKey } from '../../business/types/business.types'

export type ActivityCategory = 'SURF' | 'HIKING' | 'CULTURE' | 'AGROTOURISM' | 'GASTRONOMY' | 'WILDLIFE' | 'OTHER'
export type ActivityScheduleType = 'SPECIFIC_DATE' | 'RECURRING'
export type ActivityStatus = 'BORRADOR' | 'PUBLICADA' | 'INACTIVA'

// Business data the API embeds in every activity.
export interface ActivityBusiness {
  id: string
  businessName: string
  district: DistrictKey
  categories: BusinessCategory[]
  phone: string
  email: string
  coverImageUrl: string
  facebookUrl: string | null
  instagramUrl: string | null
  businessStatus: 'ACTIVE' | 'INACTIVE'
}

// What the API returns. Dates are 'YYYY-MM-DD' (Costa Rica calendar day) and
// startTime is 'HH:mm', so nothing shifts with the browser's time zone.
export interface ActivityRecord {
  id: string
  slug: string
  name: string
  description: string
  category: ActivityCategory
  customCategory: string | null
  durationMinutes: number
  requirements: string | null
  scheduleType: ActivityScheduleType
  // SPECIFIC_DATE: the day. RECURRING: start of the optional validity window.
  startDate: string | null
  // RECURRING only: end of the optional validity window.
  endDate: string | null
  // ISO weekdays: 1 = Monday ... 7 = Sunday.
  daysOfWeek: number[]
  startTime: string
  meetingPoint: string
  meetingLatitude: number | null
  meetingLongitude: number | null
  imageUrl: string | null
  status: ActivityStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  // Next day it takes place; null once it ended ("vencida").
  nextOccurrence: string | null
  expired: boolean
  business: ActivityBusiness
}

// Body for create / update (the API treats every field as optional on update).
export interface ActivityPayload {
  name: string
  description: string
  category: ActivityCategory
  customCategory: string | null
  durationMinutes: number
  requirements: string | null
  scheduleType: ActivityScheduleType
  startDate: string | null
  endDate: string | null
  daysOfWeek: number[]
  startTime: string
  meetingPoint: string
  meetingLatitude: number | null
  meetingLongitude: number | null
  imageUrl: string | null
}

export interface AdminActivityPayload extends ActivityPayload {
  businessId: string
}

export interface PublicActivitiesParams {
  category?: ActivityCategory
  district?: DistrictKey
  q?: string
  limit?: number
}

export interface AdminActivitiesParams {
  category?: ActivityCategory
  status?: ActivityStatus
  businessId?: string
  q?: string
}

// Form state: everything is a string/number the inputs can hold directly.
export interface ActivityFormValues {
  businessId: string
  name: string
  category: ActivityCategory | ''
  customCategory: string
  description: string
  durationHours: string
  durationMinutes: string
  requirements: string
  scheduleType: ActivityScheduleType
  startDate: string
  endDate: string
  daysOfWeek: number[]
  startTime: string
  meetingPoint: string
  meetingLatitude: number | null
  meetingLongitude: number | null
  imageUrl: string | null
}

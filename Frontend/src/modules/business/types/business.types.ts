export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type BusinessStatus = 'ACTIVE' | 'INACTIVE'

export type BusinessCategory = 'LODGING' | 'FOOD' | 'TRANSPORT' | 'CRAFTS' | 'TOURS' | 'AGROTOURISM' | 'COMMERCE'

export type DistrictKey = 'CARMONA' | 'SANTA_RITA' | 'ZAPOTAL' | 'SAN_PABLO' | 'PORVENIR' | 'BEJUCO'

export interface BusinessRequestRecord {
  id: string
  businessName: string
  categories: BusinessCategory[]
  district: DistrictKey
  description: string
  phone: string
  email: string
  address: string
  latitude: number | null
  longitude: number | null
  facebookUrl: string | null
  instagramUrl: string | null
  scheduleText: string
  coverImageUrl: string
  galleryUrls: string[]
  documentUrls: string[]
  applicantName: string
  applicantFirstLastname: string
  applicantSecondLastname: string
  applicantPhone: string
  applicantEmail: string
  requestStatus: RequestStatus
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface BusinessRecord {
  id: string
  businessName: string
  categories: BusinessCategory[]
  district: DistrictKey
  description: string
  phone: string
  email: string
  address: string
  latitude: number | null
  longitude: number | null
  facebookUrl: string | null
  instagramUrl: string | null
  scheduleText: string
  coverImageUrl: string
  galleryUrls: string[]
  documentUrls: string[]
  businessStatus: BusinessStatus
  requestId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
  request?: BusinessRequestRecord | null
  user?: {
    email: string
    person?: {
      name: string
      first_lastname: string
      second_lastname: string
      phone: string
    } | null
  } | null
}

export interface PublicBusiness {
  id: string
  businessName: string
  categories: BusinessCategory[]
  district: DistrictKey
  description: string
  phone: string
  email: string
  address: string
  coverImageUrl: string
  galleryUrls: string[]
  facebookUrl: string | null
  instagramUrl: string | null
  scheduleText: string
}

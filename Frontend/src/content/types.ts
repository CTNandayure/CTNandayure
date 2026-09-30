export interface InstitutionalInfo {
  id: number
  aboutTitle: string
  aboutText: string
  historyText: string
  missionText: string
  visionText: string
  aboutImageUrl: string | null
  contactImageUrl: string | null
  heroImageUrl: string | null
  address: string
  phone: string
  email: string
  officeHours: string
  updatedAt: string
}

export interface District {
  slug: string
  name: string
  tag: string
  tagColor: 'teal' | 'green'
  description: string
  imageUrl: string | null
}

export interface Activity {
  id: string
  title: string
  description: string
  districts: string[]
  category: 'Playa' | 'Montaña' | 'Cultura' | 'Gastronomía'
  imageUrl: string | null
}

export interface Business {
  id: string
  businessName: string
  categories: string[]
  district: string
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

export type NewsStatus = 'BORRADOR' | 'PUBLICADO'

export interface NewsItem {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
  status: NewsStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ContentStatus = 'loading' | 'ready' | 'error'

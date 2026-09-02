export interface InstitutionalInfo {
  id: number
  aboutTitle: string
  aboutText: string
  historyText: string
  missionText: string
  visionText: string
  aboutImageUrl: string | null
  contactImageUrl: string | null
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
  name: string
  category: string
  district: string
  description: string
  imageUrl: string | null
}

export interface NewsItem {
  id: string
  date: string
  title: string
  excerpt: string
  imageUrl: string | null
}

export type ContentStatus = 'loading' | 'ready' | 'error'

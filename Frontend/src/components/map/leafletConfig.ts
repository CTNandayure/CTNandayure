import L from 'leaflet'
import type { BusinessCategory } from '../../modules/business/types/business.types'

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'

export const DEFAULT_COORDINATES: [number, number] = [9.9787, -85.2514]
export const DEFAULT_ZOOM = 13
export const PINNED_ZOOM = 15

export function createBrandMarkerIcon(): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14.2 26.7 14.8 27.4.6.7 1.8.7 2.4 0 .6-.7 14.8-16.9 14.8-27.4C32 7.163 24.837 0 16 0z" fill="#002848" />
      <circle cx="16" cy="16" r="10" fill="#ffffff" />
      <circle cx="16" cy="16" r="6" fill="#04a663" />
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'brand-leaflet-marker',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  })
}


export type MapBaseLayerKey = 'streets' | 'satellite' | 'terrain'

export interface MapBaseLayerConfig {
  label: string
  url: string
  attribution: string
  maxZoom: number
  subdomains?: string
}

export const MAP_BASE_LAYERS: Record<MapBaseLayerKey, MapBaseLayerConfig> = {
  streets: {
    label: 'Calles',
    url: OSM_TILE_URL,
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
  },
  satellite: {
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics and the GIS User Community',
    maxZoom: 19,
  },
  terrain: {
    label: 'Relieve',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, SRTM | Style: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
    subdomains: 'abc',
  },
}

export interface CategoryMarkerStyle {
  color: string
  glyph: string
}

export const CATEGORY_MARKER_STYLES: Record<BusinessCategory, CategoryMarkerStyle> = {
  LODGING: {
    color: '#0e829f',
    glyph: '<path d="M2 5v14"/><path d="M2 9h17a3 3 0 0 1 3 3v7"/><path d="M2 16h20"/><circle cx="7" cy="12.5" r="1.6"/>',
  },
  FOOD: {
    color: '#e0701f',
    glyph:
      '<path d="M4 3v6a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V3"/><path d="M6.5 3v18"/><path d="M19 21V3c-2.5 1.5-4 4-4 8h4"/>',
  },
  TRANSPORT: {
    color: '#5b6b7a',
    glyph:
      '<path d="M5 17H3v-5l2-5h11l3 5v5h-2"/><path d="M3 12h16"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
  },
  CRAFTS: {
    color: '#9b4dca',
    glyph:
      '<path d="M12 22a10 10 0 1 1 0-20c5.5 0 10 3.6 10 8 0 3-2.5 4-4.5 4H15a2 2 0 0 0-1.5 3.3c.5.6.5 1.2.5 1.7 0 1.7-.9 3-2 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="9.5" r="1"/>',
  },
  TOURS: {
    color: '#04a663',
    glyph: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
  },
  AGROTOURISM: {
    color: '#6a9a1f',
    glyph:
      '<path d="M7 21h10"/><path d="M12 21V11"/><path d="M12 13c-4 0-6-2.5-6-6 4 0 6 2.5 6 6z"/><path d="M12 11c0-3.5 2-6 6-6 0 3.5-2 6-6 6z"/>',
  },
  COMMERCE: {
    color: '#b8860b',
    glyph: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  },
}

export function getCategoryColor(category: BusinessCategory): string {
  return CATEGORY_MARKER_STYLES[category]?.color ?? '#002848'
}

export function createCategoryMarkerIcon(category: BusinessCategory | undefined): L.DivIcon {
  const style = category ? CATEGORY_MARKER_STYLES[category] : undefined
  const color = style?.color ?? '#002848'
  const glyph = style?.glyph ?? '<circle cx="12" cy="12" r="5" fill="#04a663" stroke="none"/>'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14.2 26.7 14.8 27.4.6.7 1.8.7 2.4 0 .6-.7 14.8-16.9 14.8-27.4C32 7.163 24.837 0 16 0z" fill="${color}" />
      <circle cx="16" cy="16" r="11.5" fill="#ffffff" />
      <svg x="7" y="7" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'brand-leaflet-marker',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  })
}

export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: '<span class="user-location-dot"></span>',
    className: 'user-location-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

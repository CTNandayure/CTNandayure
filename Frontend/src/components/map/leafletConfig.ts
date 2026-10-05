import L from 'leaflet'

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


export const NANDAYURE_CENTER = {
  lat: 9.9787,
  lng: -85.2514,
}

export const DEFAULT_MAP_ZOOM = 12

export function isValidLatitude(lat: unknown): lat is number {
  if (typeof lat !== 'number' || Number.isNaN(lat)) {
    return false
  }
  return lat >= -90 && lat <= 90
}

export function isValidLongitude(lng: unknown): lng is number {
  if (typeof lng !== 'number' || Number.isNaN(lng)) {
    return false
  }
  return lng >= -180 && lng <= 180
}

export function isValidCoordinates(lat: unknown, lng: unknown): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng)
}

export function parseCoordinatePair(raw: string): { latitude: number; longitude: number } | null {
  if (!raw) return null
  const cleaned = raw.trim()

  const parts = cleaned.includes(',')
    ? cleaned.split(',')
    : cleaned.split(/\s+/)

  if (parts.length !== 2) {
    return null
  }

  const lat = parseFloat(parts[0].trim())
  const lng = parseFloat(parts[1].trim())

  if (isValidLatitude(lat) && isValidLongitude(lng)) {
    return { latitude: lat, longitude: lng }
  }

  return null
}

export function formatCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  precision = 6,
): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return ''
  }
  if (!isValidCoordinates(lat, lng)) {
    return ''
  }
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}

export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}


import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  DEFAULT_COORDINATES,
  DEFAULT_ZOOM,
  PINNED_ZOOM,
  createBrandMarkerIcon,
} from './leafletConfig'
import { isValidCoordinates } from '../../modules/business/utils/geo'

export interface MapViewProps {
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  interactive?: boolean
  onLocationChange?: (lat: number, lng: number) => void
  height?: string
  className?: string
  zoom?: number
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  accuracy,
  interactive = false,
  onLocationChange,
  height = '320px',
  className = '',
  zoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const onLocationChangeRef = useRef(onLocationChange)

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  useEffect(() => {
    if (!containerRef.current) return

    const initialHasCoords = isValidCoordinates(latitude, longitude)
    const initialCenter: [number, number] = initialHasCoords
      ? [latitude as number, longitude as number]
      : DEFAULT_COORDINATES
    const initialZoom = zoom ?? (initialHasCoords ? PINNED_ZOOM : DEFAULT_ZOOM)

    const mapInstance = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: interactive,
      dragging: true,
      touchZoom: true,
    })

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapInstance)

    mapRef.current = mapInstance

    const invalidateTimer = setTimeout(() => {
      mapInstance.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(invalidateTimer)
      mapInstance.remove()
      mapRef.current = null
      markerRef.current = null
      circleRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const hasCoords = isValidCoordinates(latitude, longitude)

    if (hasCoords) {
      const lat = latitude as number
      const lng = longitude as number

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createBrandMarkerIcon(),
          draggable: interactive,
        }).addTo(map)

        if (interactive) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng()
            onLocationChangeRef.current?.(pos.lat, pos.lng)
          })
        }

        markerRef.current = marker
      } else {
        markerRef.current.setLatLng([lat, lng])
        if (markerRef.current.dragging) {
          if (interactive) {
            markerRef.current.dragging.enable()
          } else {
            markerRef.current.dragging.disable()
          }
        }
      }

      if (accuracy && accuracy > 0) {
        if (!circleRef.current) {
          const circle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#04a663',
            fillColor: '#04a663',
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(map)
          circleRef.current = circle
        } else {
          circleRef.current.setLatLng([lat, lng])
          circleRef.current.setRadius(accuracy)
        }
      } else if (circleRef.current) {
        circleRef.current.remove()
        circleRef.current = null
      }

      map.setView([lat, lng], map.getZoom() < PINNED_ZOOM ? PINNED_ZOOM : map.getZoom())
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (circleRef.current) {
        circleRef.current.remove()
        circleRef.current = null
      }
    }
  }, [latitude, longitude, accuracy, interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!interactive) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onLocationChangeRef.current?.(e.latlng.lat, e.latlng.lng)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [interactive])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={`relative rounded-xl overflow-hidden shadow-xs border border-gray-200 z-0 ${className}`}
    />
  )
}


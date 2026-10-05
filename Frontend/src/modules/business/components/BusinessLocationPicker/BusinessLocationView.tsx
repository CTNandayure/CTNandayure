import React from 'react'
import { MapView } from '../../../../components/map/MapView'
import { isValidCoordinates, formatCoordinates, getGoogleMapsUrl } from '../../utils/geo'

export interface BusinessLocationViewProps {
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  showMap?: boolean
  mapHeight?: string
  className?: string
}

export const BusinessLocationView: React.FC<BusinessLocationViewProps> = ({
  latitude,
  longitude,
  accuracy,
  showMap = true,
  mapHeight = '220px',
  className = '',
}) => {
  const hasCoords = isValidCoordinates(latitude, longitude)

  if (!hasCoords) {
    return (
      <div className={`p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs flex items-center gap-2.5 ${className}`}>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Sin coordenadas geográficas registradas</span>
      </div>
    )
  }

  const formatted = formatCoordinates(latitude, longitude, 6)
  const gmapsUrl = getGoogleMapsUrl(latitude as number, longitude as number)

  return (
    <div className={`space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Coordenadas:</span>
          <span className="font-mono text-xs text-brand-navy bg-gray-100 px-2.5 py-1 rounded-md">
            {formatted}
          </span>
          {accuracy && accuracy > 0 && (
            <span className="text-[11px] font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
              ±{accuracy} m
            </span>
          )}
        </div>

        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <span>Abrir en Google Maps</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {showMap && (
        <MapView
          latitude={latitude}
          longitude={longitude}
          accuracy={accuracy}
          interactive={false}
          height={mapHeight}
        />
      )}
    </div>
  )
}


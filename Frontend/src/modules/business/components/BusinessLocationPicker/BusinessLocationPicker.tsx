import React, { useState, useEffect } from 'react'
import { MapView } from '../../../../components/map/MapView'
import { getCurrentLocation } from '../../../../lib/geolocation'
import {
  isValidCoordinates,
  isValidLatitude,
  isValidLongitude,
  parseCoordinatePair,
  getGoogleMapsUrl,
} from '../../utils/geo'

export interface BusinessLocationPickerProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  accuracy: number | null | undefined
  onChange: (coords: { latitude: number | null; longitude: number | null; accuracy: number | null }) => void
  errors?: {
    latitude?: string
    longitude?: string
    coordinates?: string
  }
}

export const BusinessLocationPicker: React.FC<BusinessLocationPickerProps> = ({
  latitude,
  longitude,
  accuracy,
  onChange,
  errors = {},
}) => {
  const [latInput, setLatInput] = useState<string>(
    latitude !== null && latitude !== undefined ? String(latitude) : '',
  )
  const [lngInput, setLngInput] = useState<string>(
    longitude !== null && longitude !== undefined ? String(longitude) : '',
  )
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (latitude !== null && latitude !== undefined) {
      setLatInput(String(latitude))
    } else {
      setLatInput('')
    }
  }, [latitude])

  useEffect(() => {
    if (longitude !== null && longitude !== undefined) {
      setLngInput(String(longitude))
    } else {
      setLngInput('')
    }
  }, [longitude])

  const hasCoords = isValidCoordinates(latitude, longitude)

  const handleUseMyLocation = async () => {
    setIsLocating(true)
    setLocationError(null)

    try {
      const result = await getCurrentLocation()
      const lat = Number(result.latitude.toFixed(7))
      const lng = Number(result.longitude.toFixed(7))

      setLatInput(String(lat))
      setLngInput(String(lng))

      onChange({
        latitude: lat,
        longitude: lng,
        accuracy: result.accuracy,
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocationError(err.message)
      } else {
        setLocationError('No fue posible obtener tu ubicación actual.')
      }
    } finally {
      setIsLocating(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    const parsed = parseCoordinatePair(text)

    if (parsed) {
      e.preventDefault()
      const lat = Number(parsed.latitude.toFixed(7))
      const lng = Number(parsed.longitude.toFixed(7))

      setLatInput(String(lat))
      setLngInput(String(lng))
      setLocationError(null)

      onChange({
        latitude: lat,
        longitude: lng,
        accuracy: null,
      })
    }
  }

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLatInput(val)

    const parsedLat = parseFloat(val)
    const parsedLng = parseFloat(lngInput)

    if (val.trim() === '' && lngInput.trim() === '') {
      onChange({ latitude: null, longitude: null, accuracy: null })
      return
    }

    if (isValidLatitude(parsedLat) && isValidLongitude(parsedLng)) {
      onChange({
        latitude: Number(parsedLat.toFixed(7)),
        longitude: Number(parsedLng.toFixed(7)),
        accuracy: null,
      })
    }
  }

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLngInput(val)

    const parsedLat = parseFloat(latInput)
    const parsedLng = parseFloat(val)

    if (val.trim() === '' && latInput.trim() === '') {
      onChange({ latitude: null, longitude: null, accuracy: null })
      return
    }

    if (isValidLatitude(parsedLat) && isValidLongitude(parsedLng)) {
      onChange({
        latitude: Number(parsedLat.toFixed(7)),
        longitude: Number(parsedLng.toFixed(7)),
        accuracy: null,
      })
    }
  }

  const handleMapPinChange = (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(7))
    const roundedLng = Number(lng.toFixed(7))

    setLatInput(String(roundedLat))
    setLngInput(String(roundedLng))
    setLocationError(null)

    onChange({
      latitude: roundedLat,
      longitude: roundedLng,
      accuracy: null,
    })
  }

  const handleClearLocation = () => {
    setLatInput('')
    setLngInput('')
    setLocationError(null)
    onChange({ latitude: null, longitude: null, accuracy: null })
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="font-semibold text-brand-navy text-base flex items-center gap-2">
            <span>Ubicación geográfica</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Opcional
            </span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Ubica el negocio en el mapa para facilitar que los turistas lleguen con facilidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLocating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Obteniendo ubicación...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Usar mi ubicación actual</span>
              </>
            )}
          </button>

          {hasCoords && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              title="Quitar coordenadas seleccionadas"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Quitar</span>
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">No se pudo obtener la ubicación</p>
            <p className="mt-0.5">{locationError}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <MapView
          latitude={hasCoords ? (latitude as number) : null}
          longitude={hasCoords ? (longitude as number) : null}
          accuracy={accuracy}
          interactive={true}
          onLocationChange={handleMapPinChange}
          height="280px"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500 px-1">
          <span>Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta.</span>
          {accuracy && accuracy > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Precisión GPS: ±{accuracy} m
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label htmlFor="geo-latitude" className="block text-xs font-semibold text-gray-700 mb-1">
            Latitud
          </label>
          <input
            id="geo-latitude"
            type="text"
            value={latInput}
            onChange={handleLatChange}
            onPaste={handlePaste}
            placeholder="Ej: 9.978712"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${
              errors.latitude ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'
            }`}
          />
          {errors.latitude && <p className="text-red-500 text-[11px] mt-1">{errors.latitude}</p>}
        </div>

        <div>
          <label htmlFor="geo-longitude" className="block text-xs font-semibold text-gray-700 mb-1">
            Longitud
          </label>
          <input
            id="geo-longitude"
            type="text"
            value={lngInput}
            onChange={handleLngChange}
            onPaste={handlePaste}
            placeholder="Ej: -85.251433"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${
              errors.longitude ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'
            }`}
          />
          {errors.longitude && <p className="text-red-500 text-[11px] mt-1">{errors.longitude}</p>}
        </div>
      </div>

      {errors.coordinates && (
        <p className="text-red-500 text-xs font-medium">{errors.coordinates}</p>
      )}

      {hasCoords && (
        <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-100">
          <span className="text-gray-500">
            Coordenadas fijadas: <strong className="text-gray-700">{latitude?.toFixed(6)}, {longitude?.toFixed(6)}</strong>
          </span>
          <a
            href={getGoogleMapsUrl(latitude as number, longitude as number)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Ver en Google Maps</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}


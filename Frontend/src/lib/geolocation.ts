export interface GeoPositionResult {
  latitude: number
  longitude: number
  accuracy: number
}

export function getCurrentLocation(): Promise<GeoPositionResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no soporta geolocalización.'))
      return
    }

    if (
      typeof window !== 'undefined' &&
      window.isSecureContext === false &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      reject(new Error('La geolocalización requiere una conexión segura (HTTPS).'))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        })
      },
      (error) => {
        let message = 'Ocurrió un error al obtener la ubicación.'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso denegado. Habilita el acceso a tu ubicación en el navegador.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'La ubicación no está disponible en este momento. Revisa tu GPS o conexión.'
        } else if (error.code === error.TIMEOUT) {
          message = 'Se agotó el tiempo de espera para obtener la ubicación. Inténtalo de nuevo.'
        }
        reject(new Error(message))
      },
      options,
    )
  })
}


import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import {
  DEFAULT_COORDINATES,
  DEFAULT_ZOOM,
  MAP_BASE_LAYERS,
  createCategoryMarkerIcon,
  createUserLocationIcon,
  type MapBaseLayerKey,
} from '../../../../components/map/leafletConfig'
import { getCurrentLocation } from '../../../../lib/geolocation'
import type { Business } from '../../../../content/types'
import type { BusinessCategory, DistrictKey } from '../../types/business.types'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'

export interface MappableBusiness extends Business {
  latitude: number
  longitude: number
}

interface BusinessesMapProps {
  businesses: MappableBusiness[]
  activeCategory?: BusinessCategory | ''
  preview?: boolean
  height?: string
  className?: string
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function directionLink(label: string, href: string, className: string): HTMLAnchorElement {
  const link = el('a', className, label)
  link.href = href
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  return link
}


const NANDAYURE_VIEW_ZOOM = 11

function buildPopup(business: MappableBusiness, onOpenDetail: (path: string) => void): HTMLElement {
  const { latitude: lat, longitude: lng } = business
  const root = el('div', 'flex flex-col')

  if (business.coverImageUrl) {
    const img = el('img', 'h-32 w-full object-cover')
    img.src = business.coverImageUrl
    img.alt = business.businessName
    img.loading = 'lazy'
    root.appendChild(img)
  }

  const body = el('div', 'flex flex-col gap-1.5 p-3.5')

  const categories = (business.categories ?? [])
    .map((c) => CATEGORY_LABELS[c as BusinessCategory])
    .filter(Boolean)
    .join(' · ')
  if (categories) body.appendChild(el('span', 'text-[11px] font-bold uppercase tracking-wide text-brand-green', categories))

  body.appendChild(el('strong', 'text-base leading-tight text-brand-navy', business.businessName))

  const district = DISTRICT_LABELS[business.district as DistrictKey]
  if (district) body.appendChild(el('span', 'text-xs font-semibold text-brand-ink/70', `Distrito de ${district}`))
  if (business.address) body.appendChild(el('span', 'text-xs text-brand-ink/70', business.address))
  if (business.scheduleText) {
    body.appendChild(el('span', 'whitespace-pre-line text-xs text-brand-ink/60', business.scheduleText))
  }

  if (business.phone) {
    const phone = el('a', 'text-xs font-semibold text-brand-teal hover:underline', business.phone)
    phone.href = `tel:${business.phone.replace(/[^\d+]/g, '')}`
    body.appendChild(phone)
  }

  const detail = el(
    'a',
    'mt-1 rounded-lg border border-brand-navy/25 px-3 py-2 text-center text-xs font-semibold !text-brand-navy no-underline transition-colors hover:border-brand-navy',
    'Ver ficha del negocio',
  )
  const detailPath = `/negocios/${business.slug || business.id}`
  detail.href = detailPath
  detail.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    onOpenDetail(detailPath)
  })
  body.appendChild(detail)

  const directions = el('div', 'mt-1.5 flex flex-col gap-1.5 border-t border-brand-navy/10 pt-2.5')
  directions.appendChild(el('span', 'text-[11px] font-bold uppercase tracking-wide text-brand-navy/60', 'Cómo llegar'))
  const buttons = el('div', 'grid grid-cols-2 gap-2')
  const buttonClass =
    'rounded-lg bg-brand-navy px-3 py-2 text-center text-xs font-semibold !text-white no-underline transition-colors hover:bg-brand-navy-soft'
  buttons.appendChild(
    directionLink('Google Maps', `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, buttonClass),
  )
  buttons.appendChild(directionLink('Waze', `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, buttonClass))
  directions.appendChild(buttons)
  body.appendChild(directions)

  root.appendChild(body)
  return root
}

export function BusinessesMap({
  businesses,
  activeCategory = '',
  preview = false,
  height = '560px',
  className = '',
}: BusinessesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const userLayerRef = useRef<L.LayerGroup | null>(null)
  const hasFittedRef = useRef(false)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)


  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      center: DEFAULT_COORDINATES,
      zoom: DEFAULT_ZOOM,
      zoomControl: !preview,
      dragging: !preview,
      touchZoom: !preview,
      doubleClickZoom: !preview,
      scrollWheelZoom: !preview,
      boxZoom: !preview,
      keyboard: !preview,
      attributionControl: true,
    })

    const baseLayers = {} as Record<string, L.TileLayer>
    ;(Object.keys(MAP_BASE_LAYERS) as MapBaseLayerKey[]).forEach((key) => {
      const config = MAP_BASE_LAYERS[key]
      baseLayers[config.label] = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        ...(config.subdomains ? { subdomains: config.subdomains } : {}),
      })
    })
    baseLayers[MAP_BASE_LAYERS.streets.label].addTo(map)

    if (!preview) {
      L.control.layers(baseLayers, undefined, { position: 'topright', collapsed: true }).addTo(map)
    }

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
    })
    map.addLayer(cluster)

    clusterRef.current = cluster
    userLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const timer = setTimeout(() => map.invalidateSize(), 150)

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      clusterRef.current = null
      userLayerRef.current = null
      hasFittedRef.current = false
    }
  }, [preview])


  useEffect(() => {
    const map = mapRef.current
    const cluster = clusterRef.current
    if (!map || !cluster) return

    cluster.clearLayers()

    const markers = businesses.map((business) => {
      const categories = (business.categories ?? []) as BusinessCategory[]
      const iconCategory =
        activeCategory && categories.includes(activeCategory) ? activeCategory : categories[0]

      const marker = L.marker([business.latitude, business.longitude], {
        icon: createCategoryMarkerIcon(iconCategory),
        title: business.businessName,
        interactive: !preview,
        keyboard: !preview,
      })
      if (!preview) {
        marker.bindPopup(
          () =>
            buildPopup(business, (path) =>
              navigateRef.current(path, { state: { from: 'map' } }),
            ),
          {
          className: 'business-popup',
          minWidth: 260,
          maxWidth: 260,
          autoPanPadding: [24, 24],
        })
      }
      return marker
    })
    cluster.addLayers(markers)

    if (markers.length > 0) {
      const bounds = L.latLngBounds(businesses.map((b) => [b.latitude, b.longitude] as [number, number]))
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: hasFittedRef.current })
      hasFittedRef.current = true
    } else {
      map.setView(DEFAULT_COORDINATES, DEFAULT_ZOOM)
    }
  }, [businesses, activeCategory, preview])

  const handleCenter = () => {
    mapRef.current?.flyTo(DEFAULT_COORDINATES, NANDAYURE_VIEW_ZOOM, { duration: 0.8 })
  }

  const handleLocate = async () => {
    const map = mapRef.current
    const userLayer = userLayerRef.current
    if (!map || !userLayer) return

    setLocating(true)
    setLocateError(null)
    try {
      const { latitude, longitude, accuracy } = await getCurrentLocation()
      userLayer.clearLayers()
      L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#1a73e8',
        weight: 1,
        fillColor: '#1a73e8',
        fillOpacity: 0.12,
      }).addTo(userLayer)
      L.marker([latitude, longitude], { icon: createUserLocationIcon(), interactive: false, keyboard: false }).addTo(userLayer)
      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), { duration: 1 })
    } catch (error) {
      setLocateError(error instanceof Error ? error.message : 'No se pudo obtener tu ubicación.')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ height }}>
      <div ref={containerRef} className="h-full w-full" role={preview ? 'img' : 'region'} aria-label="Mapa de negocios afiliados" />

      {!preview && (
        <div className="absolute bottom-6 left-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-2">
          {locateError && (
            <div
              role="alert"
              className="flex max-w-sm items-start gap-2 rounded-lg bg-white px-3 py-2 text-xs text-red-700 shadow-lg ring-1 ring-red-200"
            >
              <span>{locateError}</span>
              <button
                type="button"
                onClick={() => setLocateError(null)}
                className="cursor-pointer font-bold text-red-700/70 hover:text-red-700"
                aria-label="Cerrar aviso"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLocate}
              disabled={locating}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-lg ring-1 ring-brand-navy/15 transition-colors hover:bg-brand-sand disabled:cursor-wait disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {locating ? 'Buscando…' : 'Mi ubicación'}
            </button>
              <button
              type="button"
              onClick={handleCenter}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-lg ring-1 ring-brand-navy/15 transition-colors hover:bg-brand-sand disabled:cursor-wait disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11 22 2l-9 19-2-8z" />
              </svg>
              Centrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


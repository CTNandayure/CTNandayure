import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { getCategoryColor } from '../../../components/map/leafletConfig'
import { Alert, Button, Container, SectionHeading, Select } from '../../../components/ui'
import { useBusinesses } from '../../../content/businesses'
import { cn } from '../../../lib/cn'
import { BusinessesMap, type MappableBusiness } from '../components/BusinessesMap/BusinessesMap'
import type { BusinessCategory, DistrictKey } from '../types/business.types'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../utils/constants'
import { isValidCoordinates } from '../utils/geo'

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as BusinessCategory[]
const DISTRICT_KEYS = Object.keys(DISTRICT_LABELS) as DistrictKey[]

const parseCategory = (value: string | null): BusinessCategory | '' =>
  CATEGORY_KEYS.includes(value as BusinessCategory) ? (value as BusinessCategory) : ''
const parseDistrict = (value: string | null): DistrictKey | '' =>
  DISTRICT_KEYS.includes(value as DistrictKey) ? (value as DistrictKey) : ''

export default function MapPage() {
  // Filters live in the URL so a filtered map can be shared or reloaded.
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const category = parseCategory(searchParams.get('category'))
  const district = parseDistrict(searchParams.get('district'))

  const { data: businesses, status } = useBusinesses()

  // Only active businesses that have a location can be pinned (the public endpoint already returns active ones).
  const mappable = useMemo(
    () => businesses.filter((b): b is MappableBusiness => isValidCoordinates(b.latitude, b.longitude)),
    [businesses],
  )
  const withoutLocation = businesses.length - mappable.length

  const inDistrict = useMemo(
    () => (district ? mappable.filter((b) => b.district === district) : mappable),
    [mappable, district],
  )
  const visible = useMemo(
    () => (category ? inDistrict.filter((b) => (b.categories ?? []).includes(category)) : inDistrict),
    [inDistrict, category],
  )

  // Counts respect the district filter so a chip never promises pins that are not there.
  const countFor = (key: BusinessCategory) => inDistrict.filter((b) => (b.categories ?? []).includes(key)).length

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const hasFilters = Boolean(category || district)

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <main>
        <section className="border-b border-brand-navy/10 bg-white py-10 md:py-14">
          <Container className="flex flex-col gap-6">
            <div>
              <Button onClick={() => navigate('/#mapa')} variant="text">
                ← Volver al inicio
              </Button>
            </div>
            <SectionHeading
              eyebrow="Mapa"
              eyebrowColor="green"
              title="Mapa de negocios afiliados"
              lede="Ubique hospedajes, restaurantes, tours y comercios de Nandayure, vea cómo llegar y cambie entre vista de calles, satélite o relieve."
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
                <button
                  type="button"
                  onClick={() => setParam('category', '')}
                  className={cn(
                    'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    category === ''
                      ? 'bg-brand-navy text-white'
                      : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                  )}
                >
                  Todas ({inDistrict.length})
                </button>
                {CATEGORY_KEYS.map((key) => {
                  const active = category === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setParam('category', active ? '' : key)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-brand-navy text-white'
                          : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(key) }}
                        aria-hidden="true"
                      />
                      {CATEGORY_LABELS[key]} ({countFor(key)})
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Select
                  value={district}
                  onChange={(event) => setParam('district', event.target.value)}
                  aria-label="Filtrar por distrito"
                  className="md:max-w-[220px]"
                >
                  <option value="">Todos los distritos</option>
                  {DISTRICT_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {DISTRICT_LABELS[key]}
                    </option>
                  ))}
                </Select>
                {hasFilters && (
                  <Button variant="text" onClick={() => setSearchParams({}, { replace: true })}>
                    Quitar filtros
                  </Button>
                )}
                {status === 'ready' && (
                  <span className="text-sm text-brand-ink/60 md:ml-auto" aria-live="polite">
                    {visible.length === 1 ? '1 negocio en el mapa' : `${visible.length} negocios en el mapa`}
                  </span>
                )}
              </div>
            </div>
          </Container>
        </section>

        <Container className="flex flex-col gap-4 py-8 md:py-12">
          {status === 'loading' && <p className="text-brand-ink/60">Cargando negocios…</p>}

          {status === 'error' && (
            <Alert variant="error" title="No se pudo cargar el mapa">
              Revise su conexión e intente recargar la página.
            </Alert>
          )}

          {status === 'ready' && (
            <>
              {mappable.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-10 text-center text-brand-ink/60">
                  Todavía no hay negocios con ubicación registrada. ¡Vuelva pronto!
                </div>
              ) : (
                <>
                  <BusinessesMap
                    businesses={visible}
                    activeCategory={category}
                    height="clamp(420px, 70vh, 720px)"
                    className="rounded-2xl border border-brand-navy/10 shadow-sm"
                  />
                  {visible.length === 0 && (
                    <p className="text-sm text-brand-ink/60">No hay negocios con esos filtros. Pruebe con otra categoría o distrito.</p>
                  )}
                </>
              )}
              {withoutLocation > 0 && (
                <p className="text-xs text-brand-ink/50">
                  {withoutLocation === 1
                    ? '1 negocio afiliado aún no ha registrado su ubicación y no aparece en el mapa.'
                    : `${withoutLocation} negocios afiliados aún no han registrado su ubicación y no aparecen en el mapa.`}
                </p>
              )}
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}


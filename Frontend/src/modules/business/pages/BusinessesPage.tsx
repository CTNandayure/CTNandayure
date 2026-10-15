import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { Alert, Button, Container, Input, SectionHeading, Select } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { useBusinesses } from '../../../content/businesses'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../utils/constants'
import type { BusinessCategory, DistrictKey, PublicBusiness } from '../types/business.types'
import { BusinessCard } from '../components/BusinessCard/BusinessCard'

const DISTRICT_OPTIONS = Object.keys(DISTRICT_LABELS) as DistrictKey[]
const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as BusinessCategory[]

export default function BusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const districtParam = searchParams.get('district') ?? ''
  const categoryParam = searchParams.get('category') ?? ''
  const qParam = searchParams.get('q') ?? ''

  const [searchText, setSearchText] = useState(qParam)
  const { data: businesses, status } = useBusinesses()

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

  useEffect(() => {
    const trimmed = searchText.trim()
    if (trimmed === qParam) return
    const timer = setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (trimmed) next.set('q', trimmed)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, 350)
    return () => clearTimeout(timer)
  }, [searchText, qParam, setSearchParams])

  const hasFilters = Boolean(districtParam || categoryParam || qParam)

  const clearFilters = () => {
    setSearchText('')
    setSearchParams({}, { replace: true })
  }

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (districtParam && b.district !== districtParam) {
        return false
      }
      if (categoryParam && !(b.categories as BusinessCategory[])?.includes(categoryParam as BusinessCategory)) {
        return false
      }
      if (qParam) {
        const query = qParam.toLowerCase()
        const matchesName = b.businessName.toLowerCase().includes(query)
        const matchesDesc = (b.description || '').toLowerCase().includes(query)
        if (!matchesName && !matchesDesc) {
          return false
        }
      }
      return true
    })
  }, [businesses, districtParam, categoryParam, qParam])

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <main>
        <section className="border-b border-brand-navy/10 bg-white py-12 md:py-16">
          <Container className="flex flex-col gap-8">
            <Button href="/#negocios" variant="text" className="w-fit">
              ← Volver al directorio de negocios
            </Button>

            <SectionHeading
              eyebrow="Directorio"
              eyebrowColor="green"
              title="Negocios afiliados en Nandayure"
              lede="Conozca los comercios, servicios y emprendimientos locales que impulsan el turismo en los seis distritos del cantón."
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setParam('district', '')}
                  className={cn(
                    'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    districtParam === ''
                      ? 'bg-brand-navy text-white'
                      : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                  )}
                >
                  Todos los distritos
                </button>
                {DISTRICT_OPTIONS.map((districtKey) => (
                  <button
                    key={districtKey}
                    type="button"
                    onClick={() => setParam('district', districtKey)}
                    className={cn(
                      'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      districtParam === districtKey
                        ? 'bg-brand-navy text-white'
                        : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                    )}
                  >
                    {DISTRICT_LABELS[districtKey]}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Buscar por nombre o descripción"
                  aria-label="Buscar negocios"
                  className="md:max-w-sm"
                />

                <Select
                  value={categoryParam}
                  onChange={(event) => setParam('category', event.target.value)}
                  aria-label="Filtrar por categoría"
                  className="md:max-w-[220px]"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORY_OPTIONS.map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {CATEGORY_LABELS[catKey]}
                    </option>
                  ))}
                </Select>

                {hasFilters && (
                  <Button variant="text" onClick={clearFilters}>
                    Quitar filtros
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          {status === 'loading' && <p className="text-brand-ink/60">Cargando negocios…</p>}

          {status === 'error' && (
            <Alert variant="error" title="No se pudieron cargar los negocios">
              Revise su conexión e intente recargar la página.
            </Alert>
          )}

          {status === 'ready' && filteredBusinesses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-10 text-center text-brand-ink/60">
              {hasFilters
                ? 'No encontramos negocios con los filtros seleccionados.'
                : 'Todavía no hay negocios afiliados activos registrados. ¡Vuelva pronto!'}
            </div>
          )}

          {status === 'ready' && filteredBusinesses.length > 0 && (
            <>
              <p className="mb-6 text-sm text-brand-ink/60">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'negocio afiliado encontrado' : 'negocios afiliados encontrados'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business as PublicBusiness} />
                ))}
              </div>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}


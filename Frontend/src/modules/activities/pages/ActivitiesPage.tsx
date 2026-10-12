import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { Alert, Button, Container, Input, SectionHeading, Select } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { DistrictKey } from '../../business/types/business.types'
import { DISTRICT_LABELS } from '../../business/utils/constants'
import { ActivityCard } from '../components/ActivityCard/ActivityCard'
import { usePublicActivities } from '../hooks/usePublicActivities'
import type { ActivityCategory } from '../types/activity.types'
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../utils/activityLabels'

const DISTRICT_OPTIONS = Object.keys(DISTRICT_LABELS) as DistrictKey[]

const parseCategory = (value: string | null): ActivityCategory | '' =>
  CATEGORY_OPTIONS.includes(value as ActivityCategory) ? (value as ActivityCategory) : ''
const parseDistrict = (value: string | null): DistrictKey | '' =>
  DISTRICT_OPTIONS.includes(value as DistrictKey) ? (value as DistrictKey) : ''

export default function ActivitiesPage() {
  // Filters live in the URL so a filtered list can be shared or reloaded.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = parseCategory(searchParams.get('category'))
  const district = parseDistrict(searchParams.get('district'))
  const q = searchParams.get('q') ?? ''

  const [searchText, setSearchText] = useState(q)
  const { data: activities, status } = usePublicActivities({
    category: category || undefined,
    district: district || undefined,
    q: q || undefined,
  })

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

  // Wait for a pause in typing before querying.
  useEffect(() => {
    const trimmed = searchText.trim()
    if (trimmed === q) return
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
  }, [searchText, q, setSearchParams])

  const hasFilters = Boolean(category || district || q)
  const clearFilters = () => {
    setSearchText('')
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <main>
        <section className="border-b border-brand-navy/10 bg-white py-12 md:py-16">
          <Container className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Qué hacer"
              eyebrowColor="green"
              title="Actividades en Nandayure"
              lede="Experiencias que ofrecen los negocios afiliados a la Cámara: surf, senderismo, cultura, agroturismo, gastronomía y más."
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {(['', ...CATEGORY_OPTIONS] as const).map((option) => (
                  <button
                    key={option || 'all'}
                    type="button"
                    onClick={() => setParam('category', option)}
                    className={cn(
                      'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      category === option
                        ? 'bg-brand-navy text-white'
                        : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                    )}
                  >
                    {option === '' ? 'Todas' : option === 'OTHER' ? 'Otras' : CATEGORY_LABELS[option]}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Buscar por nombre o descripción"
                  aria-label="Buscar actividades"
                  className="md:max-w-sm"
                />
                <Select
                  value={district}
                  onChange={(event) => setParam('district', event.target.value)}
                  aria-label="Filtrar por distrito"
                  className="md:max-w-[220px]"
                >
                  <option value="">Todos los distritos</option>
                  {DISTRICT_OPTIONS.map((key) => (
                    <option key={key} value={key}>
                      {DISTRICT_LABELS[key]}
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
          {status === 'loading' && <p className="text-brand-ink/60">Cargando actividades…</p>}

          {status === 'error' && (
            <Alert variant="error" title="No se pudieron cargar las actividades">
              Revise su conexión e intente recargar la página.
            </Alert>
          )}

          {status === 'ready' && activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-10 text-center text-brand-ink/60">
              {hasFilters
                ? 'No encontramos actividades con esos filtros.'
                : 'Todavía no hay actividades publicadas. ¡Vuelva pronto!'}
            </div>
          )}

          {status === 'ready' && activities.length > 0 && (
            <>
              <p className="mb-6 text-sm text-brand-ink/60">
                {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
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

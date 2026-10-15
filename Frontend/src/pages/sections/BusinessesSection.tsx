import { useMemo, useState } from 'react'
import { Button, Container, SectionHeading } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useBusinesses } from '../../content/businesses'

import { DISTRICT_LABELS } from '../../modules/business/utils/constants'
import type { DistrictKey, PublicBusiness } from '../../modules/business/types/business.types'
import { BusinessCard } from '../../modules/business/components/BusinessCard/BusinessCard'

const DISTRICTS = ['Todos', 'CARMONA', 'SANTA_RITA', 'ZAPOTAL', 'SAN_PABLO', 'PORVENIR', 'BEJUCO']

export function BusinessesSection() {
  const { data: businesses } = useBusinesses()
  const [filter, setFilter] = useState('Todos')

  const filtered = useMemo(
    () => (filter === 'Todos' ? businesses : businesses.filter((b) => b.district === filter)),
    [businesses, filter],
  )

  return (
    <section id="negocios" className="bg-brand-paper py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Directorio"
            title="Negocios afiliados por distrito"
            lede="Filtrá por distrito para ver los negocios afiliados a la Cámara: hospedaje, alimentación, transporte, artesanías, tours y comercio local."
          />
          <Button href="/negocios" variant="navy">
            Ver todos los negocios
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-brand-navy/15 pb-1">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={cn(
                '-mb-px border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
                filter === d ? 'border-brand-green text-brand-navy' : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              {d === 'Todos' ? 'Todos' : DISTRICT_LABELS[d as DistrictKey]}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-10 text-center text-brand-ink/60">
            No hay negocios afiliados registrados en este distrito en este momento.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BusinessCard key={b.id} business={b as PublicBusiness} />
            ))}
          </div>
        )}

        <p className="text-sm italic text-brand-ink/50">
          ¿Tenés un negocio en Nandayure?{' '}
          <Button href="/afiliacion" variant="text">
            Afiliate a la Cámara
          </Button>
        </p>
      </Container>
    </section>
  )
}

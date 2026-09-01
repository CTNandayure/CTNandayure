import { useMemo, useState } from 'react'
import { Alert, Button, Container, SectionHeading } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useBusinesses } from '../../content/businesses'

const DISTRICTS = ['Todos', 'Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir', 'Bejuco']

export function BusinessesSection() {
  const { data: businesses } = useBusinesses()
  const [filter, setFilter] = useState('Todos')

  const filtered = useMemo(
    () => (filter === 'Todos' ? businesses : businesses.filter((b) => b.district === filter)),
    [businesses, filter],
  )

  return (
    <section id="negocios" className="bg-brand-sand py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Directorio"
          title="Negocios afiliados por distrito"
          lede="Filtrá por distrito para ver los negocios afiliados a la Cámara: hospedaje, alimentación, transporte, artesanías, tours y comercio local."
        />

        <Alert variant="info" className="max-w-2xl">
          <strong>Bejuco</strong> concentra casi la mitad del territorio de Nandayure y prácticamente toda la costa del
          cantón, por eso reúne la mayor parte de la oferta turística costera.
        </Alert>

        <div className="flex flex-wrap gap-2 border-b border-brand-navy/15 pb-1">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={cn(
                '-mb-px border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors',
                filter === d ? 'border-brand-green text-brand-navy' : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-brand-navy/15 bg-brand-navy/15 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.id} className="flex flex-col bg-white transition-colors hover:bg-brand-paper">
              <div className="flex aspect-[4/3] items-end bg-brand-teal p-4 text-xs font-semibold uppercase tracking-wide text-white">
                {b.category}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-brand-navy">{b.name}</span>
                  <span className="flex-none text-[11px] font-semibold uppercase tracking-wide text-brand-teal">{b.district}</span>
                </div>
                <p className="text-sm text-brand-ink/70">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm italic text-brand-ink/50">
          *Directorio de ejemplo. ¿Tenés un negocio en Nandayure?{' '}
          <Button href="/afiliacion" variant="text">
            Afiliate a la Cámara
          </Button>
        </p>
      </Container>
    </section>
  )
}

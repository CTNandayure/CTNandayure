import { useMemo } from 'react'
import { Button, Container, SectionHeading } from '../../components/ui'
import { BusinessesMap, type MappableBusiness } from '../../modules/business/components/BusinessesMap/BusinessesMap'
import { isValidCoordinates } from '../../modules/business/utils/geo'
import { useBusinesses } from '../../content/businesses'

export function MapSection() {
  const { data: businesses } = useBusinesses()

  const mappable = useMemo(
    () => businesses.filter((b): b is MappableBusiness => isValidCoordinates(b.latitude, b.longitude)),
    [businesses],
  )

  return (
    <section id="mapa" className="bg-white py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Mapa"
            eyebrowColor="green"
            title="Explora el mapa de negocios"
            lede="Encuentra hospedajes, restaurantes, tours y comercios afiliados directamente sobre el mapa de Nandayure, descubre qué hay cerca de ti y llega con Waze o Google Maps."
          />
          <ul className="flex flex-col gap-2 text-sm text-brand-ink/75">
            <li>• Filtra por categoría y por distrito</li>
            <li>• Cambia entre calles, satélite y relieve</li>
            <li>• Ubícate en el mapa con un solo toque</li>
          </ul>
          <div>
            <Button href="/mapa" variant="navy">
              Abrir el mapa de negocios
            </Button>
          </div>
        </div>

        <a
          href="/mapa"
          aria-label="Abrir el mapa de negocios"
          className="group relative block overflow-hidden rounded-2xl border border-brand-navy/10 shadow-md transition-shadow hover:shadow-xl"
        >
          <BusinessesMap businesses={mappable} preview height="clamp(280px, 40vw, 420px)" />
          {/* Transparent layer so the whole preview is one click target for /mapa. */}
          <span className="absolute inset-0 z-[500] cursor-pointer" aria-hidden="true" />
        </a>
      </Container>
    </section>
  )
}


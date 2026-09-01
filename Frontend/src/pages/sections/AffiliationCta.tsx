import { Button, Container } from '../../components/ui'

export function AffiliationCta() {
  return (
    <section id="afiliese" className="bg-brand-green py-14 text-white">
      <Container className="flex flex-wrap items-center justify-between gap-8">
        <div>
          <h2 className="max-w-lg text-2xl font-bold md:text-3xl">¿Tenés un negocio turístico en Nandayure?</h2>
          <p className="mt-2 max-w-lg text-white/85">
            Sume su negocio a la red de la Cámara y forme parte del desarrollo turístico del cantón.
          </p>
        </div>
        <Button href="/afiliacion" variant="primary" className="bg-brand-navy hover:bg-brand-navy-soft">
          Afiliar mi negocio
        </Button>
      </Container>
    </section>
  )
}

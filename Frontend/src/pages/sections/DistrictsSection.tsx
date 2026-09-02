import { Badge, Card, Container, SectionHeading } from '../../components/ui'
import { useDistricts } from '../../content/districts'

export function DistrictsSection() {
  const { data: districts } = useDistricts()

  return (
    <section id="distritos" className="bg-brand-paper py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Explore por distrito"
          title="Cada distrito, una experiencia distinta"
          lede="Desde playas del Pacífico hasta fincas de montaña: seis distritos, seis formas de vivir Nandayure."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <Card key={d.slug}>
              {d.imageUrl ? (
                <img src={d.imageUrl} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-brand-sand text-center text-xs uppercase tracking-wide text-brand-ink/40">
                  Foto — {d.name}
                </div>
              )}
              <div className="flex flex-col gap-2.5 p-5">
                <Badge color={d.tagColor}>{d.tag}</Badge>
                <h3 className="text-lg font-bold text-brand-navy">{d.name}</h3>
                <p className="text-sm leading-relaxed text-brand-ink/70">{d.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

import { Container, SectionHeading } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'

export function AboutSection() {
  const { data: info, status } = useInstitutionalInfo()

  return (
    <section id="quienes-somos" className="bg-white py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Quiénes somos"
          eyebrowColor="green"
          title={status === 'ready' && info ? info.aboutTitle : 'Cargando…'}
        />

        {status === 'error' && (
          <p className="text-sm text-red-600">No se pudo cargar la información institucional. Intentá recargar la página.</p>
        )}

        {status === 'ready' && info && (
          <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-4">
              {info.historyText.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-brand-ink/70">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {info.aboutImageUrl ? (
                <img src={info.aboutImageUrl} alt="" className="h-56 w-full rounded-2xl object-cover" />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-brand-sand text-xs uppercase tracking-wide text-brand-ink/40">
                  Foto — comunidad y paisaje de Nandayure
                </div>
              )}
              <p className="text-base leading-relaxed text-brand-ink/70">{info.aboutText}</p>
              <div className="flex flex-wrap gap-2.5">
                {['6 distritos', '565 km² de territorio', 'Playas y montaña', 'Negocios locales afiliados'].map((fact) => (
                  <span key={fact} className="rounded-full bg-brand-green/10 px-3.5 py-2 text-xs font-semibold text-brand-navy">
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}

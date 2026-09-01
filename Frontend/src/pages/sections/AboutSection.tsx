import { Container, SectionHeading } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'

export function AboutSection() {
  const { data: info, status } = useInstitutionalInfo()

  return (
    <section id="quienes-somos" className="bg-white py-16 md:py-24">
      <Container className="grid gap-12 md:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Quiénes somos" eyebrowColor="green" title={status === 'ready' && info ? info.aboutTitle : 'Cargando…'} />
          {status === 'ready' && info && info.aboutImageUrl && (
            <img src={info.aboutImageUrl} alt="" className="h-56 w-full rounded-2xl object-cover" />
          )}
          {status === 'ready' && info && !info.aboutImageUrl && (
            <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-brand-sand text-xs uppercase tracking-wide text-brand-ink/40">
              Foto — comunidad y paisaje de Nandayure
            </div>
          )}
          {status === 'ready' && info && <p className="text-base leading-relaxed text-brand-ink/70">{info.aboutText}</p>}
          {status === 'error' && (
            <p className="text-sm text-red-600">No se pudo cargar la información institucional. Intentá recargar la página.</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {status === 'ready' &&
            info &&
            info.historyText.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-brand-ink/70">
                {paragraph}
              </p>
            ))}
        </div>
      </Container>
    </section>
  )
}

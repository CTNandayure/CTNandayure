import { Container } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'

export function MissionVisionSection() {
  const { data: info, status } = useInstitutionalInfo()

  if (status !== 'ready' || !info) return null

  return (
    <section className="bg-brand-navy py-16 text-white md:py-24">
      <Container>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow">Misión y visión</span>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-brand-navy">
              M
            </div>
            <h4 className="mb-3 text-xl font-bold">Misión</h4>
            <p className="text-white/80">{info.missionText}</p>
          </div>
          <div>
            <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
              V
            </div>
            <h4 className="mb-3 text-xl font-bold">Visión</h4>
            <p className="text-white/80">{info.visionText}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

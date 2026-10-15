import { Container } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'
import type { InstitutionalInfo } from '../../content/types'
import { cn } from '../../lib/cn'

interface MissionVisionSectionProps {
  previewData?: Partial<InstitutionalInfo>
}

export function MissionVisionSection({ previewData }: MissionVisionSectionProps = {}) {
  const { data: dbInfo, status: dbStatus } = useInstitutionalInfo()
  const info = previewData ? ({ ...dbInfo, ...previewData } as InstitutionalInfo) : dbInfo
  const status = previewData ? 'ready' : dbStatus

  if (status !== 'ready' || !info) return null

  return (
    <section className={cn('bg-brand-navy py-16 text-white md:py-24', previewData && 'rounded-2xl shadow-sm')}>
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

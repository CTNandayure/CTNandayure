import { Container, SectionHeading } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon } from '../../components/ui/icons'

export function ContactSection() {
  const { data: info, status } = useInstitutionalInfo()

  return (
    <section id="contacto" className="bg-white py-16 md:py-24">
      <Container className="grid gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Contáctenos" title="Estamos en el corazón de Nandayure" />

          {status === 'ready' && info && (
            <div className="flex flex-col gap-4">
              <ContactRow icon={<PinIcon />}>{info.address}</ContactRow>
              <ContactRow icon={<PhoneIcon />}>{info.phone}</ContactRow>
              <ContactRow icon={<MailIcon />}>{info.email}</ContactRow>
              <ContactRow icon={<ClockIcon />}>{info.officeHours}</ContactRow>
            </div>
          )}

          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-white">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-white">
              <InstagramIcon />
            </a>
          </div>
        </div>

        {status === 'ready' && info && info.contactImageUrl ? (
          <img src={info.contactImageUrl} alt="" className="h-64 w-full rounded-2xl object-cover md:h-full" />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-brand-sand text-center text-xs uppercase tracking-wide text-brand-ink/40 md:h-full">
            Foto — ubicación de la oficina
          </div>
        )}
      </Container>
    </section>
  )
}

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-navy/5 text-brand-green">{icon}</div>
      <span className="text-[15px] leading-relaxed text-brand-ink/80">{children}</span>
    </div>
  )
}

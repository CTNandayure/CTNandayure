import { Button } from '../../components/ui'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'

export function Hero() {
  const { data: info } = useInstitutionalInfo()

  return (
    <section id="inicio" className="relative flex min-h-[560px] items-end overflow-hidden">
      {info?.heroImageUrl ? (
        <img src={info.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-start p-6"
          style={{ background: 'repeating-linear-gradient(135deg, #dfead9 0 22px, #cfe0c8 22px 44px)' }}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/70">Foto — vista aérea de Nandayure</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/25 to-brand-navy/90" />

      <div className="relative z-[1] flex max-w-2xl flex-col gap-5 px-6 py-16 md:px-16 md:py-20">
        <span className="w-fit rounded-full bg-brand-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-navy">
          Guanacaste, Costa Rica
        </span>
        <h1 className="text-4xl font-bold leading-[1.15] text-white md:text-6xl">
          Nandayure: playas, montaña y pueblos con identidad propia
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-white/90">
          Descubra los seis distritos del cantón, sus atractivos naturales y los negocios locales que hacen posible cada
          experiencia.
        </p>
        <div className="mt-2 flex flex-wrap gap-3.5">
          <Button href="/#distritos" variant="accent">
            Explorar los distritos
          </Button>
          <Button href="/afiliacion" variant="outlineOnDark">
            Afiliar mi negocio
          </Button>
        </div>
      </div>
    </section>
  )
}

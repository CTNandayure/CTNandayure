import { Button } from '../../components/ui'

const STATS = [
  { num: '1961', label: 'Ley N.º 2826 crea el cantón' },
  { num: '6', label: 'Distritos: Carmona, Santa Rita, Zapotal, San Pablo, Porvenir y Bejuco' },
  { num: '565 km²', label: 'De montaña, campiña y costa' },
  { num: '6', label: 'Playas principales, de Coyote a Camaronal' },
]

export function Hero() {
  return (
    <section id="inicio" className="pt-8 md:pt-14">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 md:grid-cols-[1.1fr_0.9fr] md:px-12">
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-teal">
            Cámara de Turismo · Cantón de Nandayure, Guanacaste
          </span>
          <h1 className="text-4xl font-bold leading-[1.06] text-brand-navy md:text-6xl">
            La costa que el turismo aún no encontró.
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-brand-ink/70">
            Seis distritos entre montaña y mar, en el extremo sur de la península de Nicoya: playas donde anidan
            tortugas marinas, un pueblo de artistas y caminos que todavía se recorren despacio.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button href="/#actividades" variant="primary">
              Ver actividades
            </Button>
            <Button href="/#negocios" variant="text">
              Negocios afiliados por distrito
            </Button>
          </div>
        </div>

        <div className="relative order-first mx-auto aspect-square w-full max-w-[280px] md:order-none md:max-w-[460px]">
          <div className="absolute right-[-8%] top-[-8%] h-[74%] w-[74%] rounded-full bg-brand-green" />
          <div className="absolute bottom-[-6%] left-[-4%] h-[56%] w-[56%] rounded-full bg-brand-teal" />
          <div className="absolute left-[30%] top-[38%] h-[20%] w-[20%] rounded-full bg-brand-yellow" />
          <div className="absolute inset-[8%] rounded-full border-[1.5px] border-dashed border-brand-navy/30" />
        </div>
      </div>

      <div className="mt-10 border-t border-brand-navy/10 md:mt-14">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-6 px-6 py-7 md:grid-cols-4 md:px-12">
          {STATS.map((stat, i) => (
            <div key={stat.label} className={i > 0 ? 'border-brand-navy/10 md:border-l md:pl-6' : ''}>
              <span className="block text-2xl font-bold text-brand-navy md:text-3xl">{stat.num}</span>
              <span className="mt-1.5 block text-sm text-brand-ink/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="-mt-px h-[26px] w-full">
        <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="block h-full w-full">
          <path
            d="M0,0 C 8,20 12,20 20,0 C 28,20 32,20 40,0 C 48,20 52,20 60,0 C 68,20 72,20 80,0 C 88,20 92,20 100,0 C 108,20 112,20 120,0 C 128,20 132,20 140,0 C 148,20 152,20 160,0 C 168,20 172,20 180,0 C 188,20 192,20 200,0 C 208,20 212,20 220,0 C 228,20 232,20 240,0 C 248,20 252,20 260,0 C 268,20 272,20 280,0 C 288,20 292,20 300,0 C 308,20 312,20 320,0 C 328,20 332,20 340,0 C 348,20 352,20 360,0 C 368,20 372,20 380,0 C 388,20 392,20 400,0 L400,0 L0,0 Z"
            fill="var(--color-brand-paper)"
          />
        </svg>
      </div>
    </section>
  )
}

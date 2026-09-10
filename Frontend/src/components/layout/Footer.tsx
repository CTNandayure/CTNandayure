import logo from '../../assets/logo.png'

const EXPLORE_LINKS = [
  { href: '/#distritos', label: 'Distritos' },
  { href: '/#actividades', label: 'Actividades' },
  { href: '/#negocios', label: 'Negocios afiliados' },
  { href: '/#noticias', label: 'Noticias' },
]

const CAMARA_LINKS = [
  { href: '/#quienes-somos', label: 'Quiénes somos' },
  { href: '/afiliacion', label: 'Afiliación' },
  { href: '/#contacto', label: 'Contacto' },
]

export function Footer() {
  return (
    <footer className="bg-brand-navy px-6 pb-7 pt-14 text-white/75 md:px-12">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-10 border-b border-white/10 pb-10 md:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <img src={logo} alt="Nandayure" className="h-8 w-auto self-start rounded bg-white p-1" />
          <p className="max-w-[280px] text-sm leading-relaxed">
            Impulsando el turismo rural y comunitario en los seis distritos del cantón.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white">Explorar</h5>
          {EXPLORE_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm hover:text-brand-yellow">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white">Cámara</h5>
          {CAMARA_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm hover:text-brand-yellow">
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2 pt-6 text-xs">
        <span>© 2026 Cámara de Turismo Rural y Comunitario de Nandayure.</span>
      </div>
    </footer>
  )
}

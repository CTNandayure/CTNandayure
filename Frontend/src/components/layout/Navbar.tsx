import { useState } from 'react'
import { Button } from '../ui/Button'
import { CloseIcon, MenuIcon } from '../ui/icons'
import logo from '../../assets/logo.png'
import { useAuth } from '../../modules/users/context/useAuth'
import { UserMenu } from '../../modules/users/components/UserMenu/UserMenu'

const NAV_LINKS = [
  { href: '/#quienes-somos', label: 'Nosotros' },
  { href: '/#distritos', label: 'Distritos' },
  { href: '/#actividades', label: 'Actividades' },
  { href: '/#negocios', label: 'Negocios' },
  { href: '/#noticias', label: 'Noticias' },
  { href: '/#contacto', label: 'Contacto' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-brand-navy">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-4 px-6 md:px-12">
        <a href="/#inicio" className="flex flex-none items-center gap-3">
          <img src={logo} alt="Nandayure" className="h-9 w-auto self-center rounded bg-white p-1" />
          <span className="hidden flex-col leading-tight xl:flex">
            <span className="text-[15px] font-bold text-white">Cámara de Turismo</span>
            <span className="text-[10px] font-medium tracking-wide text-brand-teal">RURAL Y COMUNITARIO · NANDAYURE</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-white/85 hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/afiliacion" variant="accent" size="sm">
            Afíliese
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="text-white lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-brand-navy px-6 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-3 text-base font-medium text-white/90"
            >
              {link.label}
            </a>
          ))}
          {!isAuthenticated && <Button href="/afiliacion" variant="accent" className="mt-4 justify-center">Afíliese</Button>}
                    {!isAuthenticated && <Button href="/users/login" variant="primary" className="mt-2 justify-center">Iniciar sesión</Button>}
          {isAuthenticated && <div className="mt-4"><UserMenu /></div>}
        </div>
      )}
    </header>
  )
}

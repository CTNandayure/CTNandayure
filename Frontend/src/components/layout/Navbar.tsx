import { useState } from 'react'
import { Button } from '../ui/Button'
import { CloseIcon, MenuIcon } from '../ui/icons'
import logo from '../../assets/logo.png'
import { useAuth } from '../../modules/users/context/useAuth'
import { UserMenu } from '../../modules/users/components/UserMenu/UserMenu'

const NAV_LINKS = [
  { href: '/#quienes-somos', label: 'Quiénes somos' },
  { href: '/#distritos', label: 'Distritos' },
  { href: '/#actividades', label: 'Actividades' },
  { href: '/#negocios', label: 'Negocios afiliados' },
  { href: '/#noticias', label: 'Noticias' },
  { href: '/#contacto', label: 'Contacto' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-brand-navy/10 bg-brand-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-6 md:px-12">
        <a href="/#inicio" className="flex-none">
          <img src={logo} alt="Nandayure" className="h-7 w-auto" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-brand-navy hover:text-brand-green">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? <UserMenu /> : <><Button href="/afiliacion" variant="accent">Afíliese</Button><Button href="/users/login" variant="primary">Iniciar sesión</Button></>}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="text-brand-navy lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-brand-navy/10 bg-brand-paper px-6 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-brand-navy/10 py-3 text-base font-medium text-brand-navy"
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

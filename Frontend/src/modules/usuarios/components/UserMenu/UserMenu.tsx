import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/useAuth'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  if (!user) return null
  const name = [user.person?.name, user.person?.first_lastname].filter(Boolean).join(' ') || user.email
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Abrir menú de usuario" className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-navy">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-white">{name.charAt(0).toUpperCase()}</span>
        <span className="max-w-32 truncate">{name}</span>
      </button>
      {open && <div className="absolute left-0 top-12 z-40 min-w-52 rounded-lg border border-brand-navy/10 bg-white p-2 shadow-xl sm:left-auto sm:right-0">
        <p className="border-b border-brand-navy/10 px-3 pb-2 text-xs text-brand-ink/60">{user.email}</p>
        <Link onClick={() => setOpen(false)} to="/usuarios/perfil" className="block rounded px-3 py-2 text-sm text-brand-navy hover:bg-brand-sand">Mi perfil</Link>
        <Link onClick={() => setOpen(false)} to="/usuarios/cambiar-contrasena" state={{ from: '/' }} className="block rounded px-3 py-2 text-sm text-brand-navy hover:bg-brand-sand">Cambiar contraseña</Link>
        <button type="button" onClick={logout} className="w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">Cerrar sesión</button>
      </div>}
    </div>
  )
}

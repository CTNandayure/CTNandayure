import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/cn'
import logo from '../../assets/logo.png'

const ADMIN_NAV = [
  {
    to: '/admin/informacion-institucional',
    label: 'Información institucional',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/admin/noticias',
    label: 'Noticias',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    to: '/admin/negocios',
    label: 'Negocios',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l2-4h14l2 4M3 7h18M3 7v13a1 1 0 001 1h16a1 1 0 001-1V7M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    to: '/admin/usuarios',
    label: 'Usuarios',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

export default function AdminLayout() {
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('admin_sidebar_pinned') === 'true'
  })
  const [isHovered, setIsHovered] = useState(false)

  const isExpanded = isPinned || isHovered

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev
      localStorage.setItem('admin_sidebar_pinned', String(next))
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-brand-paper">
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'sticky top-0 z-30 flex h-screen flex-none flex-col bg-brand-navy p-3 text-white transition-all duration-300 ease-in-out border-r border-brand-teal/20',
          isExpanded ? 'w-72 shadow-xl' : 'w-20',
        )}
      >
        <div className="mb-6 px-1 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-2">
            <div className={cn("flex flex-col", !isExpanded ? "items-center w-full" : "items-start")}>
              <img src={logo} alt="Nandayure" className="h-9 w-auto rounded bg-white p-1 shadow-sm shrink-0" />
              {isExpanded && (
                <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow mt-2">
                  Administración
                </span>
              )}
            </div>

            {isExpanded && (
              <button
                type="button"
                onClick={togglePin}
                title={isPinned ? 'Desfijar menú (volver a colapso automático)' : 'Fijar menú abierto permanentemente'}
                className={cn(
                  'cursor-pointer flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors border shrink-0',
                  isPinned
                    ? 'bg-brand-yellow text-brand-navy border-brand-yellow font-bold shadow-sm'
                    : 'text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>{isPinned ? 'Fijado' : 'Fijar'}</span>
              </button>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                  !isExpanded && 'justify-center px-0',
                )
              }
            >
              {item.icon}
              {isExpanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-3">
          <NavLink
            to="/"
            title={!isExpanded ? 'Volver al sitio público' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-all shadow-sm',
              'bg-brand-yellow text-brand-navy hover:brightness-95 active:scale-[0.98]',
              !isExpanded && 'justify-center px-0 h-10 w-10 mx-auto'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isExpanded && <span className="truncate whitespace-nowrap font-bold">Sitio público</span>}
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

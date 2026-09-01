import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import logo from '../../assets/logo.png'

// Cada módulo admin nuevo agrega una entrada acá — es el único lugar que
// hay que tocar para que aparezca en el menú.
const ADMIN_NAV = [{ to: '/admin/informacion-institucional', label: 'Información institucional' }]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-brand-paper">
      <aside className="flex w-64 flex-none flex-col gap-1 bg-brand-navy p-5 text-white">
        <img src={logo} alt="Nandayure" className="mb-6 h-7 w-auto brightness-0 invert" />
        <span className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-brand-yellow">
          Panel administrativo
        </span>

        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white')
            }
          >
            {item.label}
          </NavLink>
        ))}

        <div className="mt-auto pt-6">
          <Button href="/" variant="outline" className="w-full justify-center border-white/25 text-white hover:border-white">
            Volver al sitio público
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  )
}

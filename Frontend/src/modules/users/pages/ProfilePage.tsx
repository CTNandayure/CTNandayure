import { Link } from 'react-router-dom'
import { UserProfile } from '../components/UserProfile/UserProfile'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-brand-sand/45 px-6 py-8 md:px-12 md:py-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-end">
          <Link to="/" className="text-sm font-semibold text-brand-green-strong hover:underline">← Volver al inicio</Link>
        </div>
        <header className="mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-brand-navy/10 pb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-strong">Cuenta personal</p>
            <h1 className="mt-3 text-5xl font-bold leading-tight text-brand-navy">Mi perfil</h1>
          </div>
          <p className="max-w-lg text-base leading-7 text-brand-ink/65">Administra la información asociada a tu cuenta y mantén tus credenciales bajo control.</p>
        </header>
        <div className="mt-8">
          <UserProfile />
        </div>
      </div>
    </main>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Input } from '../../../../components/ui'
import { EyeIcon, EyeOffIcon } from '../../../../components/ui/icons'
import { useLoginForm } from './hooks/useLoginForm'

export function LoginForm() {
  const form = useLoginForm()
  const [passwordVisible, setPasswordVisible] = useState(false)
  return (
    <form onSubmit={form.submit} className="space-y-5" noValidate>
      {form.error && <Alert variant="error" title="No se pudo iniciar sesión">{form.error}</Alert>}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-brand-navy">Correo electrónico</label>
        <Input id="login-email" type="email" autoComplete="email" value={form.email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setEmail(event.target.value)} aria-invalid={Boolean(form.errors.email)} placeholder="tu@correo.com" />
        {form.errors.email && <p className="mt-1 text-sm text-red-700">{form.errors.email}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-brand-navy">Contraseña</label>
        <div className="relative">
          <Input id="login-password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setPassword(event.target.value)} aria-invalid={Boolean(form.errors.password)} placeholder="Tu contraseña" className="pr-12" />
          <button type="button" onClick={() => setPasswordVisible((value) => !value)} aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy">
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {form.errors.password && <p className="mt-1 text-sm text-red-700">{form.errors.password}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm text-brand-ink/75">
        <input type="checkbox" checked={form.remember} onChange={(event) => form.setRemember(event.target.checked)} className="h-4 w-4 accent-brand-green" />
        Recordar correo
      </label>
      <Button type="submit" disabled={form.isSubmitting} className="w-full">{form.isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}</Button>
      <div className="flex justify-between gap-4 text-sm">
        <Link to="/users/recuperar" className="font-semibold text-brand-green-strong hover:underline">Olvidé mi contraseña</Link>
        <Link to="/users/activar" className="font-semibold text-brand-navy hover:underline">Solicitar activación</Link>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, Button, Input } from '../../../components/ui'
import { EyeIcon, EyeOffIcon } from '../../../components/ui/icons'
import nandayureImage from '../../../assets/NandayureIMG.jpeg'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { authService } from '../services/authService'
import { passwordChecks, validatePassword, validatePasswordConfirmation } from '../utils/validators'

export default function ActivationTokenPage() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [done, setDone] = useState(false); const [loading, setLoading] = useState(false); const [passwordVisible, setPasswordVisible] = useState(false); const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); const formatError = useErrorHandler()
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const validation = validatePassword(password) || validatePasswordConfirmation(password, confirmation); if (!token) return setError('El enlace no contiene un token válido'); if (validation) return setError(validation); setLoading(true); setError(''); try { await authService.activateAccount(token, password); setDone(true) } catch (cause) { setError(formatError(cause)) } finally { setLoading(false) } }
  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        <section className="relative min-h-[22rem] overflow-hidden lg:min-h-screen">
          <img
            src={nandayureImage}
            alt="Paisaje de Nandayure"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-navy/45" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white md:p-12 lg:p-16">
            <Link
              to="/users/login"
              className="self-end text-sm font-semibold text-brand-yellow hover:underline lg:self-start"
            >
              ← Volver a iniciar sesión
            </Link>
            <div className="max-w-md pb-4 lg:pb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                Activar cuenta
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Establece tu contraseña para continuar
              </h1>
              <p className="mt-5 text-base leading-7 text-white/85">
                Ingresa una nueva contraseña para tu cuenta de CT Nandayure.
              </p>
            </div>
          </div>
        </section>
        <section className="flex min-h-[34rem] items-center justify-center bg-white p-8 md:p-12 lg:min-h-screen lg:p-16">
          <div className="w-full max-w-md">
            {done ? (
              <div className="space-y-4">
                <Alert variant="success" title="Cuenta activada">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </Alert>
                <Link to="/users/login" className="block text-center font-semibold text-brand-green-strong hover:underline">
                  Ir al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5" noValidate>
                {error && <Alert variant="error">{error}</Alert>}
                <div>
                  <label htmlFor="activate-password" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    Crea tu contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="activate-password"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((value) => !value)}
                      aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy"
                    >
                      {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="activate-confirm" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="activate-confirm"
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmation(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible((value) => !value)}
                      aria-label={confirmPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy"
                    >
                      {confirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <ul className="mt-2 grid gap-1 text-xs text-brand-ink/65 sm:grid-cols-2">
                  {passwordChecks(password).map((check) => (
                    <li key={check.label} className={check.valid ? 'text-brand-green-strong' : ''}>
                      {check.valid ? '✓' : '•'} {check.label}
                    </li>
                  ))}
                </ul>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Activando...' : 'Activar cuenta'}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
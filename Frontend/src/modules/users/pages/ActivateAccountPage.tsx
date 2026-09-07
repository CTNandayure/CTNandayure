import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Input } from '../../../components/ui'
import nandayureImage from '../../../assets/NandayureIMG.jpeg'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { authService } from '../services/authService'
import { validateEmail } from '../utils/validators'

export default function ActivateAccountPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const formatError = useErrorHandler()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validateEmail(email)
    if (validation) return setError(validation)
    setError('')
    setLoading(true)
    try {
      await authService.resendActivation(email)
      setSent(true)
    } catch (cause) {
      setError(formatError(cause, 'No fue posible solicitar el enlace'))
    } finally {
      setLoading(false)
    }
  }

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
              ← Volver al inicio de sesión
            </Link>
            <div className="max-w-md pb-4 lg:pb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                Activa tu cuenta
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Solicita un nuevo enlace de activación
              </h1>
              <p className="mt-5 text-base leading-7 text-white/85">
                Ingresa el correo con el que se creó tu cuenta y te enviaremos un
                nuevo enlace de activación.
              </p>
            </div>
          </div>
        </section>
        <section className="flex min-h-[34rem] items-center justify-center bg-white p-8 md:p-12 lg:min-h-screen lg:p-16">
          <div className="w-full max-w-md">
            {sent ? (
              <div className="space-y-4">
                <Alert variant="success" title="Solicitud enviada">
                  Si el correo corresponde a una cuenta pendiente, recibirás un nuevo
                  enlace de activación.
                </Alert>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="cursor-pointer text-sm font-semibold text-brand-green-strong hover:underline"
                >
                  Solicitar otro enlace
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5" noValidate>
                {error && <Alert variant="error">{error}</Alert>}
                <div>
                  <label htmlFor="activation-email" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    Correo electrónico
                  </label>
                  <Input
                    id="activation-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
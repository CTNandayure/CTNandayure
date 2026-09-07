import { Alert, Button, Input } from '../../../../components/ui'
import { useForgotPassword } from './hooks/useForgotPassword'

export function ForgotPassword() {
  const form = useForgotPassword()
  if (form.sent) return <Alert variant="success" title="Revisa tu correo">Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</Alert>
  return <form onSubmit={form.submit} className="space-y-5" noValidate>
    {form.error && <Alert variant="error">{form.error}</Alert>}
    <div><label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold text-brand-navy">Correo electrónico</label><Input id="forgot-email" type="email" autoComplete="email" value={form.email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setEmail(event.target.value)} placeholder="tu@correo.com" /></div>
    <Button type="submit" disabled={form.isSubmitting} className="w-full">{form.isSubmitting ? 'Enviando...' : 'Enviar enlace'}</Button>
  </form>
}

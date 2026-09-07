import { useState } from 'react'
import { Alert, Button, Input } from '../../../../components/ui'
import { EyeIcon, EyeOffIcon } from '../../../../components/ui/icons'
import { passwordChecks } from '../../utils/validators'
import { useChangePassword } from './hooks/useChangePassword'

export function ChangePassword() {
  const form = useChangePassword()
  const [visible, setVisible] = useState({ current: false, next: false, confirmation: false })
  const toggleVisibility = (field: keyof typeof visible) => setVisible((state) => ({ ...state, [field]: !state[field] }))
  return <form onSubmit={form.submit} className="space-y-5" noValidate>
    {form.error && <Alert variant="error" title="No se pudo cambiar la contraseña">{form.error}</Alert>}
    {form.success && <Alert variant="success" title="Contraseña actualizada">Tu contraseña se cambió correctamente.</Alert>}
    <div><label htmlFor="current-password" className="mb-1.5 block text-sm font-semibold text-brand-navy">Contraseña actual</label><div className="relative"><Input id="current-password" type={visible.current ? 'text' : 'password'} autoComplete="current-password" value={form.currentPassword} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setCurrentPassword(event.target.value)} className="pr-12" /><button type="button" onClick={() => toggleVisibility('current')} aria-label={visible.current ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'} className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy">{visible.current ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>
    <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-brand-navy">Nueva contraseña</label><div className="relative"><Input id="new-password" type={visible.next ? 'text' : 'password'} autoComplete="new-password" value={form.newPassword} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setNewPassword(event.target.value)} className="pr-12" /><button type="button" onClick={() => toggleVisibility('next')} aria-label={visible.next ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'} className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy">{visible.next ? <EyeOffIcon /> : <EyeIcon />}</button></div>
      <ul className="mt-2 grid gap-1 text-xs text-brand-ink/65 sm:grid-cols-2">{passwordChecks(form.newPassword).map((check) => <li key={check.label} className={check.valid ? 'text-brand-green-strong' : ''}>{check.valid ? '✓' : '•'} {check.label}</li>)}</ul>
    </div>
    <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-brand-navy">Confirmar nueva contraseña</label><div className="relative"><Input id="confirm-password" type={visible.confirmation ? 'text' : 'password'} autoComplete="new-password" value={form.confirmation} onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setConfirmation(event.target.value)} className="pr-12" /><button type="button" onClick={() => toggleVisibility('confirmation')} aria-label={visible.confirmation ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'} className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-brand-navy/55 hover:text-brand-navy">{visible.confirmation ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>
    <Button type="submit" disabled={form.isSubmitting}>{form.isSubmitting ? 'Guardando...' : 'Guardar cambios'}</Button>
  </form>
}

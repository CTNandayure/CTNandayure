import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, FormActions, FormField, ImageUpload, Input, Textarea, useToast } from '../../components/ui'
import { API_URL } from '../../content/api'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'

interface InstitutionalInfoFormValues {
  aboutTitle: string
  aboutText: string
  historyText: string
  missionText: string
  visionText: string
  aboutImageUrl: string | null
  contactImageUrl: string | null
  address: string
  phone: string
  email: string
  officeHours: string
}

export default function InstitutionalInfoAdminPage() {
  const { data, status, refetch } = useInstitutionalInfo()
  const { showToast } = useToast()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionalInfoFormValues>()

  // Once the current data arrives, pre-fill the form with it.
  useEffect(() => {
    if (data) {
      reset({
        aboutTitle: data.aboutTitle,
        aboutText: data.aboutText,
        historyText: data.historyText,
        missionText: data.missionText,
        visionText: data.visionText,
        aboutImageUrl: data.aboutImageUrl,
        contactImageUrl: data.contactImageUrl,
        address: data.address,
        phone: data.phone,
        email: data.email,
        officeHours: data.officeHours,
      })
    }
  }, [data, reset])

  async function onSubmit(values: InstitutionalInfoFormValues) {
    try {
      const res = await fetch(`${API_URL}/institutional-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      showToast({ variant: 'success', title: 'Cambios guardados', description: 'La información pública ya está actualizada.' })
      refetch()
    } catch {
      showToast({ variant: 'error', title: 'No se pudo guardar', description: 'Revisá tu conexión e intentá de nuevo.' })
    }
  }

  if (status === 'loading') {
    return <p className="text-brand-ink/60">Cargando…</p>
  }

  if (status === 'error' || !data) {
    return (
      <Alert variant="error" title="No se pudo cargar la información">
        Revisá que el backend esté corriendo e intentá recargar la página.
      </Alert>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-navy">Información institucional</h1>
      <p className="mt-1 text-brand-ink/60">
        Este contenido alimenta las secciones "Quiénes somos", "Misión y visión" y "Contacto" de la landing pública.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm">
        <FormField label="Título de la sección Quiénes somos" htmlFor="aboutTitle" error={errors.aboutTitle?.message}>
          <Input id="aboutTitle" {...register('aboutTitle', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <FormField label="Texto de Quiénes somos" htmlFor="aboutText" error={errors.aboutText?.message}>
          <Textarea id="aboutText" rows={4} {...register('aboutText', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <Controller
          name="aboutImageUrl"
          control={control}
          render={({ field }) => <ImageUpload label="Foto de la sección Quiénes somos" value={field.value} onChange={field.onChange} />}
        />

        <FormField label="Historia" htmlFor="historyText" error={errors.historyText?.message}>
          <Textarea id="historyText" rows={6} {...register('historyText', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <FormField label="Misión" htmlFor="missionText" error={errors.missionText?.message}>
          <Textarea id="missionText" rows={3} {...register('missionText', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <FormField label="Visión" htmlFor="visionText" error={errors.visionText?.message}>
          <Textarea id="visionText" rows={3} {...register('visionText', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register('phone', { required: 'Este campo es obligatorio' })} />
          </FormField>
          <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Este campo es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresá un correo válido' },
              })}
            />
          </FormField>
        </div>

        <FormField label="Dirección" htmlFor="address" error={errors.address?.message}>
          <Input id="address" {...register('address', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <FormField label="Horario de atención" htmlFor="officeHours" error={errors.officeHours?.message}>
          <Input id="officeHours" {...register('officeHours', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <Controller
          name="contactImageUrl"
          control={control}
          render={({ field }) => <ImageUpload label="Foto de la sección Contáctenos" value={field.value} onChange={field.onChange} />}
        />

        <FormActions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="outline" onClick={() => data && reset()}>
            Cancelar
          </Button>
        </FormActions>
      </form>
    </div>
  )
}

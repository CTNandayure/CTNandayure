import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Container, FileUpload, FormActions, FormField, Input, Select, Textarea, useToast } from '../components/ui'
import { useDistricts } from '../content/districts'
import logo from '../assets/logo.png'

interface AffiliationFormValues {
  fullName: string
  businessName: string
  phone: string
  email: string
  district: string
  message: string
}

const BENEFITS = [
  'Aparecer en el directorio de negocios del sitio',
  'Promoción conjunta en redes y campañas de la Cámara',
  'Capacitaciones y acompañamiento técnico',
  'Participación en ferias y actividades del cantón',
  'Red de contacto con otros emprendedores turísticos',
]

export default function AffiliationPage() {
  const { data: districts } = useDistricts()
  const { showToast } = useToast()
  const [, setDocuments] = useState<File[]>([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AffiliationFormValues>()

  // No hay endpoint de afiliación todavía — se simula el envío.
  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 500))
    showToast({
      variant: 'success',
      title: 'Solicitud enviada',
      description: 'Nos pondremos en contacto para completar la afiliación.',
    })
    reset()
    setDocuments([])
  }

  return (
    <div className="min-h-screen bg-brand-paper">
      <header className="border-b border-brand-navy/10 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <a href="/">
            <img src={logo} alt="Nandayure" className="h-7 w-auto" />
          </a>
          <Button href="/" variant="text">
            ← Volver al inicio
          </Button>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 md:grid-cols-2 md:py-20">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">Afíliese a la cámara</span>
          <h1 className="text-3xl font-bold text-brand-navy md:text-4xl">¿Tiene un negocio turístico en Nandayure?</h1>
          <p className="text-brand-ink/70">Sume su negocio a la red de la Cámara y forme parte del desarrollo turístico del cantón.</p>
          <ul className="mt-2 flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-brand-ink/80">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-green" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-brand-navy">Formulario de afiliación</h2>

          <FormField label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message}>
            <Input id="fullName" {...register('fullName', { required: 'Ingresá tu nombre completo' })} />
          </FormField>

          <FormField label="Nombre del negocio" htmlFor="businessName" error={errors.businessName?.message}>
            <Input id="businessName" {...register('businessName', { required: 'Ingresá el nombre del negocio' })} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone', { required: 'Ingresá un teléfono de contacto' })} />
            </FormField>
            <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Ingresá un correo',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresá un correo válido' },
                })}
              />
            </FormField>
          </div>

          <FormField label="Distrito del negocio" htmlFor="district" error={errors.district?.message}>
            <Select id="district" defaultValue="" {...register('district', { required: 'Seleccioná un distrito' })}>
              <option value="" disabled>
                Seleccionar distrito
              </option>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Cuéntenos sobre su negocio" htmlFor="message">
            <Textarea id="message" {...register('message')} />
          </FormField>

          <FileUpload
            label="Documentos o fotos del negocio"
            hint="Cédula jurídica, permiso de funcionamiento, fotos del local, etc. — para verificar que el negocio está en regla."
            accept="image/*,.pdf"
            onChange={setDocuments}
          />

          <FormActions>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
            <Button href="/" variant="outline">
              Cancelar
            </Button>
          </FormActions>
        </form>
      </Container>
    </div>
  )
}

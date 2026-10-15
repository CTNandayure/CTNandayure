import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  FormField,
  ImageUpload,
  Input,
  Modal,
  Textarea,
  useToast,
} from '../../components/ui'
import { API_URL } from '../../content/api'
import { useInstitutionalInfo } from '../../content/hooks/useInstitutionalInfo'
import { cn } from '../../lib/cn'
import { tokenManager } from '../../modules/users/services/tokenManager'
import { AboutSection } from '../sections/AboutSection'
import { ContactSection } from '../sections/ContactSection'
import { Hero } from '../sections/Hero'
import { MissionVisionSection } from '../sections/MissionVisionSection'

type InstitutionalTab = 'about' | 'identity' | 'contact'
type ViewMode = 'edit' | 'preview'

interface InstitutionalInfoState {
  aboutTitle: string
  aboutText: string
  historyText: string
  missionText: string
  visionText: string
  heroImageUrl: string | null
  aboutImageUrl: string | null
  contactImageUrl: string | null
  address: string
  phone: string
  email: string
  officeHours: string
}

const emptyState: InstitutionalInfoState = {
  aboutTitle: '',
  aboutText: '',
  historyText: '',
  missionText: '',
  visionText: '',
  heroImageUrl: null,
  aboutImageUrl: null,
  contactImageUrl: null,
  address: '',
  phone: '',
  email: '',
  officeHours: '',
}

const TAB_LABELS: Record<InstitutionalTab, string> = {
  about: 'Portada y Quiénes somos',
  identity: 'Historia, Misión y Visión',
  contact: 'Contacto y Horarios',
}

const TAB_DESCRIPTIONS: Record<InstitutionalTab, string> = {
  about: 'Configure la imagen de bienvenida del sitio público y la presentación general de la Cámara.',
  identity: 'Defina la reseña histórica, la misión institucional y la visión de desarrollo del cantón.',
  contact: 'Actualice las vías de comunicación, dirección física, horarios de oficina y foto de contacto.',
}

export default function InstitutionalInfoAdminPage() {
  const { data, status, refetch } = useInstitutionalInfo()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<InstitutionalTab>('about')
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [form, setForm] = useState<InstitutionalInfoState>(emptyState)
  const [errors, setErrors] = useState<Partial<Record<keyof InstitutionalInfoState, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        aboutTitle: data.aboutTitle ?? '',
        aboutText: data.aboutText ?? '',
        historyText: data.historyText ?? '',
        missionText: data.missionText ?? '',
        visionText: data.visionText ?? '',
        heroImageUrl: data.heroImageUrl ?? null,
        aboutImageUrl: data.aboutImageUrl ?? null,
        contactImageUrl: data.contactImageUrl ?? null,
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        officeHours: data.officeHours ?? '',
      })
    }
  }, [data])

  const validateSection = (): boolean => {
    const nextErrors: Partial<Record<keyof InstitutionalInfoState, string>> = {}

    if (activeTab === 'about') {
      if (!form.aboutTitle.trim()) {
        nextErrors.aboutTitle = 'El título de Quiénes somos es obligatorio'
      }
      if (!form.aboutText.trim()) {
        nextErrors.aboutText = 'El texto de Quiénes somos es obligatorio'
      }
    } else if (activeTab === 'identity') {
      if (!form.historyText.trim()) {
        nextErrors.historyText = 'El texto de historia es obligatorio'
      }
      if (!form.missionText.trim()) {
        nextErrors.missionText = 'La misión es obligatoria'
      }
      if (!form.visionText.trim()) {
        nextErrors.visionText = 'La visión es obligatoria'
      }
    } else if (activeTab === 'contact') {
      if (!form.phone.trim()) {
        nextErrors.phone = 'El teléfono es obligatorio'
      }
      if (!form.email.trim()) {
        nextErrors.email = 'El correo electrónico es obligatorio'
      } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
        nextErrors.email = 'Ingrese un correo electrónico válido'
      }
      if (!form.address.trim()) {
        nextErrors.address = 'La dirección física es obligatoria'
      }
      if (!form.officeHours.trim()) {
        nextErrors.officeHours = 'El horario de atención es obligatorio'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleOpenConfirm = () => {
    if (!validateSection()) return
    setConfirmOpen(true)
  }

  const handleCancelSection = () => {
    if (!data) return
    if (activeTab === 'about') {
      setForm((prev) => ({
        ...prev,
        heroImageUrl: data.heroImageUrl ?? null,
        aboutTitle: data.aboutTitle ?? '',
        aboutText: data.aboutText ?? '',
        aboutImageUrl: data.aboutImageUrl ?? null,
      }))
    } else if (activeTab === 'identity') {
      setForm((prev) => ({
        ...prev,
        historyText: data.historyText ?? '',
        missionText: data.missionText ?? '',
        visionText: data.visionText ?? '',
      }))
    } else if (activeTab === 'contact') {
      setForm((prev) => ({
        ...prev,
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        officeHours: data.officeHours ?? '',
        contactImageUrl: data.contactImageUrl ?? null,
      }))
    }
    setErrors({})
    setViewMode('edit')
  }

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false)
    try {
      setIsSubmitting(true)

      let payload: Partial<InstitutionalInfoState> = {}
      if (activeTab === 'about') {
        payload = {
          heroImageUrl: form.heroImageUrl,
          aboutTitle: form.aboutTitle.trim(),
          aboutText: form.aboutText.trim(),
          aboutImageUrl: form.aboutImageUrl,
        }
      } else if (activeTab === 'identity') {
        payload = {
          historyText: form.historyText.trim(),
          missionText: form.missionText.trim(),
          visionText: form.visionText.trim(),
        }
      } else if (activeTab === 'contact') {
        payload = {
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          officeHours: form.officeHours.trim(),
          contactImageUrl: form.contactImageUrl,
        }
      }

      const token = tokenManager.get()
      const res = await fetch(`${API_URL}/institutional-info`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.status === 401 || res.status === 403) {
        showToast({
          variant: 'error',
          title: 'No se pudo guardar',
          description: 'Tu sesión expiró o no tienes permiso para editar.',
        })
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      showToast({
        variant: 'success',
        title: 'Cambios guardados',
        description: `La sección "${TAB_LABELS[activeTab]}" se actualizó correctamente.`,
      })
      refetch()
      setViewMode('edit')
    } catch {
      showToast({
        variant: 'error',
        title: 'No se pudo guardar',
        description: 'Revisa tu conexión e intenta de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-brand-ink/60">Cargando…</p>
  }

  if (status === 'error' || !data) {
    return (
      <Alert variant="error" title="No se pudo cargar la información">
        Revisa que el backend esté corriendo e intenta recargar la página.
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Información institucional</h1>
        <p className="mt-1 text-brand-ink/60">
          Gestione el contenido público de la página de inicio organizado por secciones.
        </p>
      </div>

      <div className="flex gap-2 border-b border-brand-navy/15 pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('about')
            setViewMode('edit')
            setErrors({})
          }}
          className={cn(
            '-mb-px border-b-2 px-5 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'about'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
          )}
        >
          Portada y Quiénes somos
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('identity')
            setViewMode('edit')
            setErrors({})
          }}
          className={cn(
            '-mb-px border-b-2 px-5 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'identity'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
          )}
        >
          Historia, Misión y Visión
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('contact')
            setViewMode('edit')
            setErrors({})
          }}
          className={cn(
            '-mb-px border-b-2 px-5 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'contact'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
          )}
        >
          Contacto y Horarios
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-brand-navy/10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-navy/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">{TAB_LABELS[activeTab]}</h2>
            <p className="mt-1 text-sm text-brand-ink/60">{TAB_DESCRIPTIONS[activeTab]}</p>
          </div>

          <div className="flex items-center rounded-xl bg-brand-paper p-1 ring-1 ring-brand-navy/10">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'edit'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Formulario
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'preview'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista previa
            </button>
          </div>
        </div>

        {viewMode === 'edit' ? (
          <>
            {activeTab === 'about' && (
              <div className="flex flex-col gap-6">
                <ImageUpload
                  label="Foto de portada (hero)"
                  value={form.heroImageUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, heroImageUrl: url }))}
                />

                <FormField label="Título de la sección Quiénes somos" htmlFor="aboutTitle" error={errors.aboutTitle}>
                  <Input
                    id="aboutTitle"
                    value={form.aboutTitle}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, aboutTitle: e.target.value }))
                      if (errors.aboutTitle) setErrors((prev) => ({ ...prev, aboutTitle: undefined }))
                    }}
                  />
                </FormField>

                <FormField label="Texto de Quiénes somos" htmlFor="aboutText" error={errors.aboutText}>
                  <Textarea
                    id="aboutText"
                    rows={5}
                    value={form.aboutText}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, aboutText: e.target.value }))
                      if (errors.aboutText) setErrors((prev) => ({ ...prev, aboutText: undefined }))
                    }}
                  />
                </FormField>

                <ImageUpload
                  label="Foto de la sección Quiénes somos"
                  value={form.aboutImageUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, aboutImageUrl: url }))}
                />
              </div>
            )}

            {activeTab === 'identity' && (
              <div className="flex flex-col gap-6">
                <FormField label="Historia de Nandayure" htmlFor="historyText" error={errors.historyText}>
                  <Textarea
                    id="historyText"
                    rows={6}
                    value={form.historyText}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, historyText: e.target.value }))
                      if (errors.historyText) setErrors((prev) => ({ ...prev, historyText: undefined }))
                    }}
                  />
                </FormField>

                <FormField label="Misión" htmlFor="missionText" error={errors.missionText}>
                  <Textarea
                    id="missionText"
                    rows={4}
                    value={form.missionText}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, missionText: e.target.value }))
                      if (errors.missionText) setErrors((prev) => ({ ...prev, missionText: undefined }))
                    }}
                  />
                </FormField>

                <FormField label="Visión" htmlFor="visionText" error={errors.visionText}>
                  <Textarea
                    id="visionText"
                    rows={4}
                    value={form.visionText}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, visionText: e.target.value }))
                      if (errors.visionText) setErrors((prev) => ({ ...prev, visionText: undefined }))
                    }}
                  />
                </FormField>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Teléfono" htmlFor="phone" error={errors.phone}>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
                      }}
                    />
                  </FormField>

                  <FormField label="Correo electrónico" htmlFor="email" error={errors.email}>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                    />
                  </FormField>
                </div>

                <FormField label="Dirección física" htmlFor="address" error={errors.address}>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                      if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }))
                    }}
                  />
                </FormField>

                <FormField label="Horario de atención" htmlFor="officeHours" error={errors.officeHours}>
                  <Input
                    id="officeHours"
                    value={form.officeHours}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, officeHours: e.target.value }))
                      if (errors.officeHours) setErrors((prev) => ({ ...prev, officeHours: undefined }))
                    }}
                  />
                </FormField>

                <ImageUpload
                  label="Foto de la sección Contáctenos"
                  value={form.contactImageUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, contactImageUrl: url }))}
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-6 border-t border-brand-navy/10 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelSection}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="navy"
                onClick={handleOpenConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </>
        ) : (
          <div>
            <div className="mb-4 rounded-xl bg-brand-sand/60 px-4 py-3 text-xs font-medium text-brand-navy/80 ring-1 ring-brand-navy/10">
              Vista previa en vivo con los cambios actuales del formulario. Esta sección muestra exactamente cómo lucirá en el sitio público.
            </div>

            <div className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-brand-paper p-4 md:p-6 space-y-6">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-brand-navy/10 shadow-sm">
                    <Hero previewData={form} />
                  </div>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-brand-navy/10 shadow-sm">
                    <AboutSection previewData={form} />
                  </div>
                </div>
              )}

              {activeTab === 'identity' && (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-brand-navy/10 shadow-sm">
                    <AboutSection previewData={form} />
                  </div>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-brand-navy/10 shadow-sm">
                    <MissionVisionSection previewData={form} />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="overflow-hidden rounded-2xl ring-1 ring-brand-navy/10 shadow-sm">
                  <ContactSection previewData={form} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-6 border-t border-brand-navy/10 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewMode('edit')}
              >
                Volver al formulario
              </Button>
              <Button
                type="button"
                variant="navy"
                onClick={handleOpenConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
        title="Confirmar cambios"
        description={`¿Está seguro de que desea guardar los cambios en la sección "${TAB_LABELS[activeTab]}"?`}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="navy"
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          Los cambios se aplicarán inmediatamente a la sección pública de la plataforma.
        </p>
      </Modal>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, FormActions, FormField, ImageUpload, Input, Select, Textarea } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'
import { BusinessLocationPicker } from '../../../business/components/BusinessLocationPicker'
import { ApiError } from '../../services/apiClient'
import type { ActivityFormValues, ActivityPayload, ActivityRecord, ActivityScheduleType } from '../../types/activity.types'
import {
  emptyFormValues,
  FIELD_LIMITS,
  payloadFromValues,
  scheduleDiffers,
  validateActivityForm,
  valuesFromRecord,
  type ActivityFormErrors,
} from '../../utils/activityForm'
import { CATEGORY_LABELS, CATEGORY_OPTIONS, todayInCostaRica, WEEKDAYS } from '../../utils/activityLabels'

export interface BusinessOption {
  id: string
  businessName: string
  businessStatus: 'ACTIVE' | 'INACTIVE'
}

interface ActivityFormProps {
  // owner: the business is implicit. admin: picks the business when creating.
  mode: 'owner' | 'admin'
  initial?: ActivityRecord
  businesses?: BusinessOption[]
  onSubmit: (payload: ActivityPayload, businessId: string) => Promise<void>
  onCancel: () => void
}

const SCHEDULE_OPTIONS: Array<{ value: ActivityScheduleType; title: string; description: string }> = [
  { value: 'SPECIFIC_DATE', title: 'Día específico', description: 'Ocurre una sola vez, en una fecha concreta.' },
  { value: 'RECURRING', title: 'Se repite', description: 'Se ofrece ciertos días de la semana, con una temporada opcional.' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="border-b border-brand-navy/10 pb-2 text-base font-bold text-brand-navy">{children}</h3>
}

export function ActivityForm({ mode, initial, businesses = [], onSubmit, onCancel }: ActivityFormProps) {
  const initialValues = useMemo(() => (initial ? valuesFromRecord(initial) : emptyFormValues()), [initial])
  const [values, setValues] = useState<ActivityFormValues>(initialValues)
  const [errors, setErrors] = useState<ActivityFormErrors>({})
  const [banner, setBanner] = useState<{ variant: 'error' | 'warning'; title: string; messages: string[] } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  // The form is long: bring the problem into view instead of leaving it above the fold.
  useEffect(() => {
    if (banner) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [banner])

  const today = todayInCostaRica()
  const isEditing = Boolean(initial)
  // Past dates are only rejected for new activities or when the schedule itself changes.
  const requireFuture = !isEditing || scheduleDiffers(values, initialValues)

  function set<K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function toggleDay(day: number) {
    // Functional update: two quick clicks must not overwrite each other.
    setValues((previous) => ({
      ...previous,
      daysOfWeek: previous.daysOfWeek.includes(day)
        ? previous.daysOfWeek.filter((d) => d !== day)
        : [...previous.daysOfWeek, day],
    }))
    setErrors((previous) => ({ ...previous, daysOfWeek: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBanner(null)

    const found = validateActivityForm(values, { today, isAdmin: mode === 'admin', requireFuture })
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      setBanner({ variant: 'warning', title: 'Revise el formulario', messages: ['Hay campos incompletos o con errores, marcados en rojo.'] })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(payloadFromValues(values), values.businessId)
    } catch (error) {
      setBanner({
        variant: 'error',
        title: 'No se pudo guardar la actividad',
        messages: error instanceof ApiError ? error.messages : [error instanceof Error ? error.message : 'Error desconocido'],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOwnerEditingInactive = mode === 'owner' && initial?.status === 'INACTIVA'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {isOwnerEditingInactive && (
        <Alert variant="info" title="Actividad desactivada por la Cámara">
          Puede corregir su contenido, pero solo la administración puede volver a activarla.
        </Alert>
      )}

      {banner && (
        <div ref={bannerRef}>
          <Alert variant={banner.variant} title={banner.title}>
            <ul className="list-disc pl-5">
              {banner.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <section className="flex flex-col gap-5">
        <SectionTitle>Información básica</SectionTitle>

        {mode === 'admin' && (
          <FormField label="Negocio" htmlFor="businessId" error={errors.businessId}>
            <Select
              id="businessId"
              value={values.businessId}
              disabled={isEditing}
              onChange={(event) => set('businessId', event.target.value)}
            >
              <option value="">Seleccione el negocio</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.businessName}
                  {business.businessStatus === 'INACTIVE' ? ' (inactivo)' : ''}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Nombre de la actividad" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={values.name}
            maxLength={FIELD_LIMITS.nameMax}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Ejemplo: Tour nocturno de tortugas"
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Categoría" htmlFor="category" error={errors.category}>
            <Select
              id="category"
              value={values.category}
              onChange={(event) => set('category', event.target.value as ActivityFormValues['category'])}
            >
              <option value="">Seleccione una categoría</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {CATEGORY_LABELS[option]}
                </option>
              ))}
            </Select>
          </FormField>

          {values.category === 'OTHER' && (
            <FormField label="¿Cuál categoría?" htmlFor="customCategory" error={errors.customCategory}>
              <Input
                id="customCategory"
                value={values.customCategory}
                maxLength={FIELD_LIMITS.customCategoryMax}
                onChange={(event) => set('customCategory', event.target.value)}
                placeholder="Ejemplo: Pesca deportiva"
              />
            </FormField>
          )}
        </div>

        <FormField label="Descripción" htmlFor="description" error={errors.description}>
          <Textarea
            id="description"
            rows={5}
            value={values.description}
            maxLength={FIELD_LIMITS.descriptionMax}
            onChange={(event) => set('description', event.target.value)}
            placeholder="Cuente en qué consiste la actividad y qué hará el visitante."
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <SectionTitle>Cuándo y cuánto dura</SectionTitle>

        <div role="radiogroup" aria-label="Tipo de horario" className="grid gap-3 sm:grid-cols-2">
          {SCHEDULE_OPTIONS.map((option) => {
            const selected = values.scheduleType === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set('scheduleType', option.value)}
                className={cn(
                  'cursor-pointer rounded-xl border p-4 text-left transition-colors',
                  selected ? 'border-brand-green bg-brand-green/5 ring-1 ring-brand-green' : 'border-brand-navy/15 hover:border-brand-navy/40',
                )}
              >
                <span className="block text-sm font-bold text-brand-navy">{option.title}</span>
                <span className="mt-1 block text-xs text-brand-ink/60">{option.description}</span>
              </button>
            )
          })}
        </div>

        {values.scheduleType === 'SPECIFIC_DATE' ? (
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Fecha" htmlFor="startDate" error={errors.startDate}>
              <Input
                id="startDate"
                type="date"
                min={requireFuture ? today : undefined}
                value={values.startDate}
                onChange={(event) => set('startDate', event.target.value)}
              />
            </FormField>
            <FormField label="Hora de inicio" htmlFor="startTime" error={errors.startTime}>
              <Input id="startTime" type="time" value={values.startTime} onChange={(event) => set('startTime', event.target.value)} />
            </FormField>
          </div>
        ) : (
          <>
            <FormField label="Días de la semana" htmlFor="daysOfWeek" error={errors.daysOfWeek}>
              <div id="daysOfWeek" role="group" aria-label="Días de la semana" className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = values.daysOfWeek.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        'h-11 min-w-14 cursor-pointer rounded-lg border px-3 text-sm font-semibold transition-colors',
                        selected
                          ? 'border-brand-green bg-brand-green text-white'
                          : 'border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                      )}
                    >
                      {day.short}
                    </button>
                  )
                })}
              </div>
            </FormField>

            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Hora de inicio" htmlFor="startTime" error={errors.startTime}>
                <Input id="startTime" type="time" value={values.startTime} onChange={(event) => set('startTime', event.target.value)} />
              </FormField>
              <FormField label="Vigente desde (opcional)" htmlFor="startDate" error={errors.startDate}>
                <Input id="startDate" type="date" value={values.startDate} onChange={(event) => set('startDate', event.target.value)} />
              </FormField>
              <FormField label="Vigente hasta (opcional)" htmlFor="endDate" error={errors.endDate}>
                <Input
                  id="endDate"
                  type="date"
                  min={requireFuture ? today : undefined}
                  value={values.endDate}
                  onChange={(event) => set('endDate', event.target.value)}
                />
              </FormField>
            </div>
            <p className="-mt-2 text-xs text-brand-ink/60">
              Deje las fechas de vigencia vacías si la actividad se ofrece todo el año. Al terminar la vigencia deja de mostrarse sola.
            </p>
          </>
        )}

        <FormField label="Duración" htmlFor="durationHours" error={errors.duration}>
          <div className="flex items-center gap-3">
            <Input
              id="durationHours"
              type="number"
              inputMode="numeric"
              min={0}
              max={24}
              value={values.durationHours}
              onChange={(event) => set('durationHours', event.target.value)}
              className="max-w-24"
              aria-label="Horas"
            />
            <span className="text-sm text-brand-ink/70">h</span>
            <Input
              id="durationMinutes"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={values.durationMinutes}
              onChange={(event) => set('durationMinutes', event.target.value)}
              className="max-w-24"
              aria-label="Minutos"
            />
            <span className="text-sm text-brand-ink/70">min</span>
          </div>
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <SectionTitle>Punto de encuentro</SectionTitle>

        <FormField label="¿Dónde se reúne el grupo?" htmlFor="meetingPoint" error={errors.meetingPoint}>
          <Textarea
            id="meetingPoint"
            rows={2}
            value={values.meetingPoint}
            maxLength={FIELD_LIMITS.meetingPointMax}
            onChange={(event) => set('meetingPoint', event.target.value)}
            placeholder="Ejemplo: Frente a la pulpería de la playa, 200 metros al norte del parqueo"
          />
        </FormField>

        <BusinessLocationPicker
          latitude={values.meetingLatitude}
          longitude={values.meetingLongitude}
          accuracy={null}
          onChange={(coords) => {
            setValues((previous) => ({ ...previous, meetingLatitude: coords.latitude, meetingLongitude: coords.longitude }))
            setErrors((previous) => ({ ...previous, coordinates: undefined }))
          }}
          errors={{ coordinates: errors.coordinates }}
          title="Ubicación en el mapa"
          description="Marque dónde se reúne el grupo para que los visitantes lleguen con facilidad. Puede ser distinto a la dirección del negocio."
        />
      </section>

      <section className="flex flex-col gap-5">
        <SectionTitle>Detalles adicionales</SectionTitle>

        <FormField label="Requisitos o recomendaciones (opcional)" htmlFor="requirements" error={errors.requirements}>
          <Textarea
            id="requirements"
            rows={3}
            value={values.requirements}
            maxLength={FIELD_LIMITS.requirementsMax}
            onChange={(event) => set('requirements', event.target.value)}
            placeholder="Ejemplo: edad mínima 8 años, llevar protector solar, repelente y ropa cómoda."
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <ImageUpload label="Foto de la actividad" value={values.imageUrl} onChange={(url) => set('imageUrl', url)} />
          <p className="text-xs text-brand-ink/60">
            Es la imagen que verán los visitantes, así que elija una atractiva. Es obligatoria para publicar la actividad.
          </p>
        </div>
      </section>

      <FormActions>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Guardar actividad'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </FormActions>
    </form>
  )
}

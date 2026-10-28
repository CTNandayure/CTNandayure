import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, useToast } from '../../../components/ui'
import { businessService } from '../../business/services/businessService'
import { ActivityForm, type BusinessOption } from '../components/ActivityForm/ActivityForm'
import { activitiesService } from '../services/activitiesService'
import type { ActivityPayload, ActivityRecord } from '../types/activity.types'

// /admin/actividades/nueva and /admin/actividades/:id/editar share this page.
export default function ActivityAdminFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activity, setActivity] = useState<ActivityRecord | undefined>()
  const [businesses, setBusinesses] = useState<BusinessOption[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    Promise.all([businessService.getBusinesses(), id ? activitiesService.adminGet(id) : Promise.resolve(undefined)])
      .then(([businessList, record]) => {
        if (cancelled) return
        setBusinesses(
          businessList
            .map((business) => ({ id: business.id, businessName: business.businessName, businessStatus: business.businessStatus }))
            .sort((a, b) => a.businessName.localeCompare(b.businessName, 'es')),
        )
        setActivity(record)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(payload: ActivityPayload, businessId: string) {
    if (id) {
      await activitiesService.adminUpdate(id, payload)
      showToast({ variant: 'success', title: 'Cambios guardados', description: 'La actividad se actualizó correctamente.' })
    } else {
      await activitiesService.adminCreate({ ...payload, businessId })
      showToast({
        variant: 'success',
        title: 'Actividad creada',
        description: 'Se guardó como borrador. Publíquela desde el listado cuando esté lista.',
      })
    }
    navigate('/admin/actividades')
  }

  if (status === 'loading') {
    return <p className="text-brand-ink/60">Cargando…</p>
  }

  if (status === 'error') {
    return (
      <Alert variant="error" title="No se pudo cargar el formulario">
        Revise que el backend esté corriendo e intente recargar la página.
      </Alert>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-navy">{isEditing ? 'Editar actividad' : 'Nueva actividad'}</h1>
      <p className="mt-1 text-brand-ink/60">
        {isEditing ? 'Los cambios se guardan sin afectar el estado de publicación.' : 'Se crea como borrador. Podrá publicarla desde el listado.'}
      </p>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        <ActivityForm
          mode="admin"
          initial={activity}
          businesses={businesses}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/actividades')}
        />
      </div>
    </div>
  )
}

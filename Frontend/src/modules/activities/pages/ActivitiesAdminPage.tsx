import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Input, Modal, Select, useToast } from '../../../components/ui'
import { ActivitiesTable } from '../components/ActivitiesTable/ActivitiesTable'
import { activitiesService } from '../services/activitiesService'
import type { ActivityCategory, ActivityRecord, ActivityStatus } from '../types/activity.types'
import { CATEGORY_LABELS, CATEGORY_OPTIONS, STATUS_LABELS } from '../utils/activityLabels'

function statusChangeCopy(activity: ActivityRecord, next: ActivityStatus): { title: string; description: string } {
  if (next === 'INACTIVA') {
    return {
      title: 'Desactivar actividad',
      description: 'La actividad dejará de ser visible y su dueño no podrá volver a publicarla hasta que usted la reactive.',
    }
  }
  if (next === 'BORRADOR') {
    return {
      title: 'Despublicar actividad',
      description: 'La actividad dejará de ser visible en el sitio público, pero el dueño puede volver a publicarla.',
    }
  }
  if (activity.status === 'INACTIVA') {
    return {
      title: 'Reactivar actividad',
      description: 'La actividad volverá a publicarse en el sitio (si su negocio está activo) y su dueño podrá gestionarla de nuevo.',
    }
  }
  return {
    title: 'Publicar actividad',
    description: 'La actividad será visible de inmediato en el sitio público (si su negocio está activo).',
  }
}

export default function ActivitiesAdminPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [pending, setPending] = useState<{ activity: ActivityRecord; next: ActivityStatus } | null>(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      setActivities(await activitiesService.adminList())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Intente nuevamente')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const businesses = useMemo(() => {
    const byId = new Map<string, string>()
    for (const activity of activities) byId.set(activity.business.id, activity.business.businessName)
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [activities])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return activities.filter((activity) => {
      const matchesSearch =
        !query || activity.name.toLowerCase().includes(query) || activity.business.businessName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter
      const matchesBusiness = businessFilter === 'all' || activity.business.id === businessFilter
      return matchesSearch && matchesStatus && matchesCategory && matchesBusiness
    })
  }, [activities, search, statusFilter, categoryFilter, businessFilter])

  const stats = useMemo(
    () => ({
      total: activities.length,
      published: activities.filter((a) => a.status === 'PUBLICADA').length,
      drafts: activities.filter((a) => a.status === 'BORRADOR').length,
      inactive: activities.filter((a) => a.status === 'INACTIVA').length,
    }),
    [activities],
  )

  const handleEdit = useCallback((activity: ActivityRecord) => navigate(`/admin/actividades/${activity.id}/editar`), [navigate])
  const handleChangeStatus = useCallback((activity: ActivityRecord, next: ActivityStatus) => setPending({ activity, next }), [])

  async function confirmStatusChange() {
    if (!pending) return
    try {
      setIsChangingStatus(true)
      await activitiesService.adminUpdateStatus(pending.activity.id, pending.next)
      showToast({ variant: 'success', title: 'Estado actualizado', description: `La actividad ahora está ${STATUS_LABELS[pending.next].toLowerCase()}.` })
      setPending(null)
      await load()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo cambiar el estado', description: error instanceof Error ? error.message : 'Error desconocido' })
      setPending(null)
    } finally {
      setIsChangingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Actividades</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de las actividades que ofrecen los negocios afiliados</p>
        </div>
        <Button variant="primary" href="/admin/actividades/nueva">
          Nueva actividad
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Total</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Publicadas</p>
          <p className="mt-2 text-3xl font-bold text-brand-green">{stats.published}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Borradores</p>
          <p className="mt-2 text-3xl font-bold text-brand-yellow">{stats.drafts}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Inactivas</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.inactive}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-navy/10">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por actividad o negocio"
            aria-label="Buscar actividades"
            className="md:max-w-sm"
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="md:max-w-[180px]" aria-label="Filtrar por estado">
            <option value="all">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PUBLICADA">Publicada</option>
            <option value="INACTIVA">Inactiva</option>
          </Select>
          <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)} className="md:max-w-[220px]" aria-label="Filtrar por categoría">
            <option value="all">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {CATEGORY_LABELS[option]}
              </option>
            ))}
          </Select>
          <Select value={businessFilter} onChange={(event) => setBusinessFilter(event.target.value)} className="md:max-w-[220px]" aria-label="Filtrar por negocio">
            <option value="all">Todos los negocios</option>
            {businesses.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loadError && (
        <Alert variant="error" title="No se pudieron cargar las actividades">
          {loadError}
        </Alert>
      )}

      <ActivitiesTable activities={filtered} isLoading={isLoading} onEdit={handleEdit} onChangeStatus={handleChangeStatus} />

      <Modal
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title={pending ? statusChangeCopy(pending.activity, pending.next).title : 'Cambiar estado'}
        description={pending ? statusChangeCopy(pending.activity, pending.next).description : undefined}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmStatusChange} disabled={isChangingStatus}>
              {isChangingStatus ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {pending ? `¿Desea continuar con «${pending.activity.name}» (${pending.activity.business.businessName})?` : 'Confirmación requerida.'}
        </p>
      </Modal>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Input, Modal, Select, useToast } from '../../../components/ui'
import { MapView } from '../../../components/map/MapView'
import { DISTRICT_LABELS } from '../../business/utils/constants'
import { getGoogleMapsUrl, isValidCoordinates } from '../../business/utils/geo'
import { businessService } from '../../business/services/businessService'
import { ActivitiesTable } from '../components/ActivitiesTable/ActivitiesTable'
import { ActivityForm, type BusinessOption } from '../components/ActivityForm/ActivityForm'
import { ActivityStatusBadge } from '../components/ActivityStatusBadge'
import { activitiesService } from '../services/activitiesService'
import type { ActivityCategory, ActivityPayload, ActivityRecord, ActivityStatus } from '../types/activity.types'
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  STATUS_LABELS,
  categoryLabel,
  describeSchedule,
  describeValidity,
  formatDate,
  formatDuration,
} from '../utils/activityLabels'

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
  const { showToast } = useToast()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [businesses, setBusinesses] = useState<BusinessOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [pending, setPending] = useState<{ activity: ActivityRecord; next: ActivityStatus } | null>(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null)
  const [detailActivity, setDetailActivity] = useState<ActivityRecord | null>(null)

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

  const loadBusinesses = useCallback(async () => {
    try {
      const list = await businessService.getBusinesses()
      setBusinesses(
        list
          .map((business) => ({
            id: business.id,
            businessName: business.businessName,
            businessStatus: business.businessStatus,
          }))
          .sort((a, b) => a.businessName.localeCompare(b.businessName, 'es')),
      )
    } catch {
      /* Fallback si la carga falla */
    }
  }, [])

  useEffect(() => {
    load()
    loadBusinesses()
  }, [load, loadBusinesses])

  const businessFilterOptions = useMemo(() => {
    if (businesses.length > 0) {
      return businesses.map((b) => [b.id, b.businessName] as [string, string])
    }
    const byId = new Map<string, string>()
    for (const activity of activities) byId.set(activity.business.id, activity.business.businessName)
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [activities, businesses])

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

  const openDetailModal = async (activity: ActivityRecord) => {
    setDetailActivity(activity)
    try {
      const full = await activitiesService.adminGet(activity.id)
      if (full) setDetailActivity(full)
    } catch {
      /* Conserva los datos de la fila */
    }
  }

  const openCreateModal = () => {
    setEditingActivity(null)
    setFormOpen(true)
  }

  const openEditModal = async (activity: ActivityRecord) => {
    setEditingActivity(activity)
    setFormOpen(true)
    try {
      const full = await activitiesService.adminGet(activity.id)
      if (full) setEditingActivity(full)
    } catch {
      /* Conserva los datos de la fila */
    }
  }

  const closeFormModal = () => {
    setFormOpen(false)
    setEditingActivity(null)
  }

  const handleFormSubmit = async (payload: ActivityPayload, businessId: string) => {
    if (editingActivity) {
      await activitiesService.adminUpdate(editingActivity.id, payload)
      showToast({
        variant: 'success',
        title: 'Cambios guardados',
        description: 'La actividad se actualizó correctamente.',
      })
    } else {
      await activitiesService.adminCreate({ ...payload, businessId })
      showToast({
        variant: 'success',
        title: 'Actividad creada',
        description: 'Se guardó como borrador. Publíquela desde el listado cuando esté lista.',
      })
    }
    closeFormModal()
    await load()
  }

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
        <Button variant="primary" onClick={openCreateModal}>
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
            {businessFilterOptions.map(([id, name]) => (
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

      <Modal
        size="xl"
        open={Boolean(detailActivity)}
        onOpenChange={(open) => !open && setDetailActivity(null)}
        title={detailActivity?.name ?? 'Detalle de la actividad'}
        description="Ficha informativa de la actividad."
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setDetailActivity(null)}>
              Cerrar
            </Button>
            {detailActivity && (
              <Button
                variant="navy"
                onClick={() => {
                  const act = detailActivity
                  setDetailActivity(null)
                  openEditModal(act)
                }}
              >
                Editar actividad
              </Button>
            )}
          </div>
        }
      >
        {detailActivity && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-paper p-4 ring-1 ring-brand-navy/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Estado:</span>
                <ActivityStatusBadge activity={detailActivity} />
                <Badge color="teal">{categoryLabel(detailActivity)}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-ink/60">
                <span>
                  <strong>Negocio:</strong> {detailActivity.business.businessName} ({DISTRICT_LABELS[detailActivity.business.district]})
                </span>
                {detailActivity.status === 'PUBLICADA' && !detailActivity.expired && (
                  <a
                    href={`/actividades/${detailActivity.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand-green hover:underline"
                  >
                    Ver en el sitio público ↗
                  </a>
                )}
              </div>
            </div>

            {detailActivity.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-brand-sand">
                <img
                  src={detailActivity.imageUrl}
                  alt={detailActivity.name}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Descripción</p>
                  <p className="whitespace-pre-line rounded-xl border border-brand-navy/10 bg-brand-paper p-4 text-sm leading-relaxed text-brand-ink/80">
                    {detailActivity.description}
                  </p>
                </div>

                {detailActivity.requirements && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                      Requisitos y recomendaciones
                    </p>
                    <p className="whitespace-pre-line rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm leading-relaxed text-brand-ink/80">
                      {detailActivity.requirements}
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Punto de encuentro</p>
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-brand-navy">
                    {detailActivity.meetingPoint}
                  </p>
                  {isValidCoordinates(detailActivity.meetingLatitude, detailActivity.meetingLongitude) && (
                    <div className="mt-3 space-y-1.5">
                      <div className="overflow-hidden rounded-xl border border-brand-navy/10">
                        <MapView
                          latitude={detailActivity.meetingLatitude}
                          longitude={detailActivity.meetingLongitude}
                          interactive={false}
                          height="200px"
                        />
                      </div>
                      <a
                        href={getGoogleMapsUrl(detailActivity.meetingLatitude as number, detailActivity.meetingLongitude as number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-semibold text-brand-teal hover:underline"
                      >
                        Abrir ubicación en Google Maps ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3 rounded-xl border border-brand-navy/10 bg-brand-paper p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">Programación y Horarios</p>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Horario:</span>
                    <p className="text-sm font-semibold text-brand-navy">{describeSchedule(detailActivity)}</p>
                    {describeValidity(detailActivity) && (
                      <p className="mt-0.5 text-xs text-brand-ink/60">{describeValidity(detailActivity)}</p>
                    )}
                  </div>

                  {detailActivity.scheduleType === 'RECURRING' && detailActivity.nextOccurrence && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Próxima fecha:</span>
                      <p className="text-sm font-medium text-brand-navy">{formatDate(detailActivity.nextOccurrence)}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Duración estimada:</span>
                    <p className="text-sm font-medium text-brand-navy">{formatDuration(detailActivity.durationMinutes)}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-brand-navy/10 bg-brand-paper p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">Negocio responsable</p>
                  <p className="text-sm font-bold text-brand-navy">{detailActivity.business.businessName}</p>
                  <p className="text-xs text-brand-ink/70">
                    <strong className="text-brand-ink/80">Distrito:</strong> {DISTRICT_LABELS[detailActivity.business.district]}
                  </p>
                  <p className="text-xs text-brand-ink/70">
                    <strong className="text-brand-ink/80">Teléfono:</strong> {detailActivity.business.phone}
                  </p>
                  <p className="break-all text-xs text-brand-ink/70">
                    <strong className="text-brand-ink/80">Correo:</strong> {detailActivity.business.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ActivitiesTable
        activities={filtered}
        isLoading={isLoading}
        onView={openDetailModal}
        onEdit={openEditModal}
        onChangeStatus={handleChangeStatus}
      />

      <Modal
        size="xl"
        open={formOpen}
        onOpenChange={(open) => !open && closeFormModal()}
        title={editingActivity ? `Editar actividad — ${editingActivity.name}` : 'Nueva actividad'}
        description={
          editingActivity
            ? 'Los cambios se guardan sin afectar el estado de publicación actual.'
            : 'La actividad se creará como borrador vinculada al negocio seleccionado.'
        }
      >
        {formOpen && (
          <ActivityForm
            mode="admin"
            initial={editingActivity ?? undefined}
            businesses={businesses}
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
          />
        )}
      </Modal>

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

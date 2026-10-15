import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Modal, TableActionButton, useToast } from '../../../../components/ui'
import { activitiesService } from '../../services/activitiesService'
import type { ActivityPayload, ActivityRecord, ActivityStatus } from '../../types/activity.types'
import { categoryLabel, describeSchedule } from '../../utils/activityLabels'
import { ActivityForm } from '../ActivityForm/ActivityForm'
import { ActivityStatusBadge } from '../ActivityStatusBadge'

type View = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; activity: ActivityRecord }

interface MyActivitiesPanelProps {
  // The business was deactivated by the Cámara: the owner can look, not change.
  businessInactive?: boolean
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

// «Mis actividades»: where a business owner creates, edits and publishes the
// activities of their own business. Lives inside the profile page.
export function MyActivitiesPanel({ businessInactive = false }: MyActivitiesPanelProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [pending, setPending] = useState<{ activity: ActivityRecord; next: ActivityStatus } | null>(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      setActivities(await activitiesService.getMine())
    } catch (error) {
      setLoadError(errorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(payload: ActivityPayload) {
    if (view.kind === 'edit') {
      await activitiesService.updateMine(view.activity.id, payload)
      showToast({ variant: 'success', title: 'Cambios guardados', description: 'La actividad se actualizó correctamente.' })
    } else {
      await activitiesService.createMine(payload)
      showToast({
        variant: 'success',
        title: 'Actividad creada',
        description: 'Se guardó como borrador. Publíquela desde el listado cuando esté lista.',
      })
    }
    setView({ kind: 'list' })
    await load()
  }

  async function confirmStatusChange() {
    if (!pending) return
    try {
      setIsChangingStatus(true)
      await activitiesService.updateMineStatus(pending.activity.id, pending.next)
      showToast({
        variant: 'success',
        title: 'Estado actualizado',
        description:
          pending.next === 'PUBLICADA'
            ? 'La actividad ya es visible en el sitio público.'
            : 'La actividad dejó de mostrarse en el sitio público.',
      })
      setPending(null)
      await load()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo cambiar el estado', description: errorMessage(error) })
      setPending(null)
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (view.kind !== 'list') {
    return (
      <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 border-b border-brand-navy/10 pb-4">
          <h2 className="text-2xl font-bold text-brand-navy">{view.kind === 'edit' ? 'Editar actividad' : 'Nueva actividad'}</h2>
          <p className="mt-1 text-sm text-brand-ink/60">
            {view.kind === 'edit'
              ? 'Los cambios se guardan sin afectar el estado de publicación.'
              : 'Se crea como borrador. Podrá publicarla desde el listado.'}
          </p>
        </div>
        <ActivityForm
          mode="owner"
          initial={view.kind === 'edit' ? view.activity : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setView({ kind: 'list' })}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm md:p-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Mis actividades</h2>
          <p className="mt-1 max-w-xl text-sm text-brand-ink/60">
            Cree y publique las actividades que ofrece su negocio. Las publicadas aparecen en la página de Actividades del sitio.
          </p>
        </div>
        <Button variant="primary" disabled={businessInactive} onClick={() => setView({ kind: 'create' })}>
          Nueva actividad
        </Button>
      </div>

      {businessInactive && (
        <Alert variant="warning" title="Su negocio está inactivo">
          Mientras esté inactivo no puede crear ni modificar actividades, y las publicadas no se muestran en el sitio. Comuníquese con la Cámara para reactivarlo.
        </Alert>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-brand-navy/10 bg-white p-8 text-center text-brand-ink/60">Cargando actividades...</div>
      )}

      {!isLoading && loadError && (
        <Alert variant="error" title="No se pudieron cargar las actividades">
          {loadError}
        </Alert>
      )}

      {!isLoading && !loadError && activities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center text-brand-ink/60">
          Todavía no ha creado actividades. Use «Nueva actividad» para publicar la primera.
        </div>
      )}

      {!isLoading &&
        activities.map((activity) => (
          <article key={activity.id} className="flex flex-col gap-4 rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
            {activity.imageUrl ? (
              <img src={activity.imageUrl} alt="" className="h-40 w-full flex-none rounded-xl object-cover lg:h-24 lg:w-36" />
            ) : (
              <div className="flex h-40 w-full flex-none items-center justify-center rounded-xl bg-brand-sand text-[11px] uppercase tracking-wide text-brand-ink/40 lg:h-24 lg:w-36">
                Sin foto
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-brand-navy">{activity.name}</h3>
                <ActivityStatusBadge activity={activity} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-brand-ink/70">
                <Badge color="teal">{categoryLabel(activity)}</Badge>
                <span>{describeSchedule(activity, true)}</span>
              </div>
              {activity.status === 'INACTIVA' && (
                <p className="text-xs text-red-700">Desactivada por la Cámara. Solo la administración puede volver a activarla.</p>
              )}
              {activity.expired && activity.status !== 'INACTIVA' && (
                <p className="text-xs text-brand-ink/60">
                  Ya venció y no se muestra en el sitio. Edite la fecha para volver a publicarla.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 lg:justify-end">
              {activity.status === 'PUBLICADA' && !activity.expired && (
                <TableActionButton variant="view" onClick={() => navigate(`/actividades/${activity.slug}`)}>
                  Ver en el sitio
                </TableActionButton>
              )}
              <TableActionButton variant="edit" disabled={businessInactive} onClick={() => setView({ kind: 'edit', activity })}>
                Editar
              </TableActionButton>
              {activity.status === 'BORRADOR' && (
                <TableActionButton variant="publish" disabled={businessInactive} onClick={() => setPending({ activity, next: 'PUBLICADA' })}>
                  Publicar
                </TableActionButton>
              )}
              {activity.status === 'PUBLICADA' && (
                <TableActionButton variant="unpublish" disabled={businessInactive} onClick={() => setPending({ activity, next: 'BORRADOR' })}>
                  Despublicar
                </TableActionButton>
              )}
            </div>
          </article>
        ))}

      <Modal
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title={pending?.next === 'PUBLICADA' ? 'Publicar actividad' : 'Despublicar actividad'}
        description={
          pending?.next === 'PUBLICADA'
            ? 'La actividad será visible de inmediato en el sitio público.'
            : 'La actividad dejará de ser visible en el sitio público, pero se conserva como borrador.'
        }
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
        <p className="text-sm text-brand-ink/70">{pending ? `¿Desea continuar con «${pending.activity.name}»?` : 'Confirmación requerida.'}</p>
      </Modal>
    </div>
  )
}

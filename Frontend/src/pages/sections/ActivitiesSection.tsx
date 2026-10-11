import { Alert, Button, Container, SectionHeading } from '../../components/ui'
import { ActivityCard } from '../../modules/activities/components/ActivityCard/ActivityCard'
import { usePublicActivities } from '../../modules/activities/hooks/usePublicActivities'

const LANDING_LIMIT = 6

// Real data: the next published activities of active businesses. The full list,
// with filters, lives at /actividades.
export function ActivitiesSection() {
  const { data: activities, status } = usePublicActivities({ limit: LANDING_LIMIT })

  return (
    <section id="actividades" className="bg-white py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Qué hacer" eyebrowColor="green" title="Actividades para todos los gustos" />
          <Button href="/actividades" variant="outline">
            Ver todas las actividades
          </Button>
        </div>

        {status === 'loading' && <p className="text-brand-ink/60">Cargando actividades…</p>}

        {status === 'error' && (
          <Alert variant="error" title="No se pudieron cargar las actividades">
            Intente recargar la página en unos minutos.
          </Alert>
        )}

        {status === 'ready' && activities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-navy/15 p-10 text-center text-brand-ink/60">
            Pronto publicaremos nuevas actividades de los negocios afiliados.
          </div>
        )}

        {status === 'ready' && activities.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}

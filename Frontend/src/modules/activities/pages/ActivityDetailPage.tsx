import { useParams } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { Alert, Badge, Button, Container } from '../../../components/ui'
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from '../../../components/ui/icons'
import { MapView } from '../../../components/map/MapView'
import { CATEGORY_LABELS as BUSINESS_CATEGORY_LABELS, DISTRICT_LABELS } from '../../business/utils/constants'
import { getGoogleMapsUrl, isValidCoordinates } from '../../business/utils/geo'
import { useActivityBySlug } from '../hooks/usePublicActivities'
import type { ActivityRecord } from '../types/activity.types'
import { categoryLabel, describeSchedule, describeValidity, formatDate, formatDuration } from '../utils/activityLabels'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-ink/50">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-brand-navy">{children}</dd>
    </div>
  )
}

function BusinessCard({ business }: { business: ActivityRecord['business'] }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-navy/10 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-green">Ofrecida por</p>

      <div className="flex items-center gap-3">
        {business.coverImageUrl ? (
          <img src={business.coverImageUrl} alt="" className="h-14 w-14 flex-none rounded-lg object-cover" />
        ) : (
          <div className="h-14 w-14 flex-none rounded-lg bg-brand-sand" />
        )}
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy">{business.businessName}</span>
          <span className="text-xs text-brand-ink/60">{DISTRICT_LABELS[business.district]}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {business.categories.map((category) => (
          <Badge key={category} color="navy">
            {BUSINESS_CATEGORY_LABELS[category]}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm text-brand-ink/80">
        <a href={`tel:${business.phone}`} className="flex items-center gap-2 hover:text-brand-green">
          <PhoneIcon className="h-4 w-4 text-brand-green" />
          {business.phone}
        </a>
        <a href={`mailto:${business.email}`} className="flex items-center gap-2 break-all hover:text-brand-green">
          <MailIcon className="h-4 w-4 flex-none text-brand-green" />
          {business.email}
        </a>
        {business.facebookUrl && (
          <a href={business.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-green">
            <FacebookIcon className="h-4 w-4 text-brand-green" />
            Facebook
          </a>
        )}
        {business.instagramUrl && (
          <a href={business.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-green">
            <InstagramIcon className="h-4 w-4 text-brand-green" />
            Instagram
          </a>
        )}
      </div>
    </div>
  )
}

export default function ActivityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: activity, status } = useActivityBySlug(slug)

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Button href="/actividades" variant="text" className="mb-8">
            ← Volver a actividades
          </Button>

          {status === 'loading' && <p className="text-brand-ink/60">Cargando…</p>}

          {status === 'error' && (
            <Alert variant="error" title="Actividad no encontrada">
              Es posible que ya haya finalizado, que haya sido retirada o que el enlace esté incompleto.
            </Alert>
          )}

          {status === 'ready' && activity && <ActivityDetail activity={activity} />}
        </div>
      </Container>

      <Footer />
    </div>
  )
}

function ActivityDetail({ activity }: { activity: ActivityRecord }) {
  const validity = describeValidity(activity)
  const hasCoordinates = isValidCoordinates(activity.meetingLatitude, activity.meetingLongitude)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge color="teal">{categoryLabel(activity)}</Badge>
        <h1 className="text-3xl font-bold text-brand-navy md:text-4xl">{activity.name}</h1>
      </header>

      {activity.imageUrl && (
        <img src={activity.imageUrl} alt="" className="h-64 w-full rounded-2xl object-cover md:h-96" />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-brand-navy">Sobre la actividad</h2>
            <p className="whitespace-pre-line leading-relaxed text-brand-ink/80">{activity.description}</p>
          </section>

          {activity.requirements && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-brand-navy">Requisitos y recomendaciones</h2>
              <p className="whitespace-pre-line leading-relaxed text-brand-ink/80">{activity.requirements}</p>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-brand-navy">Punto de encuentro</h2>
            <p className="whitespace-pre-line leading-relaxed text-brand-ink/80">{activity.meetingPoint}</p>
            {hasCoordinates && (
              <div className="flex flex-col gap-2">
                <MapView
                  latitude={activity.meetingLatitude}
                  longitude={activity.meetingLongitude}
                  interactive={false}
                  height="280px"
                />
                <a
                  href={getGoogleMapsUrl(activity.meetingLatitude as number, activity.meetingLongitude as number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-sm font-semibold text-brand-teal hover:underline"
                >
                  Abrir en Google Maps
                </a>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <dl className="flex flex-col gap-4 rounded-2xl border border-brand-navy/10 bg-white p-5">
            <InfoRow label="Cuándo">
              {describeSchedule(activity)}
              {validity && <span className="mt-0.5 block text-xs font-normal text-brand-ink/60">{validity}</span>}
            </InfoRow>
            {activity.scheduleType === 'RECURRING' && activity.nextOccurrence && (
              <InfoRow label="Próxima fecha">{formatDate(activity.nextOccurrence)}</InfoRow>
            )}
            <InfoRow label="Duración">{formatDuration(activity.durationMinutes)}</InfoRow>
          </dl>

          <BusinessCard business={activity.business} />
        </aside>
      </div>
    </article>
  )
}

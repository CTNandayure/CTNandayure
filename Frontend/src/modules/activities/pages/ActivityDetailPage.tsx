import { useNavigate, useParams } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { Alert, Badge, Button, Container } from '../../../components/ui'
import { MailIcon, PhoneIcon } from '../../../components/ui/icons'
import { MapView } from '../../../components/map/MapView'
import { CATEGORY_LABELS as BUSINESS_CATEGORY_LABELS, DISTRICT_LABELS } from '../../business/utils/constants'
import { getGoogleMapsUrl, isValidCoordinates } from '../../business/utils/geo'
import { useActivityBySlug } from '../hooks/usePublicActivities'
import type { ActivityRecord } from '../types/activity.types'
import { categoryLabel, describeSchedule, describeValidity, formatDate, formatDuration } from '../utils/activityLabels'

const FacebookBrandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
)

const InstagramBrandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const ExternalArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 opacity-70 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-ink/50">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-brand-navy">{children}</dd>
    </div>
  )
}

function BusinessCard({ business }: { business: ActivityRecord['business'] }) {
  const navigate = useNavigate()
  const businessUrl = `/negocios/${business.slug || business.id}`

  return (
    <div
      onClick={() => navigate(businessUrl)}
      className="group flex flex-col gap-4 rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm transition-all hover:border-brand-green/40 hover:shadow-md cursor-pointer"
      title="Haz clic para ver el negocio"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-brand-green">Ofrecida por</p>

      <div className="flex items-center gap-3">
        {business.coverImageUrl ? (
          <img
            src={business.coverImageUrl}
            alt=""
            className="h-14 w-14 flex-none rounded-lg object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="h-14 w-14 flex-none rounded-lg bg-brand-sand" />
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-brand-navy group-hover:text-brand-green transition-colors truncate">
            {business.businessName}
          </span>
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

      <div className="flex flex-col gap-2.5 text-sm text-brand-ink/80 pt-1" onClick={(e) => e.stopPropagation()}>
        <a href={`tel:${business.phone}`} className="flex items-center gap-2.5 hover:text-brand-green font-medium">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <PhoneIcon className="h-3.5 w-3.5" />
          </div>
          <span>{business.phone}</span>
        </a>
        <a href={`mailto:${business.email}`} className="flex items-center gap-2.5 break-all hover:text-brand-green font-medium">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <MailIcon className="h-3.5 w-3.5" />
          </div>
          <span>{business.email}</span>
        </a>
      </div>

      {(business.facebookUrl || business.instagramUrl) && (
        <div className="border-t border-brand-navy/10 pt-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Redes sociales</span>
          <div className="mt-2.5 flex items-center gap-2">
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noreferrer"
                title="Ver en Facebook"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-navy/10 px-2.5 py-2 text-[#1877F2] hover:bg-blue-50 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
              >
                <FacebookBrandIcon />
                <span>Facebook</span>
                <ExternalArrowIcon />
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noreferrer"
                title="Ver en Instagram"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-navy/10 px-2.5 py-2 text-[#E1306C] hover:bg-pink-50 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
              >
                <InstagramBrandIcon />
                <span>Instagram</span>
                <ExternalArrowIcon />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActivityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: activity, status } = useActivityBySlug(slug)
  const navigate = useNavigate()

  const handleBack = () => {
    const canGoBack =
      window.history.state && typeof window.history.state.idx === 'number'
        ? window.history.state.idx > 0
        : window.history.length > 1

    if (canGoBack) {
      navigate(-1)
    } else {
      navigate('/#actividades')
    }
  }

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Button onClick={handleBack} variant="text" className="mb-8">
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

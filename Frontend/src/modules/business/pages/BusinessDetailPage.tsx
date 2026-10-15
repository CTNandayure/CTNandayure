import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { Alert, Badge, Button, Container, SectionHeading } from '../../../components/ui'
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../../../components/ui/icons'
import { MapView } from '../../../components/map/MapView'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../utils/constants'
import { getGoogleMapsUrl, isValidCoordinates } from '../utils/geo'
import { usePublicBusiness } from '../hooks/usePublicBusiness'
import { usePublicActivities } from '../../activities/hooks/usePublicActivities'
import { ActivityCard } from '../../activities/components/ActivityCard/ActivityCard'
import type { BusinessCategory, DistrictKey, PublicBusiness } from '../types/business.types'

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

interface LightboxProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex)

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length])

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 focus:outline-none"
        >
          <Dialog.Title className="sr-only">Visualizador de imagen</Dialog.Title>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-white/10 p-3 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Cerrar imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Imagen anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[idx]}
              alt={`Imagen ${idx + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Siguiente imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white/80">
              {idx + 1} / {images.length}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function BusinessDetail({ business }: { business: PublicBusiness }) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const { data: activities, status: activitiesStatus } = usePublicActivities({ businessId: business.id })

  const allImages = [
    ...(business.coverImageUrl ? [business.coverImageUrl] : []),
    ...(business.galleryUrls || []),
  ]

  const hasCoordinates = isValidCoordinates(business.latitude, business.longitude)

  const openLightbox = (index: number) => {
    if (allImages.length > 0) {
      setLightbox({ images: allImages, index })
    }
  }

  return (
    <>
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(business.categories || []).map((category) => (
              <Badge key={category} color="navy">
                {CATEGORY_LABELS[category as BusinessCategory] ?? category}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-brand-navy md:text-5xl">{business.businessName}</h1>

          <div className="flex items-center gap-2 text-sm font-medium text-brand-ink/70">
            <PinIcon className="h-4 w-4 text-brand-green" />
            <span>{DISTRICT_LABELS[business.district as DistrictKey] ?? business.district}, Nandayure</span>
          </div>
        </header>

        {business.coverImageUrl && (
          <div
            className="flex justify-center cursor-pointer"
            onClick={() => openLightbox(0)}
            title="Haz clic para ampliar la imagen"
          >
            <img
              src={business.coverImageUrl}
              alt={business.businessName}
              className="max-h-[500px] w-auto max-w-full rounded-2xl object-contain transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-brand-navy">Sobre el negocio</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-brand-ink/80">{business.description}</p>
            </section>

            {business.galleryUrls && business.galleryUrls.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-brand-navy">Galería de fotos</h2>
                  <span className="text-xs font-medium text-brand-ink/60">
                    Haz clic en una imagen para ampliarla
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {business.galleryUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openLightbox(business.coverImageUrl ? i + 1 : i)}
                      title="Haz clic para ampliar la imagen"
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-brand-navy/10 bg-brand-sand cursor-pointer transition-transform hover:scale-105 hover:shadow-md focus:outline-none"
                    >
                      <img
                        src={url}
                        alt={`Foto ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-brand-navy">Ubicación</h2>
              <p className="text-[15px] leading-relaxed text-brand-ink/80">{business.address}</p>

              {hasCoordinates && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="overflow-hidden rounded-2xl border border-brand-navy/10 shadow-sm">
                    <MapView
                      latitude={business.latitude as number}
                      longitude={business.longitude as number}
                      interactive={false}
                      height="300px"
                    />
                  </div>
                  <a
                    href={getGoogleMapsUrl(business.latitude as number, business.longitude as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-semibold text-brand-teal hover:underline"
                  >
                    Abrir ubicación en Google Maps ↗
                  </a>
                </div>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-green">Información y Contacto</h3>

              <div className="flex flex-col gap-3.5 text-sm">
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 font-medium text-brand-navy hover:text-brand-green"
                >
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <PhoneIcon className="h-4 w-4" />
                  </div>
                  <span>{business.phone}</span>
                </a>

                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 font-medium text-brand-navy hover:text-brand-green break-all"
                >
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <span>{business.email}</span>
                </a>

                <div className="flex items-start gap-3 text-brand-ink/80">
                  <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <span className="leading-snug">{business.scheduleText}</span>
                </div>
              </div>

              {(business.facebookUrl || business.instagramUrl) && (
                <div className="border-t border-brand-navy/10 pt-4">
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
          </aside>
        </div>

        <section className="mt-8 border-t border-brand-navy/10 pt-12">
          <SectionHeading
            eyebrow="Experiencias"
            eyebrowColor="green"
            title={`Actividades de ${business.businessName}`}
            lede="Consulte las actividades turísticas y recreativas publicadas por este negocio."
          />

          <div className="mt-8">
            {activitiesStatus === 'loading' && <p className="text-brand-ink/60">Cargando actividades…</p>}

            {activitiesStatus === 'ready' && activities.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-10 text-center text-brand-ink/60">
                Este negocio no tiene actividades programadas en este momento.
              </div>
            )}

            {activitiesStatus === 'ready' && activities.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </section>
      </article>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

export default function BusinessDetailPage() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>()
  const identifier = slug || id
  const { data: business, status } = usePublicBusiness(identifier)
  const navigate = useNavigate()

  const handleBack = () => {
    const canGoBack =
      window.history.state && typeof window.history.state.idx === 'number'
        ? window.history.state.idx > 0
        : window.history.length > 1

    if (canGoBack) {
      navigate(-1)
    } else {
      navigate('/#negocios')
    }
  }

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Button onClick={handleBack} variant="text" className="mb-8">
            ← Volver al directorio de negocios
          </Button>

          {status === 'loading' && <p className="text-brand-ink/60">Cargando…</p>}

          {status === 'error' && (
            <Alert variant="error" title="Negocio no encontrado">
              Es posible que el negocio haya sido retirado o que el enlace esté incompleto.
            </Alert>
          )}

          {status === 'ready' && business && <BusinessDetail business={business} />}
        </div>
      </Container>

      <Footer />
    </div>
  )
}


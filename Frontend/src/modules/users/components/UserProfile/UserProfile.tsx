import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Card, Badge, Button } from '../../../../components/ui'
import { Link } from 'react-router-dom'
import { useUserProfile } from './hooks/useUserProfile'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../../business/utils/constants'
import type { BusinessRecord } from '../../../business/types/business.types'
import { BusinessLocationView } from '../../../business/components/BusinessLocationPicker'

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const ExternalArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              alt={'Imagen ' + (idx + 1)}
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

interface UserProfileProps {
  business?: BusinessRecord | null
  loadingBusiness?: boolean
  onGoToBusinessTab?: () => void
}

export function UserProfile({ business, loadingBusiness = false, onGoToBusinessTab }: UserProfileProps) {
  const { user } = useUserProfile()
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  if (!user) return null

  const fullName = [user.person?.name, user.person?.first_lastname, user.person?.second_lastname]
    .filter(Boolean)
    .join(' ') || 'Sin nombre registrado'

  const isBusinessUser = user.role === 'NEGOCIO'

  const allImages = [
    ...(business?.coverImageUrl ? [business.coverImageUrl] : []),
    ...(business?.galleryUrls || []),
  ]

  const openLightbox = (index: number) => {
    setLightbox({ images: allImages, index })
  }

  return (
    <>
      <Card className="overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-6 bg-brand-navy px-7 py-8 text-white md:px-10 md:py-10">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green text-3xl font-bold text-white ring-4 ring-white/15">
              {fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-yellow">
                Usuario registrado
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">{fullName}</h2>
            </div>
          </div>
          <div className="rounded-lg bg-brand-yellow text-brand-navy px-5 py-3 text-sm font-semibold shadow-sm border border-brand-yellow">
            <span className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70">Rol</span>
            <strong className="mt-0.5 block text-base font-extrabold text-brand-navy">{user.role}</strong>
          </div>
        </div>

        <div className="p-7 md:p-10 space-y-10">
          <div className="grid gap-8 md:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-strong">
                Información personal
              </p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-brand-navy/10 bg-brand-paper p-5 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                    Correo electrónico
                  </dt>
                  <dd className="mt-2 break-all text-lg font-semibold text-brand-navy">
                    {user.email}
                  </dd>
                </div>
                <div className="rounded-lg border border-brand-navy/10 bg-brand-paper p-5">
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                    Nombre completo
                  </dt>
                  <dd className="mt-2 text-brand-navy">{fullName}</dd>
                </div>
                <div className="rounded-lg border border-brand-navy/10 bg-brand-paper p-5">
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                    Teléfono
                  </dt>
                  <dd className="mt-2 text-brand-navy">{user.person?.phone || 'No registrado'}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-brand-navy/10 bg-brand-sand/45 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-strong">
                  Seguridad
                </p>
                <h3 className="mt-3 text-xl font-bold text-brand-navy">Protege tu acceso</h3>
                <p className="mt-2 text-sm leading-6 text-brand-ink/65">
                  Actualiza tu contraseña periódicamente para mantener segura tu cuenta.
                </p>
              </div>
              <Link
                to="/users/cambiar-contrasena"
                state={{ from: '/users/perfil' }}
                className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-yellow px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:brightness-95"
              >
                Cambiar contraseña
              </Link>
            </div>
          </div>

          {isBusinessUser && (
            <div className="border-t border-brand-navy/10 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-strong">
                    Información del negocio
                  </p>
                  <p className="mt-1 text-sm text-brand-ink/60">
                    Datos registrados del negocio asociado a su cuenta.
                  </p>
                </div>

                {onGoToBusinessTab && (
                  <Button
                    variant="navy"
                    onClick={onGoToBusinessTab}
                    className="flex items-center gap-2 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar en Mi Negocio</span>
                  </Button>
                )}
              </div>

              {loadingBusiness ? (
                <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-8 text-center text-sm text-brand-ink/60">
                  Cargando información del negocio...
                </div>
              ) : business ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-navy/10 pb-4">
                      <div>
                        <h4 className="text-xl font-bold text-brand-navy">{business.businessName}</h4>
                        <p className="mt-1 text-xs text-brand-ink/60">
                          Distrito: <span className="font-semibold text-brand-navy">{DISTRICT_LABELS[business.district] ?? business.district}</span>
                        </p>
                      </div>
                      <Badge color={business.businessStatus === 'ACTIVE' ? 'green' : 'yellow'}>
                        {business.businessStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55 mb-2">
                        Categorías
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(business.categories || []).map((cat) => (
                          <Badge key={cat} color="teal">
                            {CATEGORY_LABELS[cat] ?? cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55 mb-1">
                        Descripción
                      </p>
                      <p className="text-sm text-brand-ink/80 whitespace-pre-line leading-relaxed">
                        {business.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                        Teléfono del negocio
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-navy">{business.phone || '-'}</p>
                    </div>

                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                        Correo del negocio
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-navy break-all">{business.email || '-'}</p>
                    </div>

                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5 sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                        Dirección física
                      </p>
                      <p className="mt-1 text-sm text-brand-navy">{business.address || '-'}</p>
                    </div>

                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5 sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55 mb-2">
                        Ubicación geográfica
                      </p>
                      <BusinessLocationView
                        latitude={business.latitude}
                        longitude={business.longitude}
                        accuracy={business.accuracy}
                        mapHeight="220px"
                      />
                    </div>

                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5 sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
                        Horario de atención
                      </p>
                      <p className="mt-1 text-sm text-brand-navy whitespace-pre-line">{business.scheduleText || '-'}</p>
                    </div>

                    {(business.facebookUrl || business.instagramUrl) && (
                      <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5 sm:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55 mb-2">
                          Redes sociales
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {business.facebookUrl && (
                            <a
                              href={business.facebookUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#1877F2] hover:bg-blue-50 transition-colors shadow-sm"
                            >
                              <FacebookIcon />
                              <span>Facebook</span>
                              <ExternalArrowIcon />
                            </a>
                          )}
                          {business.instagramUrl && (
                            <a
                              href={business.instagramUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#E1306C] hover:bg-pink-50 transition-colors shadow-sm"
                            >
                              <InstagramIcon />
                              <span>Instagram</span>
                              <ExternalArrowIcon />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-ink/55 mb-4">
                      Fotografías del negocio
                    </p>
                    <div className="space-y-6">
                      {business.coverImageUrl && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Portada / Logo</p>
                          <button
                            type="button"
                            onClick={() => openLightbox(0)}
                            className="cursor-pointer rounded-xl overflow-hidden border-2 border-brand-green hover:opacity-90 transition-opacity focus:outline-none block shadow-sm"
                            title="Clic para ver en grande"
                          >
                            <img
                              src={business.coverImageUrl}
                              alt="Portada del negocio"
                              className="max-h-64 max-w-full w-auto h-auto object-contain rounded-lg"
                            />
                          </button>
                        </div>
                      )}

                      {business.galleryUrls && business.galleryUrls.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                            Galería ({business.galleryUrls.length} {business.galleryUrls.length === 1 ? 'foto' : 'fotos'})
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {business.galleryUrls.map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => openLightbox(business.coverImageUrl ? idx + 1 : idx)}
                                className="cursor-pointer rounded-xl overflow-hidden border border-brand-navy/10 hover:opacity-90 transition-opacity focus:outline-none shadow-sm"
                                title="Clic para ver en grande"
                              >
                                <img
                                  src={url}
                                  alt={'Galería ' + (idx + 1)}
                                  className="h-36 w-36 sm:h-40 sm:w-40 object-contain rounded-lg"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!business.coverImageUrl && (!business.galleryUrls || business.galleryUrls.length === 0) && (
                        <p className="text-sm text-brand-ink/50">No hay imágenes adjuntas.</p>
                      )}
                    </div>
                  </div>

                  {business.documentUrls && business.documentUrls.length > 0 && (
                    <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55 mb-3">
                        {'Documentos registrados (' + business.documentUrls.length + ')'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {business.documentUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-sand hover:text-brand-teal transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{'Documento ' + (idx + 1)}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-brand-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-brand-navy/15 bg-brand-paper/50 p-6 text-center">
                  <p className="text-sm text-brand-ink/60">
                    No se encontró un negocio registrado para esta cuenta.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

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

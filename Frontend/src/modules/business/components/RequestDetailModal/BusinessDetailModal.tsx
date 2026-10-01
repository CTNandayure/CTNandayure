import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Badge, Button, Modal } from '../../../../components/ui'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'
import type { BusinessRequestRecord, BusinessRecord } from '../../types/business.types'

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-brand-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}

type TabKey = 'personal' | 'business' | 'contact' | 'multimedia' | 'documents'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'personal', label: 'Datos personales' },
  { key: 'business', label: 'Negocio' },
  { key: 'contact', label: 'Contacto' },
  { key: 'multimedia', label: 'Multimedia' },
  { key: 'documents', label: 'Documentos' },
]

interface BusinessDetailModalProps {
  open: boolean
  onClose: () => void
  request?: BusinessRequestRecord | null
  business?: BusinessRecord | null
}

export function BusinessDetailModal({ open, onClose, request, business }: BusinessDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  const data = request ?? business
  if (!data) return null

  const isRequest = Boolean(request)

  const coverImageUrl = data.coverImageUrl
  const galleryUrls = data.galleryUrls ?? []
  const allImages = [coverImageUrl, ...galleryUrls].filter(Boolean) as string[]

  const openLightbox = (index: number) => setLightbox({ images: allImages, index })

  const personName = request
    ? [request.applicantName, request.applicantFirstLastname, request.applicantSecondLastname].filter(Boolean).join(' ').trim()
    : business?.request
    ? [business.request.applicantName, business.request.applicantFirstLastname, business.request.applicantSecondLastname].filter(Boolean).join(' ').trim()
    : business?.user?.person
    ? [business.user.person.name, business.user.person.first_lastname, business.user.person.second_lastname].filter(Boolean).join(' ').trim()
    : null

  const personPhone = request
    ? request.applicantPhone
    : business?.request?.applicantPhone ?? business?.user?.person?.phone ?? null

  const personEmail = request
    ? request.applicantEmail
    : business?.request?.applicantEmail ?? business?.user?.email ?? null

  const registrationDate = data.createdAt ? new Date(data.createdAt).toLocaleString('es-CR') : null

  return (
    <>
      <Modal
        size="xl"
        open={open}
        onOpenChange={(o) => !o && onClose()}
        title={data.businessName}
        description={isRequest ? `Solicitud #${data.id.slice(0, 8)}` : 'Negocio afiliado'}
        footer={
          <div className="flex justify-start">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1 border-b border-brand-navy/10 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={[
                'px-3 py-2 text-sm font-medium transition-colors rounded-t-lg border-b-2 cursor-pointer',
                activeTab === key
                  ? 'border-brand-green text-brand-navy bg-brand-paper/50'
                  : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'personal' && (
          <dl className="grid gap-4 sm:grid-cols-2">
            {personName && (
              <DetailField label="Nombre completo">
                <span className="text-sm font-medium text-brand-navy">{personName}</span>
              </DetailField>
            )}
            {personPhone && (
              <DetailField label="Teléfono personal">
                <span className="text-sm font-medium text-brand-navy">{personPhone}</span>
              </DetailField>
            )}
            {personEmail && (
              <DetailField label="Correo personal">
                <span className="text-sm font-medium text-brand-navy break-all">{personEmail}</span>
              </DetailField>
            )}
            {registrationDate && (
              <DetailField label={isRequest ? 'Fecha de solicitud' : 'Fecha de registro'}>
                <span className="text-sm font-medium text-brand-navy">{registrationDate}</span>
              </DetailField>
            )}
            {!personName && !personPhone && !personEmail && (
              <div className="sm:col-span-2 rounded-xl bg-brand-paper p-4 text-sm text-brand-ink/60 text-center">
                No hay información de contacto personal registrada.
              </div>
            )}
          </dl>
        )}

        {activeTab === 'business' && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Distrito">
              <span className="text-sm font-medium text-brand-navy">
                {DISTRICT_LABELS[data.district as keyof typeof DISTRICT_LABELS] ?? data.district}
              </span>
            </DetailField>
            <DetailField label="Categorías">
              <div className="flex flex-wrap gap-1">
                {data.categories.map((c) => (
                  <Badge key={c} color="teal">
                    {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}
                  </Badge>
                ))}
              </div>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label="Descripción">
                <p className="text-sm text-brand-ink/80 whitespace-pre-line">{data.description}</p>
              </DetailField>
            </div>
            {'businessStatus' in data && (
              <DetailField label="Estado">
                <Badge color={(data as BusinessRecord).businessStatus === 'ACTIVE' ? 'green' : 'yellow'}>
                  {(data as BusinessRecord).businessStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </Badge>
              </DetailField>
            )}
            {'requestStatus' in data && request && (
              <DetailField label="Estado de solicitud">
                <Badge color={request.requestStatus === 'PENDING' ? 'yellow' : request.requestStatus === 'APPROVED' ? 'green' : 'red'}>
                  {request.requestStatus === 'PENDING' ? 'Pendiente' : request.requestStatus === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                </Badge>
              </DetailField>
            )}
          </dl>
        )}

        {activeTab === 'contact' && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Teléfono del negocio">
              <span className="text-sm font-medium text-brand-navy">{data.phone}</span>
            </DetailField>
            <DetailField label="Correo del negocio">
              <span className="text-sm font-medium text-brand-navy break-all">{data.email}</span>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label="Dirección">
                <p className="text-sm text-brand-ink/80 whitespace-pre-line">{data.address}</p>
              </DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label="Horario de atención">
                <p className="text-sm text-brand-ink/80 whitespace-pre-line">{data.scheduleText}</p>
              </DetailField>
            </div>
            {(data.facebookUrl || data.instagramUrl) && (
              <div className="sm:col-span-2">
                <DetailField label="Redes sociales">
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {data.facebookUrl && (
                      <a
                        href={data.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver en Facebook"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-navy/10 px-3 py-2 text-[#1877F2] hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <FacebookIcon />
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                    )}
                    {data.instagramUrl && (
                      <a
                        href={data.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver en Instagram"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-navy/10 px-3 py-2 text-[#E1306C] hover:bg-pink-50 transition-colors cursor-pointer"
                      >
                        <InstagramIcon />
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                    )}
                  </div>
                </DetailField>
              </div>
            )}
          </dl>
        )}

        {activeTab === 'multimedia' && (
          <div className="space-y-6">
            {coverImageUrl && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Portada / Logo</p>
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="cursor-pointer rounded-lg overflow-hidden border-2 border-brand-green hover:opacity-90 transition-opacity focus:outline-none"
                  title="Clic para ver en grande"
                >
                  <img src={coverImageUrl} alt="Portada" className="h-40 w-auto object-cover" />
                </button>
              </div>
            )}
            {galleryUrls.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                  Galería ({galleryUrls.length} {galleryUrls.length === 1 ? 'foto' : 'fotos'})
                </p>
                <div className="flex flex-wrap gap-3">
                  {galleryUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openLightbox(i + 1)}
                      className="cursor-pointer rounded-lg overflow-hidden border border-brand-navy/10 hover:opacity-90 transition-opacity focus:outline-none"
                      title="Clic para ver en grande"
                    >
                      <img src={url} alt={`Galería ${i + 1}`} className="h-24 w-24 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!coverImageUrl && galleryUrls.length === 0 && (
              <p className="text-sm text-brand-ink/50">No hay imágenes adjuntas.</p>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Documentos legales</p>
            {data.documentUrls && data.documentUrls.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {data.documentUrls.map((url: string, i: number) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/10 px-3 py-2 text-sm font-medium text-brand-teal hover:bg-brand-paper transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documento {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-ink/50">No hay documentos adjuntos.</p>
            )}

            {isRequest && request && request.requestStatus === 'REJECTED' && request.rejectionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-red-600">Motivo del rechazo</dt>
                <dd className="mt-1 text-sm text-red-800">{request.rejectionReason}</dd>
              </div>
            )}
          </div>
        )}
      </Modal>

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

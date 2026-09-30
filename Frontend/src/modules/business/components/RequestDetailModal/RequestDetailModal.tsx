import { Badge, Button, Modal } from '../../../../components/ui'
import { CATEGORY_LABELS, DISTRICT_LABELS, REQUEST_STATUS_LABELS } from '../../utils/constants'
import type { BusinessRequestRecord } from '../../types/business.types'

const STATUS_COLORS = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red' } as const

interface RequestDetailModalProps {
  open: boolean
  onClose: () => void
  request: BusinessRequestRecord
}

export function RequestDetailModal({ open, onClose, request }: RequestDetailModalProps) {
  return (
    <Modal
      size="lg"
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={request.businessName}
      description="Detalle de la solicitud"
      footer={
        <div className="flex justify-start">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Status & ID */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-ink/50">Solicitud #{request.id.slice(0, 8)}</span>
          <Badge color={STATUS_COLORS[request.requestStatus]}>{REQUEST_STATUS_LABELS[request.requestStatus]}</Badge>
        </div>

        {/* Applicant & Location */}
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-paper p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Solicitante</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">{request.applicantName} {request.applicantFirstLastname} {request.applicantSecondLastname}</dd>
            <dd className="text-sm text-brand-ink/60">{request.applicantPhone}</dd>
          </div>
          <div className="rounded-xl bg-brand-paper p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Ubicación</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">{DISTRICT_LABELS[request.district]}</dd>
            <dd className="text-sm text-brand-ink/60">{request.address}</dd>
          </div>
        </dl>

        {/* Categories */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Categorías</p>
          <div className="flex flex-wrap gap-1">
            {request.categories.map((c) => <Badge key={c} color="teal">{CATEGORY_LABELS[c]}</Badge>)}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl bg-brand-paper p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Descripción</dt>
          <dd className="mt-1 text-sm text-brand-ink/80 whitespace-pre-line">{request.description}</dd>
        </div>

        {/* Contact */}
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-paper p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Teléfono del negocio</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">{request.phone}</dd>
          </div>
          <div className="rounded-xl bg-brand-paper p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Correo</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy break-all">{request.email}</dd>
          </div>
          {request.facebookUrl && (
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Facebook</dt>
              <dd className="mt-1"><a href={request.facebookUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-teal hover:underline">{request.facebookUrl}</a></dd>
            </div>
          )}
          {request.instagramUrl && (
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Instagram</dt>
              <dd className="mt-1"><a href={request.instagramUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-teal hover:underline">{request.instagramUrl}</a></dd>
            </div>
          )}
        </dl>

        {/* Schedule */}
        <div className="rounded-xl bg-brand-paper p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Horario</dt>
          <dd className="mt-1 text-sm text-brand-ink/80 whitespace-pre-line">{request.scheduleText}</dd>
        </div>

        {/* Images */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Imágenes</p>
          <div className="grid grid-cols-4 gap-2">
            <img src={request.coverImageUrl} alt="Portada" className="h-24 w-full rounded-lg border-2 border-brand-green object-cover" title="Portada" />
            {request.galleryUrls.map((url, i) => (
              <img key={i} src={url} alt={`Galería ${i + 1}`} className="h-24 w-full rounded-lg border border-brand-navy/10 object-cover" />
            ))}
          </div>
        </div>

        {/* Documents */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Documentos</p>
          <ul className="flex flex-col gap-2">
            {request.documentUrls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/10 px-3 py-2 text-sm font-medium text-brand-teal hover:bg-brand-paper">
                  📄 Documento {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Rejection reason */}
        {request.requestStatus === 'REJECTED' && request.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-red-600">Motivo del rechazo</dt>
            <dd className="mt-1 text-sm text-red-800">{request.rejectionReason}</dd>
          </div>
        )}
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import { Button, Modal, Textarea } from '../../../../components/ui'
import type { BusinessRequestRecord } from '../../types/business.types'

interface RejectRequestModalProps {
  open: boolean
  onClose: () => void
  request: BusinessRequestRecord
  onConfirm: (reason: string) => Promise<void>
}

export function RejectRequestModal({ open, onClose, request, onConfirm }: RejectRequestModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (reason.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres')
      return
    }
    setIsSubmitting(true)
    try {
      await onConfirm(reason)
      setReason('')
      setError('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose()
          setReason('')
          setError('')
        }
      }}
      title="Rechazar solicitud"
      description={`Esta acción enviará un correo al solicitante de "${request.businessName}" con el motivo del rechazo.`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Rechazando...' : 'Rechazar solicitud'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="text-sm font-medium text-brand-navy">Motivo del rechazo</label>
        <Textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError('') }}
          placeholder="Explique el motivo por el cual se rechaza esta solicitud (mínimo 10 caracteres)..."
          rows={4}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  )
}

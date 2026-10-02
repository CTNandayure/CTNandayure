import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardProgress } from './WizardProgress'
import { StepPersonalInfo } from './StepPersonalInfo'
import { StepBusinessInfo } from './StepBusinessInfo'
import { StepContactLocation } from './StepContactLocation'
import { StepMultimedia } from './StepMultimedia'
import { StepDocuments } from './StepDocuments'
import { StepReview } from './StepReview'
import { useAffiliationWizard } from '../../hooks/useAffiliationWizard'
import { Button, Alert, Modal } from '../../../../components/ui'

interface AffiliationWizardProps {
  isAdminMode?: boolean
  isEditMode?: boolean
  initialData?: any
  businessId?: string
  isUserSelfManagement?: boolean
  onComplete?: () => void
  onCancel?: () => void
}

export const AffiliationWizard: React.FC<AffiliationWizardProps> = ({
  isAdminMode = false,
  isEditMode = false,
  initialData = null,
  businessId,
  isUserSelfManagement = false,
  onComplete,
  onCancel,
}) => {
  const wizard = useAffiliationWizard({
    isAdminMode,
    isEditMode,
    initialData,
    businessId,
    isUserSelfManagement,
  })
  const navigate = useNavigate()
  const handleCancel = onCancel ?? (() => navigate('/'))
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (wizard.isComplete) {
    if (onComplete) {
      onComplete()
      return null
    }
  }

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 0:
        return <StepPersonalInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} isEditMode={isEditMode} />
      case 1:
        return <StepBusinessInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 2:
        return <StepContactLocation formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 3:
        return <StepMultimedia formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 4:
        return <StepDocuments formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 5:
        return <StepReview formData={wizard.formData} isAdminMode={isAdminMode} isEditMode={isEditMode} goToStep={wizard.goToStep} />
      default:
        return null
    }
  }

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false)
    await wizard.submit()
  }

  const submitLabel = isEditMode
    ? 'Guardar cambios'
    : isAdminMode
    ? 'Registrar negocio'
    : 'Enviar solicitud'

  const confirmTitle = isEditMode
    ? 'Confirmar cambios'
    : isAdminMode
    ? 'Confirmar registro'
    : 'Confirmar solicitud'

  const confirmDescription = isEditMode
    ? '¿Está seguro de que desea guardar los cambios realizados en el negocio?'
    : isAdminMode
    ? '¿Está seguro de que desea registrar este negocio con la información proporcionada?'
    : '¿Está seguro de que desea enviar la solicitud de afiliación con la información proporcionada?'

  const primaryVariant = isEditMode ? 'navy' : 'primary'
  const isFramed = !isAdminMode && !isEditMode && !isUserSelfManagement

  return (
    <div className={isFramed ? "bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto" : "w-full"}>
      <WizardProgress currentStep={wizard.currentStep} completedSteps={wizard.completedSteps} isEditMode={isEditMode} />

      {wizard.errors.submit && (
        <div className="mb-6">
          <Alert variant="error">{wizard.errors.submit}</Alert>
        </div>
      )}

      <div className="mt-8 mb-10">
        {renderStep()}
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-brand-navy/10 mt-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={wizard.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={wizard.prevStep}
            disabled={wizard.currentStep === 0 || wizard.isSubmitting}
          >
            Anterior
          </Button>
        </div>

        {wizard.currentStep === 5 ? (
          <Button
            variant={primaryVariant}
            onClick={() => setConfirmOpen(true)}
            disabled={wizard.isSubmitting}
          >
            {wizard.isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        ) : (
          <Button
            variant={primaryVariant}
            onClick={wizard.nextStep}
          >
            Siguiente
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
        title={confirmTitle}
        description={confirmDescription}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmedSubmit} disabled={wizard.isSubmitting}>
              {wizard.isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar' : 'Confirmar')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {isEditMode
            ? 'Los cambios se aplicarán inmediatamente a la información del negocio.'
            : isAdminMode
            ? 'Esta acción registrará el negocio directamente en el sistema.'
            : 'Esta acción enviará la solicitud para su revisión. Recibirá un correo con la resolución.'}
        </p>
      </Modal>
    </div>
  )
}

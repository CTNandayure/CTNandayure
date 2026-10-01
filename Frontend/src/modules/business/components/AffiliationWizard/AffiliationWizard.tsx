import React, { useState } from 'react'
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
  onComplete?: () => void
}

export const AffiliationWizard: React.FC<AffiliationWizardProps> = ({ isAdminMode = false, onComplete }) => {
  const wizard = useAffiliationWizard(isAdminMode)
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
        return <StepPersonalInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 1:
        return <StepBusinessInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 2:
        return <StepContactLocation formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 3:
        return <StepMultimedia formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 4:
        return <StepDocuments formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 5:
        return <StepReview formData={wizard.formData} isAdminMode={isAdminMode} goToStep={wizard.goToStep} />
      default:
        return null
    }
  }

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false)
    await wizard.submit()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
      <WizardProgress currentStep={wizard.currentStep} completedSteps={wizard.completedSteps} />

      {wizard.errors.submit && (
        <div className="mb-6">
          <Alert variant="error">{wizard.errors.submit}</Alert>
        </div>
      )}

      <div className="mt-8 mb-10">
        {renderStep()}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={wizard.prevStep}
          disabled={wizard.currentStep === 0 || wizard.isSubmitting}
        >
          Anterior
        </Button>

        {wizard.currentStep === 5 ? (
          <Button
            variant="primary"
            onClick={() => setConfirmOpen(true)}
            disabled={wizard.isSubmitting}
          >
            {wizard.isSubmitting ? 'Enviando...' : (isAdminMode ? 'Registrar negocio' : 'Enviar solicitud')}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={wizard.nextStep}
          >
            Siguiente
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
        title={isAdminMode ? 'Confirmar registro' : 'Confirmar solicitud'}
        description={isAdminMode
          ? '¿Está seguro de que desea registrar este negocio con la información proporcionada?'
          : '¿Está seguro de que desea enviar la solicitud de afiliación con la información proporcionada?'
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmedSubmit} disabled={wizard.isSubmitting}>
              {wizard.isSubmitting ? 'Enviando...' : 'Confirmar'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          Esta acción {isAdminMode ? 'registrará el negocio' : 'enviará la solicitud'} para su procesamiento.
          {!isAdminMode && ' Recibirá un correo electrónico con la resolución de su solicitud.'}
        </p>
      </Modal>
    </div>
  )
}

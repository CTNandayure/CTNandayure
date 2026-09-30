import React from 'react'
import { WizardProgress } from './WizardProgress'
import { StepBusinessInfo } from './StepBusinessInfo'
import { StepContactLocation } from './StepContactLocation'
import { StepMultimedia } from './StepMultimedia'
import { StepDocuments } from './StepDocuments'
import { StepPersonalInfo } from './StepPersonalInfo'
import { StepReview } from './StepReview'
import { useAffiliationWizard } from '../../hooks/useAffiliationWizard'
import { Button, Alert } from '../../../../components/ui'

interface AffiliationWizardProps {
  isAdminMode?: boolean
  onComplete?: () => void
}

export const AffiliationWizard: React.FC<AffiliationWizardProps> = ({ isAdminMode = false, onComplete }) => {
  const wizard = useAffiliationWizard(isAdminMode)

  if (wizard.isComplete) {
    if (onComplete) {
      onComplete()
      return null
    }
  }

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 0:
        return <StepBusinessInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 1:
        return <StepContactLocation formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 2:
        return <StepMultimedia formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 3:
        return <StepDocuments formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 4:
        return <StepPersonalInfo formData={wizard.formData} errors={wizard.errors} updateField={wizard.updateField} />
      case 5:
        return <StepReview formData={wizard.formData} isAdminMode={isAdminMode} goToStep={wizard.goToStep} />
      default:
        return null
    }
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
            onClick={wizard.submit}
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
    </div>
  )
}

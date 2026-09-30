import { useState } from 'react'
import { businessService } from '../services/businessService'
import { validateStep } from '../utils/businessValidators'

export function useAffiliationWizard(isAdminMode: boolean = false) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateCurrentStep = () => {
    const stepErrors = validateStep(currentStep, formData)
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const submit = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    try {
      if (isAdminMode) {
        await businessService.createBusinessDirect(formData)
      } else {
        await businessService.createRequest(formData)
      }
      setIsComplete(true)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al enviar la solicitud' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    isComplete,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    updateField,
    submit
  }
}

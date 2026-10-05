import { useState, useEffect } from 'react'
import { businessService } from '../services/businessService'
import { validateStep } from '../utils/businessValidators'
import { formatPhoneDisplay } from '../../../utils/validation'

interface UseAffiliationWizardProps {
  isAdminMode?: boolean
  isEditMode?: boolean
  initialData?: any
  businessId?: string
  isUserSelfManagement?: boolean
}

export function useAffiliationWizard(options: UseAffiliationWizardProps | boolean = false) {
  const opts: UseAffiliationWizardProps = typeof options === 'boolean' ? { isAdminMode: options } : options
  const {
    isAdminMode = false,
    isEditMode = false,
    initialData = null,
    businessId,
    isUserSelfManagement = false,
  } = opts

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>(() => {
    if (initialData) {
      return {
        ...initialData,
        applicantName: initialData.request?.applicantName ?? initialData.user?.person?.name ?? initialData.applicantName ?? '',
        applicantFirstLastname: initialData.request?.applicantFirstLastname ?? initialData.user?.person?.first_lastname ?? initialData.applicantFirstLastname ?? '',
        applicantSecondLastname: initialData.request?.applicantSecondLastname ?? initialData.user?.person?.second_lastname ?? initialData.applicantSecondLastname ?? '',
        applicantPhone: formatPhoneDisplay(initialData.request?.applicantPhone ?? initialData.user?.person?.phone ?? initialData.applicantPhone ?? ''),
        applicantEmail: initialData.request?.applicantEmail ?? initialData.user?.email ?? initialData.applicantEmail ?? '',
        phone: formatPhoneDisplay(initialData.phone ?? ''),
      }
    }
    return {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => isEditMode ? [0, 1, 2, 3, 4] : [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        applicantName: initialData.request?.applicantName ?? initialData.user?.person?.name ?? initialData.applicantName ?? '',
        applicantFirstLastname: initialData.request?.applicantFirstLastname ?? initialData.user?.person?.first_lastname ?? initialData.applicantFirstLastname ?? '',
        applicantSecondLastname: initialData.request?.applicantSecondLastname ?? initialData.user?.person?.second_lastname ?? initialData.applicantSecondLastname ?? '',
        applicantPhone: formatPhoneDisplay(initialData.request?.applicantPhone ?? initialData.user?.person?.phone ?? initialData.applicantPhone ?? ''),
        applicantEmail: initialData.request?.applicantEmail ?? initialData.user?.email ?? initialData.applicantEmail ?? '',
        phone: formatPhoneDisplay(initialData.phone ?? ''),
      })
      if (isEditMode) {
        setCompletedSteps([0, 1, 2, 3, 4])
      }
    }
  }, [initialData, isEditMode])

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
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

  const validateAllSteps = (): { isValid: boolean; firstErrorStep: number; allErrors: Record<string, string> } => {
    const allErrors: Record<string, string> = {}
    let firstErrorStep = -1

    for (let s = 0; s <= 4; s++) {
      const stepErrors = validateStep(s, formData)
      if (Object.keys(stepErrors).length > 0) {
        if (firstErrorStep === -1) {
          firstErrorStep = s
        }
        Object.assign(allErrors, stepErrors)
      }
    }

    return {
      isValid: firstErrorStep === -1,
      firstErrorStep,
      allErrors,
    }
  }

  const validateAll = (): boolean => {
    const { isValid, firstErrorStep, allErrors } = validateAllSteps()
    if (!isValid) {
      setErrors(allErrors)
      setCurrentStep(firstErrorStep)
      return false
    }
    return true
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
    if (step > currentStep) {
      for (let s = 0; s < step; s++) {
        const stepErrors = validateStep(s, formData)
        if (Object.keys(stepErrors).length > 0) {
          setErrors(stepErrors)
          setCurrentStep(s)
          return
        }
      }
    }
    setCurrentStep(step)
  }

  const submit = async () => {
    const { isValid, firstErrorStep, allErrors } = validateAllSteps()
    if (!isValid) {
      setErrors(allErrors)
      setCurrentStep(firstErrorStep)
      return
    }

    setIsSubmitting(true)
    try {
      const parsedLat =
        formData.latitude !== null && formData.latitude !== undefined && formData.latitude !== ''
          ? Number(formData.latitude)
          : null
      const parsedLng =
        formData.longitude !== null && formData.longitude !== undefined && formData.longitude !== ''
          ? Number(formData.longitude)
          : null
      const parsedAccuracy =
        formData.accuracy !== null && formData.accuracy !== undefined && formData.accuracy !== ''
          ? Number(formData.accuracy)
          : null

      if (isEditMode) {
        const updatePayload = {
          businessName: formData.businessName,
          categories: formData.categories,
          district: formData.district,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          latitude: parsedLat,
          longitude: parsedLng,
          accuracy: parsedAccuracy,
          facebookUrl: formData.facebookUrl || undefined,
          instagramUrl: formData.instagramUrl || undefined,
          scheduleText: formData.scheduleText,
          coverImageUrl: formData.coverImageUrl,
          galleryUrls: formData.galleryUrls,
          documentUrls: formData.documentUrls,
        }

        if (isUserSelfManagement) {
          await businessService.updateMyBusiness(updatePayload)
        } else {
          const targetId = businessId || initialData?.id
          await businessService.updateBusiness(targetId, updatePayload)
        }
      } else {
        const createPayload = {
          ...formData,
          latitude: parsedLat ?? undefined,
          longitude: parsedLng ?? undefined,
          accuracy: parsedAccuracy ?? undefined,
        }

        if (isAdminMode) {
          await businessService.createBusinessDirect(createPayload)
        } else {
          await businessService.createRequest(createPayload)
        }
      }
      setIsComplete(true)
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, submit: error.message || 'Error al procesar la solicitud' }))
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
    validateAll,
    submit,
  }
}


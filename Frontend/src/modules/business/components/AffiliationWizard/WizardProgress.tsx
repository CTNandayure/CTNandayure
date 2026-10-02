import React from 'react'
import { cn } from '../../../../lib/cn'

interface WizardProgressProps {
  currentStep: number
  completedSteps: number[]
  isEditMode?: boolean
}

const STEPS = ['Datos personales', 'Negocio', 'Contacto', 'Fotos', 'Documentos', 'Revisión']

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, completedSteps, isEditMode = false }) => {
  const progressPercent = (currentStep / (STEPS.length - 1)) * 100

  return (
    <div className="w-full pt-4 pb-6">
      <div className="relative flex items-start justify-between">
        {/* Track Line — visible gray */}
        <div className="absolute left-8 right-8 top-[18px] -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0" />

        {/* Progress Line — active theme color */}
        <div
          className={cn(
            "absolute left-8 top-[18px] -translate-y-1/2 h-1 rounded-full transition-all duration-300 z-0",
            isEditMode ? "bg-brand-navy" : "bg-brand-green"
          )}
          style={{
            width: `calc(${progressPercent}% - ((${progressPercent} / 100) * 4rem))`
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = currentStep === index
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center max-w-[105px]">
              <div className="bg-white p-1 rounded-full">
                <div className="relative">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all shrink-0",
                      isCurrent
                        ? (isEditMode
                            ? "bg-brand-navy text-white border-brand-navy ring-4 ring-brand-navy/20 shadow-md scale-105"
                            : "bg-brand-green text-white border-brand-green ring-4 ring-brand-green/20 shadow-md scale-105")
                        : isCompleted
                        ? (isEditMode
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-green text-white border-brand-green")
                        : "bg-white text-gray-700 border-gray-300 shadow-xs"
                    )}
                  >
                    {index + 1}
                  </div>

                  {isCompleted && !isCurrent && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white shadow-xs",
                        isEditMode ? "bg-brand-navy-soft" : "bg-brand-green"
                      )}
                      title="Paso completado"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  "text-xs text-center mt-2 leading-snug break-words px-1",
                  isCurrent
                    ? (isEditMode ? "text-brand-navy font-bold" : "text-brand-green font-bold")
                    : isCompleted
                    ? "text-brand-navy font-medium"
                    : "text-gray-500 font-medium"
                )}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

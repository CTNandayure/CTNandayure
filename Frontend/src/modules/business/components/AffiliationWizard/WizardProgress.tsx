import React from 'react'
import { cn } from '../../../../lib/cn'

interface WizardProgressProps {
  currentStep: number
  completedSteps: number[]
}

const STEPS = ['Datos personales', 'Negocio', 'Contacto', 'Fotos', 'Documentos', 'Revisión']

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, completedSteps }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-paper -z-10" />
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = currentStep === index
          const isFuture = !isCompleted && !isCurrent

          return (
            <div key={index} className="flex flex-col items-center gap-2 relative bg-white px-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                  isCompleted ? "bg-brand-green text-white border-brand-green" :
                  isCurrent ? "bg-white text-brand-green border-brand-green" :
                  "bg-white text-gray-400 border-gray-300"
                )}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center absolute -bottom-6 w-24 left-1/2 -translate-x-1/2",
                  isFuture ? "text-gray-400" : "text-brand-navy"
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

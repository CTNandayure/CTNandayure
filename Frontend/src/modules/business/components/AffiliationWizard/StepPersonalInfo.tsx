import React from 'react'
import { FormField, Input, PhoneInput } from '../../../../components/ui'

interface StepPersonalInfoProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
  isEditMode?: boolean
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({
  formData,
  errors,
  updateField,
  isEditMode = false,
}) => {
  const isEmailLocked = isEditMode || Boolean(formData?.id) || Boolean(formData?.userId) || Boolean(formData?.request)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4">
        <p className="text-sm text-brand-navy/80">
          <span className="font-semibold text-brand-teal">Paso 1 de 6 — Datos personales.</span>{' '}
          {isEmailLocked
            ? 'Información de la persona titular de la cuenta del negocio.'
            : 'Ingrese su información personal como solicitante. El correo electrónico de este paso será utilizado para crear su cuenta y enviarle la respuesta de su solicitud.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nombre" error={errors.applicantName} htmlFor="applicantName">
          <Input
            id="applicantName"
            lettersOnly
            value={formData.applicantName || ''}
            onChange={(e) => updateField('applicantName', e.target.value.replace(/[^\p{L}\s]/gu, ''))}
            placeholder="Ejemplo: Juan"
          />
        </FormField>

        <FormField label="Primer apellido" error={errors.applicantFirstLastname} htmlFor="applicantFirstLastname">
          <Input
            id="applicantFirstLastname"
            lettersOnly
            value={formData.applicantFirstLastname || ''}
            onChange={(e) => updateField('applicantFirstLastname', e.target.value.replace(/[^\p{L}\s]/gu, ''))}
            placeholder="Ejemplo: Pérez"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Segundo apellido" error={errors.applicantSecondLastname} htmlFor="applicantSecondLastname">
          <Input
            id="applicantSecondLastname"
            lettersOnly
            value={formData.applicantSecondLastname || ''}
            onChange={(e) => updateField('applicantSecondLastname', e.target.value.replace(/[^\p{L}\s]/gu, ''))}
            placeholder="Ejemplo: Rodríguez"
          />
        </FormField>

        <FormField label="Teléfono personal" error={errors.applicantPhone} htmlFor="applicantPhone">
          <PhoneInput
            id="applicantPhone"
            value={formData.applicantPhone || ''}
            onValueChange={(val: string) => updateField('applicantPhone', val)}
            placeholder="8888-8888"
          />
        </FormField>
      </div>

      <FormField
        label="Correo electrónico personal"
        error={errors.applicantEmail}
        htmlFor="applicantEmail"
      >
        <Input
          id="applicantEmail"
          type="email"
          value={formData.applicantEmail || ''}
          disabled={isEmailLocked}
          readOnly={isEmailLocked}
          onChange={isEmailLocked ? undefined : (e) => updateField('applicantEmail', e.target.value)}
          placeholder="Ejemplo: juan@correo.com"
          className={isEmailLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed select-none' : ''}
        />
        {isEmailLocked && (
          <p className="mt-1.5 text-xs text-brand-ink/60">
            El correo electrónico no es modificable.
          </p>
        )}
      </FormField>
    </div>
  )
}


import React from 'react'
import { FormField, Input } from '../../../../components/ui'

interface StepPersonalInfoProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({ formData, errors, updateField }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4">
        <p className="text-sm text-brand-navy/80">
          <span className="font-semibold text-brand-teal">Paso 1 de 6 — Datos personales.</span>{' '}
          Ingrese su información personal como solicitante. El correo electrónico de este paso será
          utilizado para crear su cuenta y enviarle la respuesta de su solicitud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nombre" error={errors.applicantName} htmlFor="applicantName">
          <Input
            id="applicantName"
            value={formData.applicantName || ''}
            onChange={(e) => updateField('applicantName', e.target.value)}
            placeholder="Ej: Juan"
          />
        </FormField>

        <FormField label="Primer apellido" error={errors.applicantFirstLastname} htmlFor="applicantFirstLastname">
          <Input
            id="applicantFirstLastname"
            value={formData.applicantFirstLastname || ''}
            onChange={(e) => updateField('applicantFirstLastname', e.target.value)}
            placeholder="Ej: Pérez"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Segundo apellido" error={errors.applicantSecondLastname} htmlFor="applicantSecondLastname">
          <Input
            id="applicantSecondLastname"
            value={formData.applicantSecondLastname || ''}
            onChange={(e) => updateField('applicantSecondLastname', e.target.value)}
            placeholder="Ej: Rodríguez"
          />
        </FormField>

        <FormField label="Teléfono personal" error={errors.applicantPhone} htmlFor="applicantPhone">
          <Input
            id="applicantPhone"
            value={formData.applicantPhone || ''}
            onChange={(e) => updateField('applicantPhone', e.target.value)}
            placeholder="Ej: 8888-8888"
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
          onChange={(e) => updateField('applicantEmail', e.target.value)}
          placeholder="Ej: juan@correo.com"
        />
      </FormField>
    </div>
  )
}

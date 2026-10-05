import React from 'react'
import { FormField, Input, PhoneInput, Textarea } from '../../../../components/ui'
import { BusinessLocationPicker } from '../BusinessLocationPicker'
import { SCHEDULE_PLACEHOLDER } from '../../utils/constants'

interface StepContactLocationProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
}

export const StepContactLocation: React.FC<StepContactLocationProps> = ({ formData, errors, updateField }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Teléfono del negocio" error={errors.phone} htmlFor="phone">
          <PhoneInput
            id="phone"
            value={formData.phone || ''}
            onValueChange={(val: string) => updateField('phone', val)}
            placeholder="8888-8888"
          />
        </FormField>

        <FormField label="Correo electrónico del negocio" error={errors.email} htmlFor="email">
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Ejemplo: info@negocio.com"
          />
        </FormField>
      </div>

      <FormField label="Dirección exacta" error={errors.address} htmlFor="address">
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Ejemplo: 100m norte del parque central..."
          rows={2}
        />
      </FormField>

      <BusinessLocationPicker
        latitude={formData.latitude}
        longitude={formData.longitude}
        accuracy={formData.accuracy}
        onChange={(coords) => {
          updateField('latitude', coords.latitude)
          updateField('longitude', coords.longitude)
          updateField('accuracy', coords.accuracy)
        }}
        errors={{
          latitude: errors.latitude,
          longitude: errors.longitude,
          coordinates: errors.coordinates,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Enlace de Facebook (Opcional)" error={errors.facebookUrl} htmlFor="facebookUrl">
          <Input
            id="facebookUrl"
            value={formData.facebookUrl || ''}
            onChange={(e) => updateField('facebookUrl', e.target.value)}
            placeholder="https://facebook.com/..."
          />
        </FormField>

        <FormField label="Enlace de Instagram (Opcional)" error={errors.instagramUrl} htmlFor="instagramUrl">
          <Input
            id="instagramUrl"
            value={formData.instagramUrl || ''}
            onChange={(e) => updateField('instagramUrl', e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </FormField>
      </div>

      <FormField label="Horario de atención" error={errors.scheduleText} htmlFor="scheduleText">
        <Textarea
          id="scheduleText"
          value={formData.scheduleText || ''}
          onChange={(e) => updateField('scheduleText', e.target.value)}
          placeholder={SCHEDULE_PLACEHOLDER}
          rows={3}
        />
      </FormField>
    </div>
  )
}


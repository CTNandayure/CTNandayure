import React from 'react'
import { FormField, Input, Select, Textarea } from '../../../../components/ui'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'
import type { BusinessCategory } from '../../types/business.types'

interface StepBusinessInfoProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
}

export const StepBusinessInfo: React.FC<StepBusinessInfoProps> = ({ formData, errors, updateField }) => {
  const handleCategoryToggle = (cat: string) => {
    const current = formData.categories || []
    if (current.includes(cat)) {
      updateField('categories', current.filter((c: string) => c !== cat))
    } else {
      updateField('categories', [...current, cat])
    }
  }

  return (
    <div className="space-y-6">
      <FormField label="Nombre del negocio" error={errors.businessName} htmlFor="businessName">
        <Input
          id="businessName"
          value={formData.businessName || ''}
          onChange={(e) => updateField('businessName', e.target.value)}
          placeholder="Ej: Cabinas Los Sueños"
        />
      </FormField>

      <FormField label="Distrito" error={errors.district} htmlFor="district">
        <Select
          id="district"
          value={formData.district || ''}
          onChange={(e) => updateField('district', e.target.value)}
        >
          <option value="">Seleccione un distrito</option>
          {Object.entries(DISTRICT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Categorías" error={errors.categories} htmlFor="categories">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2" id="categories">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                checked={(formData.categories || []).includes(key)}
                onChange={() => handleCategoryToggle(key as BusinessCategory)}
              />
              <span className="text-sm text-brand-ink">{label}</span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Descripción del negocio" error={errors.description} htmlFor="description">
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describa los servicios que ofrece su negocio..."
          rows={4}
        />
      </FormField>
    </div>
  )
}

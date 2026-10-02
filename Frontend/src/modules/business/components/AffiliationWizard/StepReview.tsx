import React from 'react'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'
import type { BusinessCategory, DistrictKey } from '../../types/business.types'
import { cn } from '../../../../lib/cn'

interface StepReviewProps {
  formData: any
  isAdminMode?: boolean
  isEditMode?: boolean
  goToStep: (step: number) => void
}

export const StepReview: React.FC<StepReviewProps> = ({ formData, isEditMode = false, goToStep }) => {
  const Section = ({ title, stepIndex, children }: { title: string, stepIndex: number, children: React.ReactNode }) => (
    <div className="border rounded-lg overflow-hidden bg-white mb-6">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
        <button
          type="button"
          onClick={() => goToStep(stepIndex)}
          className={cn(
            isEditMode ? "text-brand-navy hover:text-brand-navy-soft" : "text-brand-green hover:text-brand-green-strong",
            "text-sm font-semibold cursor-pointer transition-colors"
          )}
        >
          Editar
        </button>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  )

  const Field = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 md:col-span-2 break-words">{value || '-'}</dd>
    </div>
  )

  return (
    <div className="space-y-2">
      <Section title="Datos Personales del Solicitante" stepIndex={0}>
        <Field label="Nombre completo" value={`${formData.applicantName || ''} ${formData.applicantFirstLastname || ''} ${formData.applicantSecondLastname || ''}`.trim()} />
        <Field label="Teléfono personal" value={formData.applicantPhone} />
        <Field label="Correo personal" value={formData.applicantEmail} />
      </Section>

      <Section title="Información del Negocio" stepIndex={1}>
        <Field label="Nombre del negocio" value={formData.businessName} />
        <Field label="Distrito" value={formData.district ? DISTRICT_LABELS[formData.district as DistrictKey] : ''} />
        <Field label="Categorías" value={
          <div className="flex flex-wrap gap-1">
            {(formData.categories || []).map((cat: BusinessCategory) => (
              <span key={cat} className="inline-block bg-brand-sand text-brand-navy px-2 py-0.5 rounded text-xs">
                {CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        } />
        <Field label="Descripción" value={<span className="whitespace-pre-line">{formData.description}</span>} />
      </Section>

      <Section title="Contacto y Ubicación" stepIndex={2}>
        <Field label="Teléfono del negocio" value={formData.phone} />
        <Field label="Correo del negocio" value={formData.email} />
        <Field label="Dirección exacta" value={<span className="whitespace-pre-line">{formData.address}</span>} />
        {formData.facebookUrl && <Field label="Facebook" value={formData.facebookUrl} />}
        {formData.instagramUrl && <Field label="Instagram" value={formData.instagramUrl} />}
        <Field label="Horario" value={<span className="whitespace-pre-line">{formData.scheduleText}</span>} />
      </Section>

      <Section title="Multimedia" stepIndex={3}>
        <Field label="Portada / Logo" value={
          formData.coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-brand-navy/15 shadow-sm p-1 inline-block bg-gray-50">
              <img
                src={formData.coverImageUrl}
                alt="Portada"
                className="max-h-56 max-w-full w-auto h-auto object-contain rounded-lg"
              />
            </div>
          )
        } />
        <Field label="Galería" value={
          <div className="flex flex-wrap gap-3">
            {(formData.galleryUrls || []).map((url: string, idx: number) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-brand-navy/15 shadow-sm p-1 bg-gray-50 flex items-center justify-center">
                <img
                  src={url}
                  alt={'Galería ' + (idx + 1)}
                  className="h-32 w-32 sm:h-36 sm:w-36 object-contain rounded-lg"
                />
              </div>
            ))}
          </div>
        } />
      </Section>

      <Section title="Documentos Legales" stepIndex={4}>
        <Field label="Documentos" value={
          <ul className="list-disc list-inside space-y-1">
            {(formData.documentUrls || []).map((url: string, idx: number) => (
              <li key={idx} className={cn(isEditMode ? "text-brand-navy font-medium" : "text-brand-green", "truncate")}>
                {url.split('/').pop()}
              </li>
            ))}
          </ul>
        } />
      </Section>
    </div>
  )
}

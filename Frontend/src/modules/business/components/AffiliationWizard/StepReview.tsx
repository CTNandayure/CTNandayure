import React from 'react'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'
import type { BusinessCategory, DistrictKey } from '../../types/business.types'
import { cn } from '../../../../lib/cn'
import { BusinessLocationView } from '../BusinessLocationPicker'

interface StepReviewProps {
  formData: any
  errors?: Record<string, string>
  updateField?: (field: string, value: any) => void
  isAdminMode?: boolean
  isEditMode?: boolean
  goToStep: (step: number) => void
}

export const StepReview: React.FC<StepReviewProps> = ({
  formData,
  errors = {},
  updateField,
  isAdminMode = false,
  isEditMode = false,
  goToStep,
}) => {
  const Section = ({ title, stepIndex, children }: { title: string; stepIndex: number; children: React.ReactNode }) => (
    <div className="border rounded-lg overflow-hidden bg-white mb-6">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
        <button
          type="button"
          onClick={() => goToStep(stepIndex)}
          className={cn(
            isEditMode ? 'text-brand-navy hover:text-brand-navy-soft' : 'text-brand-green hover:text-brand-green-strong',
            'text-sm font-semibold cursor-pointer transition-colors',
          )}
        >
          Editar
        </button>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 md:col-span-2 break-words">{value || '-'}</dd>
    </div>
  )

  return (
    <div className="space-y-2">
      <Section title="Datos Personales del Solicitante" stepIndex={0}>
        <Field
          label="Nombre completo"
          value={`${formData.applicantName || ''} ${formData.applicantFirstLastname || ''} ${formData.applicantSecondLastname || ''}`.trim()}
        />
        <Field label="Teléfono personal" value={formData.applicantPhone} />
        <Field label="Correo personal" value={formData.applicantEmail} />
      </Section>

      <Section title="Información del Negocio" stepIndex={1}>
        <Field label="Nombre del negocio" value={formData.businessName} />
        <Field label="Distrito" value={formData.district ? DISTRICT_LABELS[formData.district as DistrictKey] : ''} />
        <Field
          label="Categorías"
          value={
            <div className="flex flex-wrap gap-1">
              {(formData.categories || []).map((cat: BusinessCategory) => (
                <span key={cat} className="inline-block bg-brand-sand text-brand-navy px-2 py-0.5 rounded text-xs">
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          }
        />
        <Field label="Descripción" value={<span className="whitespace-pre-line">{formData.description}</span>} />
      </Section>

      <Section title="Contacto y Ubicación" stepIndex={2}>
        <Field label="Teléfono del negocio" value={formData.phone} />
        <Field label="Correo del negocio" value={formData.email} />
        <Field label="Dirección exacta" value={<span className="whitespace-pre-line">{formData.address}</span>} />
        <Field
          label="Ubicación geográfica"
          value={
            <BusinessLocationView
              latitude={formData.latitude}
              longitude={formData.longitude}
              accuracy={formData.accuracy}
              mapHeight="180px"
            />
          }
        />
        {formData.facebookUrl && <Field label="Facebook" value={formData.facebookUrl} />}
        {formData.instagramUrl && <Field label="Instagram" value={formData.instagramUrl} />}
        <Field label="Horario" value={<span className="whitespace-pre-line">{formData.scheduleText}</span>} />
      </Section>

      <Section title="Multimedia" stepIndex={3}>
        <Field
          label="Portada / Logo"
          value={
            formData.coverImageUrl && (
              <div className="rounded-xl overflow-hidden border border-brand-navy/15 shadow-sm p-1 inline-block bg-gray-50">
                <img
                  src={formData.coverImageUrl}
                  alt="Portada"
                  className="max-h-56 max-w-full w-auto h-auto object-contain rounded-lg"
                />
              </div>
            )
          }
        />
        <Field
          label="Galería"
          value={
            <div className="flex flex-wrap gap-3">
              {(formData.galleryUrls || []).map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden border border-brand-navy/15 shadow-sm p-1 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={url}
                    alt={'Galería ' + (idx + 1)}
                    className="h-32 w-32 sm:h-36 sm:w-36 object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          }
        />
      </Section>

      <Section title="Documentos Legales" stepIndex={4}>
        <Field
          label="Documentos"
          value={
            <ul className="list-disc list-inside space-y-1">
              {(formData.documentUrls || []).map((url: string, idx: number) => (
                <li key={idx} className={cn(isEditMode ? 'text-brand-navy font-medium' : 'text-brand-green', 'truncate')}>
                  {url.split('/').pop()}
                </li>
              ))}
            </ul>
          }
        />
      </Section>

      {/* Casilla obligatoria de consentimiento legal para solicitudes públicas de afiliación */}
      {!isEditMode && !isAdminMode && updateField && (
        <div className="rounded-xl border border-brand-navy/15 bg-white p-5 md:p-6 mt-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <h4 className="text-sm md:text-base font-bold text-brand-navy uppercase tracking-wide">
              Consentimiento y Términos Legales
            </h4>
          </div>

          <p className="text-xs text-brand-ink/70 mb-4 leading-relaxed">
            Para procesar su solicitud de afiliación a la Cámara de Turismo de Nandayure conforme a la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N° 8968 de Costa Rica), es necesario que lea y otorgue su visto bueno a nuestra política.
          </p>

          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="acceptPrivacyPolicy"
              name="acceptPrivacyPolicy"
              checked={!!formData.acceptPrivacyPolicy}
              onChange={(e) => updateField('acceptPrivacyPolicy', e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-brand-navy/30 text-brand-green focus:ring-brand-green cursor-pointer flex-shrink-0"
            />
            <span className="text-xs md:text-sm text-brand-ink/90 leading-relaxed">
              He leído, comprendo y acepto la{' '}
              <a
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-teal underline hover:text-brand-navy inline-flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Política de Privacidad y Tratamiento de Datos Personales
                <svg className="w-3.5 h-3.5 inline text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>{' '}
              de la Cámara de Turismo de Nandayure. Otorgo de forma voluntaria, informada e inequívoca mi consentimiento para que la información suministrada sea almacenada, gestionada y utilizada con fines de revisión de mi solicitud y promoción turística de mi negocio.
            </span>
          </label>

          {errors?.acceptPrivacyPolicy && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600 pl-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.acceptPrivacyPolicy}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

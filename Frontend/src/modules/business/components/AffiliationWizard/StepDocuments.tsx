import React, { useState } from 'react'
import { FormField } from '../../../../components/ui'
import { businessService } from '../../services/businessService'
import { useToast } from '../../../../components/ui'

interface StepDocumentsProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
}

export const StepDocuments: React.FC<StepDocumentsProps> = ({ formData, errors, updateField }) => {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const current = formData.documentUrls || []
    if (current.length + files.length > 5) {
      showToast({ variant: 'warning', title: 'Máximo 5 documentos permitidos' })
      return
    }

    try {
      setUploading(true)
      const newUrls: string[] = []
      for (const file of files) {
        const res = await businessService.uploadFile(file)
        newUrls.push(res.url)
      }
      updateField('documentUrls', [...current, ...newUrls])
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al subir documentos' })
    } finally {
      setUploading(false)
    }
  }

  const handleReplaceDoc = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setReplacingIndex(index)
      const res = await businessService.uploadFile(file)
      const current = [...(formData.documentUrls || [])]
      current[index] = res.url
      updateField('documentUrls', current)
      showToast({ variant: 'success', title: 'Documento reemplazado' })
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al reemplazar documento' })
    } finally {
      setReplacingIndex(null)
    }
  }

  const removeDoc = (index: number) => {
    const current = [...(formData.documentUrls || [])]
    if (current.length <= 1) {
      showToast({ variant: 'warning', title: 'Mínimo 1 documento requerido', description: 'Debe mantener al menos 1 documento. Puede reemplazarlo en lugar de eliminarlo.' })
      return
    }
    current.splice(index, 1)
    updateField('documentUrls', current)
  }

  return (
    <div className="space-y-6">
      <FormField label="Documentos legales (Mínimo 1, máximo 5)" error={errors.documentUrls} htmlFor="documentUrls">
        <p className="text-sm text-gray-500 mb-4">Cédula jurídica, permiso de funcionamiento, patente u otros comprobantes. Formatos: PDF, DOCX. Al menos un documento es obligatorio.</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
          <label className="cursor-pointer inline-flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-brand-navy">
              {uploading ? 'Subiendo...' : 'Haga clic para subir documentos'}
            </span>
            <input id="documentUrls" type="file" className="hidden" accept=".pdf,.docx" multiple onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {(formData.documentUrls || []).length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.documentUrls.map((url: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{url.split('/').pop()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-brand-navy hover:text-brand-navy-soft font-semibold hover:underline cursor-pointer">
                    {replacingIndex === index ? 'Reemplazando...' : 'Reemplazar'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => handleReplaceDoc(index, e)}
                      disabled={replacingIndex !== null}
                    />
                  </label>

                  {(formData.documentUrls || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDoc(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      title="Eliminar documento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FormField>
    </div>
  )
}

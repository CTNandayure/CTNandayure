import React, { useState } from 'react'
import { FormField } from '../../../../components/ui'
import { businessService } from '../../services/businessService'
import { useToast } from '../../../../components/ui'

interface StepMultimediaProps {
  formData: any
  errors: Record<string, string>
  updateField: (field: string, value: any) => void
}

export const StepMultimedia: React.FC<StepMultimediaProps> = ({ formData, errors, updateField }) => {
  const { showToast } = useToast()
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingCover(true)
      const res = await businessService.uploadFile(file)
      updateField('coverImageUrl', res.url)
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al subir la imagen' })
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const current = formData.galleryUrls || []
    if (current.length + files.length > 5) {
      showToast({ variant: 'warning', title: 'Máximo 5 fotos permitidas' })
      return
    }
    
    try {
      setUploadingGallery(true)
      const newUrls: string[] = []
      for (const file of files) {
        const res = await businessService.uploadFile(file)
        newUrls.push(res.url)
      }
      updateField('galleryUrls', [...current, ...newUrls])
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al subir imágenes' })
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    const current = [...(formData.galleryUrls || [])]
    current.splice(index, 1)
    updateField('galleryUrls', current)
  }

  return (
    <div className="space-y-8">
      <FormField label="Logo o foto de portada" error={errors.coverImageUrl} htmlFor="coverImageUrl">
        <p className="text-sm text-gray-500 mb-2">Si su negocio tiene logo, suba el logo. Si no, suba una foto representativa del negocio.</p>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer bg-brand-sand text-brand-navy px-4 py-2 rounded font-medium hover:bg-opacity-80 transition-colors">
            {uploadingCover ? 'Subiendo...' : 'Seleccionar imagen'}
            <input id="coverImageUrl" type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
          </label>
          {formData.coverImageUrl && (
            <div className="relative w-24 h-24 border rounded overflow-hidden">
              <img src={formData.coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </FormField>

      <FormField label="Galería de fotos" error={errors.galleryUrls} htmlFor="galleryUrls">
        <p className="text-sm text-gray-500 mb-2">Suba entre 3 y 5 fotos de buena calidad de su negocio.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="cursor-pointer bg-brand-sand text-brand-navy px-4 py-2 rounded font-medium hover:bg-opacity-80 transition-colors">
              {uploadingGallery ? 'Subiendo...' : 'Agregar fotos'}
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploadingGallery} />
            </label>
            <span className="text-sm font-medium text-gray-600">
              {(formData.galleryUrls || []).length} de 5 fotos
            </span>
          </div>

          {(formData.galleryUrls || []).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.galleryUrls.map((url: string, index: number) => (
                <div key={index} className="relative aspect-square border rounded overflow-hidden group">
                  <img src={url} alt={`Galería ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormField>
    </div>
  )
}

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
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingCover(true)
      const res = await businessService.uploadFile(file)
      updateField('coverImageUrl', res.url)
      showToast({ variant: 'success', title: 'Foto de portada cargada' })
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
      showToast({ variant: 'success', title: 'Fotos agregadas a la galería' })
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al subir imágenes' })
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleReplaceGalleryImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setReplacingIndex(index)
      const res = await businessService.uploadFile(file)
      const current = [...(formData.galleryUrls || [])]
      current[index] = res.url
      updateField('galleryUrls', current)
      showToast({ variant: 'success', title: 'Imagen reemplazada' })
    } catch (error) {
      showToast({ variant: 'error', title: 'Error al reemplazar la imagen' })
    } finally {
      setReplacingIndex(null)
    }
  }

  const removeGalleryImage = (index: number) => {
    const current = [...(formData.galleryUrls || [])]
    if (current.length <= 3) {
      showToast({ variant: 'warning', title: 'Mínimo 3 fotos requeridas', description: 'Debe mantener al menos 3 fotos. Puede reemplazarla en lugar de eliminarla.' })
      return
    }
    current.splice(index, 1)
    updateField('galleryUrls', current)
  }

  return (
    <div className="space-y-10">
      <FormField label="Logo o foto de portada (Obligatorio)" error={errors.coverImageUrl} htmlFor="coverImageUrl">
        <p className="text-sm text-brand-ink/65 mb-3">
          Suba una foto o logo representativo del negocio. La foto de portada es obligatoria y no puede eliminarse, únicamente reemplazarse.
        </p>
        {formData.coverImageUrl ? (
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="rounded-xl overflow-hidden border border-brand-navy/15 shadow-sm bg-gray-50 p-1">
              <img
                src={formData.coverImageUrl}
                alt="Portada del negocio"
                className="max-h-64 max-w-full w-auto h-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-brand-sand px-4 py-2.5 text-xs font-semibold text-brand-navy hover:bg-brand-sand/80 transition-all border border-brand-navy/10 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingCover ? 'Subiendo...' : 'Reemplazar foto de portada'}</span>
                <input id="coverImageUrl" type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
              </label>
            </div>
          </div>
        ) : (
          <label className="group relative flex flex-col items-center justify-center w-full max-w-md h-44 border-2 border-dashed border-brand-teal/40 rounded-xl bg-brand-paper hover:bg-brand-sand/30 hover:border-brand-teal transition-all cursor-pointer">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal group-hover:scale-110 transition-transform mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-brand-navy">
                {uploadingCover ? 'Subiendo imagen...' : 'Subir foto de portada o logo'}
              </p>
              <p className="text-xs text-brand-ink/50 mt-1">
                Formatos admitidos: PNG, JPG, WEBP
              </p>
            </div>
            <input id="coverImageUrl" type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
          </label>
        )}
      </FormField>

      <FormField label="Galería de fotos (Mínimo 3, máximo 5)" error={errors.galleryUrls} htmlFor="galleryUrls">
        <p className="text-sm text-brand-ink/65 mb-3">
          Suba entre 3 y 5 fotos de buena calidad que muestren las instalaciones, productos o servicios de su negocio.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink/60">
              Fotos subidas
            </span>
            <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full">
              {(formData.galleryUrls || []).length} de 5 fotos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(formData.galleryUrls || []).map((url: string, index: number) => (
              <div key={index} className="relative aspect-[4/3] border border-brand-navy/15 rounded-xl overflow-hidden group shadow-sm bg-gray-50">
                <img src={url} alt={'Galería ' + (index + 1)} className="max-h-full max-w-full object-contain" />

                <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                  <label className="cursor-pointer bg-white text-brand-navy text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-sand transition-colors shadow">
                    {replacingIndex === index ? 'Subiendo...' : 'Reemplazar'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleReplaceGalleryImage(index, e)}
                      disabled={replacingIndex !== null}
                    />
                  </label>

                  {(formData.galleryUrls || []).length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(formData.galleryUrls || []).length < 5 && (
              <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-brand-teal/40 rounded-xl bg-brand-paper hover:bg-brand-sand/30 hover:border-brand-teal transition-all cursor-pointer p-4 text-center group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal group-hover:scale-110 transition-transform mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-navy">
                  {uploadingGallery ? 'Subiendo...' : (formData.galleryUrls || []).length === 0 ? 'Subir fotos' : 'Agregar foto'}
                </span>
                <span className="text-[11px] text-brand-ink/50 mt-0.5">
                  {(formData.galleryUrls || []).length === 0 ? 'Mínimo 3 fotos' : 'Hasta 5 fotos'}
                </span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploadingGallery} />
              </label>
            )}
          </div>
        </div>
      </FormField>
    </div>
  )
}

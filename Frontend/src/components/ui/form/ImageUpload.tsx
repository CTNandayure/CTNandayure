import { useId, useRef, useState } from 'react'
import { API_URL } from '../../../content/api'
import { useToast } from '../ToastProvider'

interface ImageUploadProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
}

// Single-image picker used by any admin form that edits a photo: uploads to
// POST /uploads/image as soon as a file is chosen, previews the result, and
// reports the returned URL back to the form field via onChange.
export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(`${API_URL}/uploads/image`, { method: 'POST', body })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { url: string }
      onChange(json.url)
    } catch {
      showToast({ variant: 'error', title: 'No se pudo subir la imagen', description: 'Intentá de nuevo con otro archivo.' })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-brand-navy">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt="" className="h-24 w-32 flex-none rounded-lg object-cover" />
        ) : (
          <div className="flex h-24 w-32 flex-none items-center justify-center rounded-lg bg-brand-sand text-center text-[10px] uppercase tracking-wide text-brand-ink/40">
            Sin foto
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-fit rounded-lg border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/40 disabled:opacity-50"
          >
            {uploading ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="w-fit text-xs font-medium text-brand-ink/50 hover:text-red-600"
            >
              Quitar foto
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}

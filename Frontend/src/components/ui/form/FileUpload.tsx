import { useId, useRef, useState } from 'react'
import { cn } from '../../../lib/cn'

interface FileUploadProps {
  label: string
  hint?: string
  accept?: string
  multiple?: boolean
  onChange: (files: File[]) => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Dropzone + file list. Files are only held in memory for now — onChange is
// the hook point for wiring a real upload endpoint later.
export function FileUpload({ label, hint, accept, multiple = true, onChange }: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = multiple ? [...files, ...Array.from(list)] : Array.from(list).slice(0, 1)
    setFiles(next)
    onChange(next)
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-brand-navy">
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragActive ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-navy/20 hover:border-brand-navy/40',
        )}
      >
        <span className="text-sm font-medium text-brand-navy">Arrastrá los archivos aquí o hacé clic para elegirlos</span>
        {hint && <span className="text-xs text-brand-ink/60">{hint}</span>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-brand-navy/10 px-3 py-2 text-sm"
            >
              <span className="truncate text-brand-ink">{file.name}</span>
              <span className="flex flex-none items-center gap-3">
                <span className="text-xs text-brand-ink/50">{formatSize(file.size)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  aria-label={`Quitar ${file.name}`}
                  className="text-brand-ink/50 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

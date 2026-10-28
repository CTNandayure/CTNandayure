interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}

// Label + control + error message, always in this order and spacing —
// every field in every form in the system is wrapped in one of these.
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-brand-navy">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

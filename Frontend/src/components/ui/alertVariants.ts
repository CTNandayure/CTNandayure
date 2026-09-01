export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

// Brand palette has no danger color, so error borrows a conventional red —
// the other three states map onto the real brand colors.
export const alertVariantStyles: Record<AlertVariant, string> = {
  success: 'bg-brand-green/10 border-brand-green text-brand-green-strong',
  error: 'bg-red-50 border-red-600 text-red-700',
  warning: 'bg-brand-yellow/15 border-brand-yellow text-brand-navy',
  info: 'bg-brand-teal/10 border-brand-teal text-brand-teal',
}

import { alertVariantStyles, type AlertVariant } from './alertVariants'
import { cn } from '../../lib/cn'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('flex gap-3 rounded-lg border-l-4 p-4 text-sm', alertVariantStyles[variant], className)}
    >
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

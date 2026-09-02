import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import { inputStyles } from './inputStyles'

export const Textarea = forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<'textarea'>>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(inputStyles, 'h-auto resize-none py-3', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import { inputStyles } from './inputStyles'

export const Select = forwardRef<HTMLSelectElement, React.ComponentPropsWithoutRef<'select'>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(inputStyles, 'bg-white', className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

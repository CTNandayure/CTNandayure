import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import { inputStyles } from './inputStyles'

export const Input = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputStyles, className)} {...props} />,
)
Input.displayName = 'Input'

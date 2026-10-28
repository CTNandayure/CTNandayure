import { forwardRef, useCallback } from 'react'
import { cn } from '../../../lib/cn'
import { inputStyles } from './inputStyles'
import { applyPhoneMask } from '../../../utils/validation'

interface PhoneInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'type'> {
  value: string
  onValueChange: (formatted: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = applyPhoneMask(e.target.value)
        onValueChange(masked)
      },
      [onValueChange],
    )

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        maxLength={9}
        placeholder="8888-8888"
        className={cn(inputStyles, className)}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  },
)
PhoneInput.displayName = 'PhoneInput'

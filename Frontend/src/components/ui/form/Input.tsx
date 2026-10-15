import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import { inputStyles } from './inputStyles'

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  lettersOnly?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, lettersOnly, onKeyDown, onBeforeInput, onChange, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (lettersOnly) {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing && e.key !== 'Dead') {
          if (e.key.length === 1 && !/^[\p{L}\p{M}\s]$/u.test(e.key)) {
            e.preventDefault()
            return
          }
        }
      }
      onKeyDown?.(e)
    }

    const handleBeforeInput = (e: any) => {
      if (lettersOnly) {
        const text = e.data || (e.nativeEvent && (e.nativeEvent as any).data)
        if (text && !/^[\p{L}\p{M}\s]+$/u.test(text)) {
          e.preventDefault()
          return
        }
      }
      onBeforeInput?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (lettersOnly) {
        const filtered = e.target.value.replace(/[^\p{L}\s]/gu, '')
        if (filtered !== e.target.value) {
          e.target.value = filtered
        }
      }
      onChange?.(e)
    }

    return (
      <input
        ref={ref}
        className={cn(inputStyles, className)}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'


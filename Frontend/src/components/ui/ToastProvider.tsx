import * as RadixToast from '@radix-ui/react-toast'
import { createContext, useCallback, useContext, useState } from 'react'
import { alertVariantStyles, type AlertVariant } from './alertVariants'
import { cn } from '../../lib/cn'

interface ToastItem {
  id: number
  variant: AlertVariant
  title: string
  description?: string
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            duration={5000}
            className={cn('rounded-lg border-l-4 bg-white p-4 shadow-lg', alertVariantStyles[t.variant])}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id)
            }}
          >
            <RadixToast.Title className="text-sm font-semibold">{t.title}</RadixToast.Title>
            {t.description && (
              <RadixToast.Description className="mt-1 text-sm opacity-90">{t.description}</RadixToast.Description>
            )}
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

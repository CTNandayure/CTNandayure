import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/cn'

export type ModalSize = 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
}

const sizes: Record<ModalSize, string> = {
  md: 'w-[calc(100vw-2rem)] max-w-lg',
  lg: 'w-[calc(100vw-2rem)] max-w-2xl',
  xl: 'w-[calc(100vw-2rem)] max-w-3xl',
}

// The one Modal for the whole system — header, body, and an optional footer.
// It does NOT close when clicking outside or pressing Escape; the user must
// explicitly cancel/save or use the X button, so forms never close by accident.
export function Modal({ open, onOpenChange, title, description, children, footer, size = 'md' }: ModalProps) {
  const close = () => onOpenChange(false)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-brand-navy/40 backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl focus:outline-none',
            sizes[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-brand-navy/10 px-6 py-5 md:px-8">
            <div>
              <Dialog.Title className="text-xl font-bold text-brand-navy">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-brand-ink/60">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="cursor-pointer rounded-full p-1.5 text-brand-ink/50 transition-colors hover:bg-brand-sand hover:text-brand-navy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-5 md:px-8">{children}</div>
          {footer && <div className="border-t border-brand-navy/10 px-6 py-4 md:px-8">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
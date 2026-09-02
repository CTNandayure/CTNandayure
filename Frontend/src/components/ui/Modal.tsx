import * as Dialog from '@radix-ui/react-dialog'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

// The one Modal for the whole system — header, body, and an optional footer
// (pass a <FormActions> so every modal's buttons follow the same order).
export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-brand-navy/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-brand-navy">{title}</Dialog.Title>
          {description && <Dialog.Description className="mt-1 text-sm text-brand-ink/70">{description}</Dialog.Description>}
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

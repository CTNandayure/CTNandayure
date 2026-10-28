import { cn } from '../../lib/cn'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-brand-navy/10 bg-white', className)}>
      {children}
    </div>
  )
}

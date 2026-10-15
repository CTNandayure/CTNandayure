import { cn } from '../../lib/cn'

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-6 md:px-12', className)}>{children}</div>
}

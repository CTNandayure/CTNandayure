import { cn } from '../../lib/cn'

export type BadgeColor = 'navy' | 'teal' | 'green' | 'yellow'

const colors: Record<BadgeColor, string> = {
  navy: 'bg-brand-navy text-white',
  teal: 'bg-brand-teal text-white',
  green: 'bg-brand-green text-white',
  yellow: 'bg-brand-yellow text-brand-navy',
}

export function Badge({ color = 'teal', children }: { color?: BadgeColor; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold', colors[color])}>
      {children}
    </span>
  )
}

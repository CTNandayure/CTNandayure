import { cn } from '../../lib/cn'

export type EyebrowColor = 'teal' | 'green' | 'yellow'

const eyebrowColors: Record<EyebrowColor, string> = {
  teal: 'text-brand-teal',
  green: 'text-brand-green',
  yellow: 'text-brand-yellow',
}

interface SectionHeadingProps {
  eyebrow: string
  eyebrowColor?: EyebrowColor
  title: string
  lede?: string
  className?: string
  onDark?: boolean
}

// The eyebrow + heading + optional lede pattern every landing section uses.
export function SectionHeading({ eyebrow, eyebrowColor = 'teal', title, lede, className, onDark }: SectionHeadingProps) {
  return (
    <div className={cn('flex max-w-2xl flex-col gap-3', className)}>
      <span className={cn('text-xs font-bold uppercase tracking-widest', onDark ? 'text-brand-yellow' : eyebrowColors[eyebrowColor])}>
        {eyebrow}
      </span>
      <h2 className={cn('text-3xl font-bold leading-tight md:text-4xl', onDark ? 'text-white' : 'text-brand-navy')}>{title}</h2>
      {lede && <p className={cn('text-base leading-relaxed', onDark ? 'text-white/80' : 'text-brand-ink/70')}>{lede}</p>}
    </div>
  )
}

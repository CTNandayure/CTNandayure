import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'outlineOnDark' | 'text'
export type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold text-sm rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

// Colors only — never mix padding in here, or overriding size later becomes
// a losing battle against Tailwind's class-order-dependent cascade.
const colorVariants: Record<Exclude<ButtonVariant, 'text'>, string> = {
  primary: 'bg-brand-green text-white hover:bg-brand-green-strong',
  accent: 'bg-brand-yellow text-brand-navy hover:brightness-95',
  outline: 'border-[1.5px] border-brand-navy/30 text-brand-navy hover:border-brand-navy',
  // for buttons placed over a photo or a dark/navy section, e.g. the hero
  outlineOnDark: 'border-[1.5px] border-white/60 text-white hover:border-white',
}

// Padding only — kept separate from color so a compact navbar button and a
// big hero CTA can share the same variant with a different size.
const sizes: Record<ButtonSize, string> = {
  md: 'px-7 py-3.5',
  sm: 'px-5 py-2.5',
}

const textVariant = `${base} text-brand-navy border-b-2 border-brand-green px-0 py-0.5 rounded-none hover:text-brand-green`

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'children'> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<React.ComponentPropsWithoutRef<'a'>, 'className' | 'children' | 'href'> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

// href with a "#" (in-page or cross-page anchor) renders a plain <a> so the
// browser handles the scroll; a route-shaped href renders a router <Link>.
export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const classes =
    variant === 'text' ? cn(textVariant, className) : cn(base, colorVariants[variant], sizes[size], className)

  if ('href' in props && props.href) {
    const { href, ...rest } = props
    if (!href.includes('#') && href.startsWith('/')) {
      return (
        <Link to={href} className={classes} {...rest}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...(props as React.ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  )
}

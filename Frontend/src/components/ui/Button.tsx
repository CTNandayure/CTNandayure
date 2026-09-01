import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'text'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants: Record<ButtonVariant, string> = {
  primary: `${base} bg-brand-green text-white px-7 py-3.5 hover:bg-brand-green-strong`,
  accent: `${base} bg-brand-yellow text-brand-navy px-7 py-3.5 hover:brightness-95`,
  outline: `${base} border-[1.5px] border-brand-navy/30 text-brand-navy px-7 py-3.5 hover:border-brand-navy`,
  text: `${base} text-brand-navy border-b-2 border-brand-green px-0 py-0.5 rounded-none hover:text-brand-green`,
}

type CommonProps = {
  variant?: ButtonVariant
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
export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const classes = cn(variants[variant], className)

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

import { cn } from '../../lib/cn'

export type TableActionVariant = 'view' | 'edit' | 'activate' | 'deactivate'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md min-w-[120px] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<TableActionVariant, string> = {
  view: `${base} border border-brand-navy/25 bg-white text-brand-navy hover:border-brand-navy hover:bg-brand-sand`,
  edit: `${base} bg-brand-navy text-white hover:bg-brand-navy-soft`,
  activate: `${base} bg-brand-green/10 text-brand-green-strong hover:bg-brand-green/20`,
  deactivate: `${base} bg-red-50 text-red-600 hover:bg-red-100`,
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function BanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  )
}

const icons: Record<TableActionVariant, React.ReactNode> = {
  view: <EyeIcon />,
  edit: <PencilIcon />,
  activate: <CheckCircleIcon />,
  deactivate: <BanIcon />,
}

type TableActionButtonProps = {
  variant: TableActionVariant
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'children'>

export function TableActionButton({ variant, className, children, ...props }: TableActionButtonProps) {
  return (
    <button type="button" className={cn(variants[variant], className)} {...props}>
      {icons[variant]}
      {children}
    </button>
  )
}
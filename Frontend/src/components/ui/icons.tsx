type IconProps = React.SVGProps<SVGSVGElement>

export function MenuIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 22s7-7.58 7-12a7 7 0 10-14 0c0 4.42 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.4" fill="currentColor" />
    </svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.8.8.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.6 21.2 2.8 13.4 2.8 4.8c0-.6.4-1 1-1H7.2c.6 0 1 .4 1 1 0 1.3.3 2.6.8 3.8.2.3.1.7-.2 1l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M15 8.5h2.5V5H15c-2.2 0-4 1.8-4 4v2H9v3.5h2V21h3.5v-6.5H17l.5-3.5h-3V9c0-.3.2-.5.5-.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

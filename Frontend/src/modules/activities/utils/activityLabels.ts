import type { BadgeColor } from '../../../components/ui'
import type { ActivityCategory, ActivityRecord, ActivityStatus } from '../types/activity.types'

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  SURF: 'Surf',
  HIKING: 'Senderismo',
  CULTURE: 'Cultura',
  AGROTOURISM: 'Agroturismo',
  GASTRONOMY: 'Gastronomía',
  WILDLIFE: 'Avistamiento de fauna',
  OTHER: 'Otra',
}

// «Otra» is last on purpose: it is the "none of the above" escape hatch.
export const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as ActivityCategory[]

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  BORRADOR: 'Borrador',
  PUBLICADA: 'Publicada',
  INACTIVA: 'Inactiva',
}

export const STATUS_BADGE_COLORS: Record<ActivityStatus, BadgeColor> = {
  BORRADOR: 'yellow',
  PUBLICADA: 'green',
  INACTIVA: 'red',
}

// ISO weekdays (1 = Monday). `plural` is what follows "Todos los …".
export const WEEKDAYS = [
  { value: 1, short: 'Lun', plural: 'lunes' },
  { value: 2, short: 'Mar', plural: 'martes' },
  { value: 3, short: 'Mié', plural: 'miércoles' },
  { value: 4, short: 'Jue', plural: 'jueves' },
  { value: 5, short: 'Vie', plural: 'viernes' },
  { value: 6, short: 'Sáb', plural: 'sábados' },
  { value: 7, short: 'Dom', plural: 'domingos' },
] as const

export function categoryLabel(activity: Pick<ActivityRecord, 'category' | 'customCategory'>): string {
  if (activity.category === 'OTHER') return activity.customCategory || CATEGORY_LABELS.OTHER
  return CATEGORY_LABELS[activity.category]
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  return `${hours} h ${rest} min`
}

// '19:00' -> '7:00 p. m.'
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.'
  const hour = hours % 12 === 0 ? 12 : hours % 12
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

// Dates are plain calendar days, so format them in UTC to avoid any day shift.
export function formatDate(date: string, style: 'long' | 'short' = 'long'): string {
  const value = new Date(`${date}T00:00:00Z`)
  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat('es-CR', options).format(value)
}

export function todayInCostaRica(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function describeDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b)
  if (sorted.length === 7) return 'Todos los días'
  if (sorted.join(',') === '1,2,3,4,5') return 'De lunes a viernes'
  if (sorted.join(',') === '6,7') return 'Fines de semana'

  const names = sorted.map((day) => WEEKDAYS.find((w) => w.value === day)?.plural ?? '')
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0]
  return `Todos los ${list}`
}

type ScheduleFields = Pick<ActivityRecord, 'scheduleType' | 'startDate' | 'endDate' | 'daysOfWeek' | 'startTime'>

// «viernes 16 de octubre de 2026 · 7:00 p. m.» / «Todos los viernes y sábados · 7:00 p. m.»
// `compact` uses the short date («16 oct 2026») for cards and table rows.
export function describeSchedule(activity: ScheduleFields, compact = false): string {
  const time = formatTime(activity.startTime)
  if (activity.scheduleType === 'SPECIFIC_DATE') {
    return activity.startDate ? `${formatDate(activity.startDate, compact ? 'short' : 'long')} · ${time}` : time
  }
  return `${describeDays(activity.daysOfWeek)} · ${time}`
}

// Validity window of a recurring activity, when it has one.
export function describeValidity(activity: Pick<ActivityRecord, 'scheduleType' | 'startDate' | 'endDate'>): string | null {
  if (activity.scheduleType !== 'RECURRING') return null
  if (activity.startDate && activity.endDate) {
    return `Del ${formatDate(activity.startDate, 'short')} al ${formatDate(activity.endDate, 'short')}`
  }
  if (activity.startDate) return `Desde el ${formatDate(activity.startDate, 'short')}`
  if (activity.endDate) return `Hasta el ${formatDate(activity.endDate, 'short')}`
  return null
}

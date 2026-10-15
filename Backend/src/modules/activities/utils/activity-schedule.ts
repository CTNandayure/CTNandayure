// Pure date/schedule helpers for activities. No Nest or Prisma imports, so they
// can be unit-tested in isolation.
//
// Dates are plain 'YYYY-MM-DD' strings in Costa Rica local time (UTC-6, no DST):
// they map 1:1 to Prisma DATE columns (see toDateOnly / fromDateOnly), so an
// activity never shifts a day because of the server's time zone. Comparing the
// strings lexicographically is the same as comparing the dates.

export const COSTA_RICA_TIME_ZONE = 'America/Costa_Rica';

export type ScheduleType = 'SPECIFIC_DATE' | 'RECURRING';

export interface ScheduleInput {
  scheduleType: ScheduleType;
  /** SPECIFIC_DATE: the day. RECURRING: optional start of the validity window. */
  startDate: string | null;
  /** RECURRING only: optional end of the validity window (inclusive). */
  endDate: string | null;
  /** ISO weekdays: 1 = Monday ... 7 = Sunday. Only used by RECURRING. */
  daysOfWeek: number[];
  /** 'HH:mm', 24 hour clock. */
  startTime: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** Today's date in Costa Rica as 'YYYY-MM-DD'. */
export function todayInCostaRica(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: COSTA_RICA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** ISO weekday of a 'YYYY-MM-DD' date: 1 = Monday ... 7 = Sunday. */
export function isoWeekday(date: string): number {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
  return day === 0 ? 7 : day;
}

export function toDateOnly(value: string | null | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export function fromDateOnly(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/**
 * The next day (today included) on which the activity takes place, or null when
 * it already ended (or never happens). A null result is what "vencida" means.
 * The granularity is the day: an activity stays visible until the end of its day.
 */
export function computeNextOccurrence(
  schedule: Pick<ScheduleInput, 'scheduleType' | 'startDate' | 'endDate' | 'daysOfWeek'>,
  today: string,
): string | null {
  if (schedule.scheduleType === 'SPECIFIC_DATE') {
    return schedule.startDate && schedule.startDate >= today ? schedule.startDate : null;
  }

  if (schedule.daysOfWeek.length === 0) return null;
  if (schedule.endDate && schedule.endDate < today) return null;

  const from = schedule.startDate && schedule.startDate > today ? schedule.startDate : today;
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = addDays(from, offset);
    if (schedule.endDate && candidate > schedule.endDate) return null;
    if (schedule.daysOfWeek.includes(isoWeekday(candidate))) return candidate;
  }
  return null;
}

export function isExpired(
  schedule: Pick<ScheduleInput, 'scheduleType' | 'startDate' | 'endDate' | 'daysOfWeek'>,
  today: string,
): boolean {
  return computeNextOccurrence(schedule, today) === null;
}

export interface ScheduleValidationOptions {
  today: string;
  /**
   * Reject dates that are already in the past. Pass false when only unrelated
   * fields of an old activity are being edited.
   */
  requireFuture: boolean;
}

/** Cross-field schedule rules. Returns Spanish messages; empty means valid. */
export function validateSchedule(schedule: ScheduleInput, options: ScheduleValidationOptions): string[] {
  const errors: string[] = [];

  if (!isValidTimeString(schedule.startTime)) {
    errors.push('La hora de inicio no es válida (use el formato HH:mm)');
  }

  if (schedule.scheduleType === 'SPECIFIC_DATE') {
    if (!schedule.startDate) {
      errors.push('La fecha de la actividad es obligatoria');
    } else if (!isValidDateString(schedule.startDate)) {
      errors.push('La fecha de la actividad no es válida');
    } else if (options.requireFuture && schedule.startDate < options.today) {
      errors.push('La fecha de la actividad no puede estar en el pasado');
    }
    return errors;
  }

  if (schedule.daysOfWeek.length === 0) {
    errors.push('Seleccione al menos un día de la semana');
  }

  const startValid = Boolean(schedule.startDate) && isValidDateString(schedule.startDate as string);
  const endValid = Boolean(schedule.endDate) && isValidDateString(schedule.endDate as string);

  if (schedule.startDate && !startValid) errors.push('La fecha de inicio de la vigencia no es válida');
  if (schedule.endDate && !endValid) errors.push('La fecha de fin de la vigencia no es válida');

  if (startValid && endValid && (schedule.endDate as string) < (schedule.startDate as string)) {
    errors.push('La fecha de fin de la vigencia no puede ser anterior a la de inicio');
  } else if (startValid && endValid && schedule.daysOfWeek.length > 0) {
    const reachable = computeNextOccurrence(schedule, schedule.startDate as string);
    if (reachable === null) {
      errors.push('Ninguno de los días seleccionados cae dentro del rango de vigencia');
    }
  }

  if (endValid && options.requireFuture && (schedule.endDate as string) < options.today) {
    errors.push('La vigencia de la actividad ya terminó');
  }

  return errors;
}

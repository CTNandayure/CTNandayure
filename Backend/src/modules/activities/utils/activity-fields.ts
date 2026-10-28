import type { ActivityCategory } from '@/generated/prisma/enums';
import { validateSchedule, type ScheduleType } from './activity-schedule';

// Domain rules that span several fields. The DTOs only check the shape of each
// field; the rules below need the final merged state (stored values + the
// incoming patch), so they run in the service on that merged state.

export interface ActivityFields {
  name: string;
  description: string;
  category: ActivityCategory;
  customCategory: string | null;
  durationMinutes: number;
  requirements: string | null;
  scheduleType: ScheduleType;
  startDate: string | null;
  endDate: string | null;
  daysOfWeek: number[];
  startTime: string;
  meetingPoint: string;
  meetingLatitude: number | null;
  meetingLongitude: number | null;
  imageUrl: string | null;
}

export type ActivityFieldsPatch = Partial<ActivityFields>;

const OPTIONAL_DEFAULTS = {
  customCategory: null,
  requirements: null,
  startDate: null,
  endDate: null,
  daysOfWeek: [] as number[],
  meetingLatitude: null,
  meetingLongitude: null,
  imageUrl: null,
};

/** Applies a patch (undefined = keep, null = clear) on top of the stored fields. */
export function mergeFields(base: ActivityFields | null, patch: ActivityFieldsPatch): ActivityFields {
  const merged: Record<string, unknown> = { ...OPTIONAL_DEFAULTS, ...(base ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged as unknown as ActivityFields;
}

const trimOrNull = (value: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Trims text, drops fields that do not apply to the chosen category/schedule. */
export function normalizeFields(fields: ActivityFields): ActivityFields {
  const isSpecific = fields.scheduleType === 'SPECIFIC_DATE';
  return {
    ...fields,
    name: fields.name.trim(),
    description: fields.description.trim(),
    meetingPoint: fields.meetingPoint.trim(),
    requirements: trimOrNull(fields.requirements),
    imageUrl: trimOrNull(fields.imageUrl),
    customCategory: fields.category === 'OTHER' ? trimOrNull(fields.customCategory) : null,
    endDate: isSpecific ? null : fields.endDate,
    daysOfWeek: isSpecific ? [] : [...new Set(fields.daysOfWeek)].sort((a, b) => a - b),
  };
}

export interface FieldsValidationOptions {
  today: string;
  /** Reject schedules that are already in the past (create, or when the schedule changed). */
  requireFuture: boolean;
}

/** Cross-field rules. Returns Spanish messages; an empty array means valid. */
export function validateFields(fields: ActivityFields, options: FieldsValidationOptions): string[] {
  const errors: string[] = [];

  if (fields.category === 'OTHER' && !fields.customCategory) {
    errors.push('Escriba el nombre de la categoría cuando elige «Otra»');
  }

  const hasLatitude = fields.meetingLatitude !== null;
  const hasLongitude = fields.meetingLongitude !== null;
  if (hasLatitude !== hasLongitude) {
    errors.push('Indique la latitud y la longitud del punto de encuentro, o ninguna de las dos');
  }

  errors.push(...validateSchedule(fields, options));
  return errors;
}

/** Extra requirements to move an activity to PUBLICADA (the schedule must still be current). */
export function validatePublishable(fields: ActivityFields, today: string): string[] {
  const errors = validateFields(fields, { today, requireFuture: true });
  if (!fields.imageUrl) {
    errors.unshift('Agregue una foto para poder publicar la actividad');
  }
  return errors;
}

/** True when the patch actually changes when the activity takes place. */
export function scheduleChanged(before: ActivityFields, after: ActivityFields): boolean {
  return (
    before.scheduleType !== after.scheduleType ||
    before.startDate !== after.startDate ||
    before.endDate !== after.endDate ||
    before.daysOfWeek.join(',') !== after.daysOfWeek.join(',')
  );
}

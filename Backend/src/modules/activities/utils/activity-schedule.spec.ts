import {
  addDays,
  computeNextOccurrence,
  fromDateOnly,
  isExpired,
  isoWeekday,
  isValidDateString,
  isValidTimeString,
  toDateOnly,
  todayInCostaRica,
  validateSchedule,
  type ScheduleInput,
} from './activity-schedule';

// 2026-10-11 is a Sunday, which keeps the weekday arithmetic below easy to follow.
const TODAY = '2026-10-11';

const recurring = (overrides: Partial<ScheduleInput> = {}): ScheduleInput => ({
  scheduleType: 'RECURRING',
  startDate: null,
  endDate: null,
  daysOfWeek: [3],
  startTime: '08:00',
  ...overrides,
});

const specific = (overrides: Partial<ScheduleInput> = {}): ScheduleInput => ({
  scheduleType: 'SPECIFIC_DATE',
  startDate: '2026-10-20',
  endDate: null,
  daysOfWeek: [],
  startTime: '08:00',
  ...overrides,
});

describe('todayInCostaRica', () => {
  it('uses the Costa Rica calendar day (UTC-6), not the UTC one', () => {
    expect(todayInCostaRica(new Date('2026-10-12T03:00:00Z'))).toBe('2026-10-11');
    expect(todayInCostaRica(new Date('2026-10-12T05:59:59Z'))).toBe('2026-10-11');
  });

  it('rolls over at midnight Costa Rica time', () => {
    expect(todayInCostaRica(new Date('2026-10-12T06:00:00Z'))).toBe('2026-10-12');
  });
});

describe('date helpers', () => {
  it('validates real calendar dates only', () => {
    expect(isValidDateString('2026-02-28')).toBe(true);
    expect(isValidDateString('2028-02-29')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('26-1-1')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });

  it('validates 24 hour HH:mm times', () => {
    expect(isValidTimeString('00:00')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
    expect(isValidTimeString('24:00')).toBe(false);
    expect(isValidTimeString('7:30')).toBe(false);
    expect(isValidTimeString('12:60')).toBe(false);
  });

  it('adds days across month, year and leap-day boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-10-11', 0)).toBe('2026-10-11');
  });

  it('returns ISO weekdays (Monday = 1, Sunday = 7)', () => {
    expect(isoWeekday('2026-10-11')).toBe(7);
    expect(isoWeekday('2026-10-12')).toBe(1);
    expect(isoWeekday('2026-10-17')).toBe(6);
  });

  it('round-trips DATE values without shifting the day', () => {
    expect(fromDateOnly(toDateOnly('2026-10-11'))).toBe('2026-10-11');
    expect(toDateOnly(null)).toBeNull();
    expect(fromDateOnly(null)).toBeNull();
  });
});

describe('computeNextOccurrence', () => {
  it('returns the day of a future or same-day specific activity', () => {
    expect(computeNextOccurrence(specific({ startDate: '2026-10-20' }), TODAY)).toBe('2026-10-20');
    expect(computeNextOccurrence(specific({ startDate: TODAY }), TODAY)).toBe(TODAY);
  });

  it('returns null for a specific activity that already happened', () => {
    expect(computeNextOccurrence(specific({ startDate: '2026-10-10' }), TODAY)).toBeNull();
    expect(computeNextOccurrence(specific({ startDate: null }), TODAY)).toBeNull();
  });

  it('finds the next matching weekday for a recurring activity', () => {
    expect(computeNextOccurrence(recurring({ daysOfWeek: [3] }), TODAY)).toBe('2026-10-14');
    expect(computeNextOccurrence(recurring({ daysOfWeek: [1, 5] }), TODAY)).toBe('2026-10-12');
  });

  it('counts today when today matches', () => {
    expect(computeNextOccurrence(recurring({ daysOfWeek: [7] }), TODAY)).toBe(TODAY);
  });

  it('waits for a validity window that has not started', () => {
    const schedule = recurring({ daysOfWeek: [3], startDate: '2026-11-01' });
    expect(computeNextOccurrence(schedule, TODAY)).toBe('2026-11-04');
  });

  it('returns null once the validity window ended', () => {
    expect(computeNextOccurrence(recurring({ endDate: '2026-10-10' }), TODAY)).toBeNull();
  });

  it('returns null when the next matching day falls after the window end', () => {
    expect(computeNextOccurrence(recurring({ daysOfWeek: [3], endDate: '2026-10-13' }), TODAY)).toBeNull();
    expect(computeNextOccurrence(recurring({ daysOfWeek: [3], endDate: '2026-10-14' }), TODAY)).toBe('2026-10-14');
  });

  it('never occurs without weekdays', () => {
    expect(computeNextOccurrence(recurring({ daysOfWeek: [] }), TODAY)).toBeNull();
  });
});

describe('isExpired', () => {
  it('is the inverse of having a next occurrence', () => {
    expect(isExpired(specific({ startDate: '2026-10-10' }), TODAY)).toBe(true);
    expect(isExpired(specific({ startDate: TODAY }), TODAY)).toBe(false);
    expect(isExpired(recurring(), TODAY)).toBe(false);
  });
});

describe('validateSchedule', () => {
  const options = { today: TODAY, requireFuture: true };

  it('accepts a valid specific date', () => {
    expect(validateSchedule(specific(), options)).toEqual([]);
  });

  it('accepts a specific date of today', () => {
    expect(validateSchedule(specific({ startDate: TODAY }), options)).toEqual([]);
  });

  it('rejects a past specific date only when requireFuture is on', () => {
    const past = specific({ startDate: '2026-10-01' });
    expect(validateSchedule(past, options)).toContain('La fecha de la actividad no puede estar en el pasado');
    expect(validateSchedule(past, { ...options, requireFuture: false })).toEqual([]);
  });

  it('requires a real date for a specific activity', () => {
    expect(validateSchedule(specific({ startDate: null }), options)).toContain('La fecha de la actividad es obligatoria');
    expect(validateSchedule(specific({ startDate: '2026-02-30' }), options)).toContain(
      'La fecha de la actividad no es válida',
    );
  });

  it('rejects an invalid start time', () => {
    expect(validateSchedule(specific({ startTime: '25:00' }), options)).toContain(
      'La hora de inicio no es válida (use el formato HH:mm)',
    );
  });

  it('accepts a recurring activity with and without a validity window', () => {
    expect(validateSchedule(recurring(), options)).toEqual([]);
    expect(validateSchedule(recurring({ startDate: '2026-11-01', endDate: '2026-12-31' }), options)).toEqual([]);
  });

  it('requires at least one weekday when recurring', () => {
    expect(validateSchedule(recurring({ daysOfWeek: [] }), options)).toContain('Seleccione al menos un día de la semana');
  });

  it('rejects an end date before the start date', () => {
    const errors = validateSchedule(recurring({ startDate: '2026-12-01', endDate: '2026-11-01' }), options);
    expect(errors).toContain('La fecha de fin de la vigencia no puede ser anterior a la de inicio');
  });

  it('rejects a window where none of the selected weekdays can happen', () => {
    // Mon 2026-10-12 to Tue 2026-10-13, but the activity only runs on Saturdays.
    const errors = validateSchedule(recurring({ daysOfWeek: [6], startDate: '2026-10-12', endDate: '2026-10-13' }), options);
    expect(errors).toContain('Ninguno de los días seleccionados cae dentro del rango de vigencia');
  });

  it('rejects a validity window that already ended', () => {
    const errors = validateSchedule(recurring({ endDate: '2026-10-01' }), options);
    expect(errors).toContain('La vigencia de la actividad ya terminó');
    expect(validateSchedule(recurring({ endDate: '2026-10-01' }), { ...options, requireFuture: false })).toEqual([]);
  });
});

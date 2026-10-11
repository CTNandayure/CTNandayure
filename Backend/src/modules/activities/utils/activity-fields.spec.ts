import {
  mergeFields,
  normalizeFields,
  scheduleChanged,
  validateFields,
  validatePublishable,
  type ActivityFields,
} from './activity-fields';

const TODAY = '2026-10-11';
const options = { today: TODAY, requireFuture: true };

const base = (overrides: Partial<ActivityFields> = {}): ActivityFields => ({
  name: 'Tour de tortugas',
  description: 'Recorrido nocturno para ver el desove de tortugas en la playa.',
  category: 'WILDLIFE',
  customCategory: null,
  durationMinutes: 180,
  requirements: null,
  scheduleType: 'RECURRING',
  startDate: null,
  endDate: null,
  daysOfWeek: [5, 6],
  startTime: '19:00',
  meetingPoint: 'Frente a la pulpería de la playa',
  meetingLatitude: null,
  meetingLongitude: null,
  imageUrl: 'http://localhost:3000/uploads/foto.jpg',
  ...overrides,
});

describe('mergeFields', () => {
  it('keeps stored values for undefined, applies values and clears with null', () => {
    const merged = mergeFields(base({ requirements: 'Traer linterna' }), {
      name: 'Nuevo nombre',
      requirements: null,
      durationMinutes: undefined,
    });
    expect(merged.name).toBe('Nuevo nombre');
    expect(merged.requirements).toBeNull();
    expect(merged.durationMinutes).toBe(180);
  });

  it('fills the optional fields with defaults when creating', () => {
    const merged = mergeFields(null, {
      name: 'Surf',
      description: 'x'.repeat(30),
      category: 'SURF',
      durationMinutes: 60,
      scheduleType: 'RECURRING',
      daysOfWeek: [1],
      startTime: '07:00',
      meetingPoint: 'Playa Coyote',
    });
    expect(merged.customCategory).toBeNull();
    expect(merged.imageUrl).toBeNull();
    expect(merged.endDate).toBeNull();
    expect(merged.meetingLatitude).toBeNull();
  });
});

describe('normalizeFields', () => {
  it('trims text and turns empty optional text into null', () => {
    const normalized = normalizeFields(base({ name: '  Tour  ', requirements: '   ', meetingPoint: ' Playa ' }));
    expect(normalized.name).toBe('Tour');
    expect(normalized.requirements).toBeNull();
    expect(normalized.meetingPoint).toBe('Playa');
  });

  it('keeps the custom category only for «Otra»', () => {
    expect(normalizeFields(base({ category: 'SURF', customCategory: 'Pesca' })).customCategory).toBeNull();
    expect(normalizeFields(base({ category: 'OTHER', customCategory: ' Pesca ' })).customCategory).toBe('Pesca');
  });

  it('drops weekdays and end date for a specific activity', () => {
    const normalized = normalizeFields(
      base({ scheduleType: 'SPECIFIC_DATE', startDate: '2026-11-01', endDate: '2026-12-01', daysOfWeek: [1, 2] }),
    );
    expect(normalized.daysOfWeek).toEqual([]);
    expect(normalized.endDate).toBeNull();
  });

  it('sorts and de-duplicates weekdays for a recurring activity', () => {
    expect(normalizeFields(base({ daysOfWeek: [6, 1, 6, 3] })).daysOfWeek).toEqual([1, 3, 6]);
  });
});

describe('validateFields', () => {
  it('accepts a valid recurring activity', () => {
    expect(validateFields(base(), options)).toEqual([]);
  });

  it('requires a label when the category is «Otra»', () => {
    const errors = validateFields(base({ category: 'OTHER', customCategory: null }), options);
    expect(errors).toContain('Escriba el nombre de la categoría cuando elige «Otra»');
    expect(validateFields(base({ category: 'OTHER', customCategory: 'Pesca' }), options)).toEqual([]);
  });

  it('requires latitude and longitude together', () => {
    const errors = validateFields(base({ meetingLatitude: 10.1, meetingLongitude: null }), options);
    expect(errors).toContain('Indique la latitud y la longitud del punto de encuentro, o ninguna de las dos');
    expect(validateFields(base({ meetingLatitude: 10.1, meetingLongitude: -85.2 }), options)).toEqual([]);
  });

  it('includes the schedule errors', () => {
    const errors = validateFields(base({ daysOfWeek: [] }), options);
    expect(errors).toContain('Seleccione al menos un día de la semana');
  });
});

describe('validatePublishable', () => {
  it('requires a photo', () => {
    expect(validatePublishable(base({ imageUrl: null }), TODAY)).toContain(
      'Agregue una foto para poder publicar la actividad',
    );
  });

  it('rejects an activity whose date already passed', () => {
    const errors = validatePublishable(
      base({ scheduleType: 'SPECIFIC_DATE', startDate: '2026-10-01', daysOfWeek: [] }),
      TODAY,
    );
    expect(errors).toContain('La fecha de la actividad no puede estar en el pasado');
  });

  it('accepts a complete, current activity', () => {
    expect(validatePublishable(base(), TODAY)).toEqual([]);
  });
});

describe('scheduleChanged', () => {
  it('detects schedule edits but ignores unrelated ones', () => {
    expect(scheduleChanged(base(), base({ name: 'Otro nombre', startTime: '20:00' }))).toBe(false);
    expect(scheduleChanged(base(), base({ daysOfWeek: [5] }))).toBe(true);
    expect(scheduleChanged(base(), base({ endDate: '2026-12-31' }))).toBe(true);
    expect(scheduleChanged(base(), base({ scheduleType: 'SPECIFIC_DATE', startDate: '2026-11-01' }))).toBe(true);
  });
});

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ActivityCategory, ActivityScheduleType } from '@/generated/prisma/enums';
import { UPLOADED_FILE_URL_MESSAGE, UPLOADED_FILE_URL_PATTERN } from '@/common/validators/uploaded-url';

// Field-shape validation only. Rules that depend on several fields (a custom
// label when the category is OTHER, weekdays when recurring, "not in the past",
// ...) live in utils/activity-fields.ts and run on the merged state.
export class CreateActivityDto {
  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name!: string;

  @IsString({ message: 'La descripción es obligatoria' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description!: string;

  @IsEnum(ActivityCategory, { message: 'Categoría inválida' })
  category!: ActivityCategory;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'La categoría debe tener al menos 2 caracteres' })
  @MaxLength(60, { message: 'La categoría no puede exceder 60 caracteres' })
  customCategory?: string | null;

  @IsInt({ message: 'La duración debe ser un número entero de minutos' })
  @Min(15, { message: 'La duración mínima es de 15 minutos' })
  @Max(1440, { message: 'La duración máxima es de 24 horas' })
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Los requisitos no pueden exceder 1000 caracteres' })
  requirements?: string | null;

  @IsEnum(ActivityScheduleType, { message: 'Tipo de horario inválido' })
  scheduleType!: ActivityScheduleType;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  startDate?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  endDate?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique({ message: 'No repita los días de la semana' })
  @IsInt({ each: true })
  @Min(1, { each: true, message: 'Día de la semana inválido' })
  @Max(7, { each: true, message: 'Día de la semana inválido' })
  daysOfWeek?: number[];

  @IsString({ message: 'La hora de inicio es obligatoria' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de inicio no es válida (use el formato HH:mm)' })
  startTime!: string;

  @IsString({ message: 'El punto de encuentro es obligatorio' })
  @MinLength(5, { message: 'El punto de encuentro debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El punto de encuentro no puede exceder 500 caracteres' })
  meetingPoint!: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  meetingLatitude?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  meetingLongitude?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(UPLOADED_FILE_URL_PATTERN, { message: UPLOADED_FILE_URL_MESSAGE })
  imageUrl?: string | null;
}

// An admin creates on behalf of a business, so it must say which one.
export class CreateActivityAdminDto extends CreateActivityDto {
  @IsString({ message: 'Seleccione el negocio' })
  @IsNotEmpty({ message: 'Seleccione el negocio' })
  businessId!: string;
}

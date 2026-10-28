import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ActivityCategory, ActivityScheduleType } from '@/generated/prisma/enums';
import { UPLOADED_FILE_URL_MESSAGE, UPLOADED_FILE_URL_PATTERN } from '@/common/validators/uploaded-url';

// Every field is optional (undefined = keep the stored value). Fields that can
// be cleared use @IsOptional (null is allowed); required ones use
// @ValidateIf(value !== undefined) so an explicit null is rejected instead of
// reaching the database.
const whenProvided = () => ValidateIf((_object, value) => value !== undefined);

export class UpdateActivityDto {
  @whenProvided()
  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @whenProvided()
  @IsString({ message: 'La descripción es obligatoria' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description?: string;

  @whenProvided()
  @IsEnum(ActivityCategory, { message: 'Categoría inválida' })
  category?: ActivityCategory;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'La categoría debe tener al menos 2 caracteres' })
  @MaxLength(60, { message: 'La categoría no puede exceder 60 caracteres' })
  customCategory?: string | null;

  @whenProvided()
  @IsInt({ message: 'La duración debe ser un número entero de minutos' })
  @Min(15, { message: 'La duración mínima es de 15 minutos' })
  @Max(1440, { message: 'La duración máxima es de 24 horas' })
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Los requisitos no pueden exceder 1000 caracteres' })
  requirements?: string | null;

  @whenProvided()
  @IsEnum(ActivityScheduleType, { message: 'Tipo de horario inválido' })
  scheduleType?: ActivityScheduleType;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  startDate?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  endDate?: string | null;

  @whenProvided()
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique({ message: 'No repita los días de la semana' })
  @IsInt({ each: true })
  @Min(1, { each: true, message: 'Día de la semana inválido' })
  @Max(7, { each: true, message: 'Día de la semana inválido' })
  daysOfWeek?: number[];

  @whenProvided()
  @IsString({ message: 'La hora de inicio es obligatoria' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora de inicio no es válida (use el formato HH:mm)' })
  startTime?: string;

  @whenProvided()
  @IsString({ message: 'El punto de encuentro es obligatorio' })
  @MinLength(5, { message: 'El punto de encuentro debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El punto de encuentro no puede exceder 500 caracteres' })
  meetingPoint?: string;

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

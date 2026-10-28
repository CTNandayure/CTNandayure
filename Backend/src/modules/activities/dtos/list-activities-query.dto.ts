import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ActivityCategory, ActivityStatus, District } from '@/generated/prisma/enums';

// Query for the public listing. The global ValidationPipe forbids unknown query
// params, so the frontend must only send these.
export class ListActivitiesQueryDto {
  @IsOptional()
  @IsEnum(ActivityCategory, { message: 'Categoría inválida' })
  category?: ActivityCategory;

  @IsOptional()
  @IsEnum(District, { message: 'Distrito inválido' })
  district?: District;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

// Query for the admin listing: every status, plus filtering by status.
export class AdminListActivitiesQueryDto {
  @IsOptional()
  @IsEnum(ActivityCategory, { message: 'Categoría inválida' })
  category?: ActivityCategory;

  @IsOptional()
  @IsEnum(ActivityStatus, { message: 'Estado de actividad inválido' })
  status?: ActivityStatus;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

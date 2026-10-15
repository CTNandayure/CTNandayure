import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role, UserStatus } from '@/generated/prisma/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El nombre no es válido',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El primer apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El primer apellido no es válido',
  })
  first_lastname?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El segundo apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El segundo apellido no es válido',
  })
  second_lastname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'El teléfono debe tener el formato 8888-8888',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}


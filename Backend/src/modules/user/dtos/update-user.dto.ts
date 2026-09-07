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
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Nombre debe contener solo letras, espacios, guiones y apóstrofes',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Apellidos debe contener solo letras, espacios, guiones y apóstrofes',
  })
  first_lastname?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Apellidos debe contener solo letras, espacios, guiones y apóstrofes',
  })
  second_lastname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, {
    message: 'Teléfono no es válido',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

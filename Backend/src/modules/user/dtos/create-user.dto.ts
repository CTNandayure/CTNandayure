import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@/generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El nombre no es válido',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El primer apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El primer apellido no es válido',
  })
  first_lastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido es obligatorio' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El segundo apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El segundo apellido no es válido',
  })
  second_lastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'El teléfono debe tener el formato 8888-8888',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'El correo electrónico no es válido',
  })
  email!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}


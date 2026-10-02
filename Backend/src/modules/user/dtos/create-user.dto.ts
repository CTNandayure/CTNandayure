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
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message: 'Nombre debe contener solo letras, espacios, guiones y apóstrofes',
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Apellidos debe contener solo letras, espacios, guiones y apóstrofes',
  })
  first_lastname!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Apellidos debe contener solo letras, espacios, guiones y apóstrofes',
  })
  second_lastname!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    {
      message: 'Teléfono no es válido',
    },
  )
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

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Nombre debe contener solo letras, espacios, guiones y apóstrofes',
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
  @Matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, {
    message: 'Teléfono no es válido',
  })
  phone!: string;

  @IsEmail()
  @MaxLength(100)
  email!: string;
}
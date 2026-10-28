import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RejectRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo es requerido' })
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'El motivo no puede exceder 1000 caracteres' })
  reason!: string;
}

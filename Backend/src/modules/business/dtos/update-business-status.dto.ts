import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateBusinessStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'], { message: 'Estado de negocio inválido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  businessStatus!: string;
}

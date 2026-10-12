import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActivityStatus } from '@/generated/prisma/enums';

export class UpdateActivityStatusDto {
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(ActivityStatus, { message: 'Estado de actividad inválido' })
  status!: ActivityStatus;
}

import { IsEnum, IsNotEmpty } from 'class-validator';
import { NewsStatus } from '@/generated/prisma/enums';

export class UpdateNewsStatusDto {
  @IsNotEmpty()
  @IsEnum(NewsStatus)
  status!: NewsStatus;
}

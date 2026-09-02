import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@/generated/prisma/enums';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status!: UserStatus;
}

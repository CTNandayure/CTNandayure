import { Exclude } from 'class-transformer';
import { UserStatus, Role } from '@/generated/prisma/enums';

export class UserEntity {
  id_person!: string;
  email!: string;
  role!: Role;
  status!: UserStatus;
  created_at!: Date;
  updated_at!: Date;

  @Exclude()
  passwordHash?: string;

  personId!: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
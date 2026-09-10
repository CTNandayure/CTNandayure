import { IsEmail, MaxLength } from 'class-validator';

export class ResendActivationDto {
  @IsEmail()
  @MaxLength(100)
  email!: string;
}
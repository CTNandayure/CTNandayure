import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

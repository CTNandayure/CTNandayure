import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateInstitutionalInfoDto {
  @IsOptional()
  @IsString()
  aboutTitle?: string;

  @IsOptional()
  @IsString()
  aboutText?: string;

  @IsOptional()
  @IsString()
  historyText?: string;

  @IsOptional()
  @IsString()
  missionText?: string;

  @IsOptional()
  @IsString()
  visionText?: string;

  // require_tld: false — uploaded images are served from localhost in dev,
  // which has no top-level domain but is still a valid URL.
  @IsOptional()
  @IsUrl({ require_tld: false })
  aboutImageUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  contactImageUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  officeHours?: string;
}

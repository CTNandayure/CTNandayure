import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}

import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  excerpt: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  // require_tld: false — uploaded images are served from localhost in dev,
  // which has no top-level domain but is still a valid URL.
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}

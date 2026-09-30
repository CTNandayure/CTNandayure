import {
  IsString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  IsEmail,
  IsUrl,
  IsIn,
} from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  businessName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['LODGING', 'FOOD', 'TRANSPORT', 'CRAFTS', 'TOURS', 'AGROTOURISM', 'COMMERCE'], {
    each: true,
  })
  categories?: string[];

  @IsOptional()
  @IsIn(['CARMONA', 'SANTA_RITA', 'ZAPOTAL', 'SAN_PABLO', 'PORVENIR', 'BEJUCO'])
  district?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  scheduleText?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  galleryUrls?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  documentUrls?: string[];
}

import {
  Matches,
  IsString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
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
  @Matches(/^\d{4}-\d{4}$/, { message: 'El teléfono debe tener el formato 8888-8888' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'El correo electrónico no es válido',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

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

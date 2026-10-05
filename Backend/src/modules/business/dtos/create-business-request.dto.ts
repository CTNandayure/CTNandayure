import {
  Matches,
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsIn,
} from 'class-validator';

export class CreateBusinessRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  businessName!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una categoría' })
  @IsIn(['LODGING', 'FOOD', 'TRANSPORT', 'CRAFTS', 'TOURS', 'AGROTOURISM', 'COMMERCE'], {
    each: true,
    message: 'Categoría inválida',
  })
  categories!: string[];

  @IsIn(['CARMONA', 'SANTA_RITA', 'ZAPOTAL', 'SAN_PABLO', 'PORVENIR', 'BEJUCO'], {
    message: 'Distrito inválido',
  })
  @IsNotEmpty({ message: 'El distrito es requerido' })
  district!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\d{4}-\d{4}$/, { message: 'El teléfono debe tener el formato 8888-8888' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'El correo electrónico del negocio es requerido' })
  @MaxLength(100, { message: 'El correo electrónico no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'El correo electrónico del negocio no es válido',
  })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address!: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La precisión debe ser un número' })
  @Min(0, { message: 'La precisión debe ser mayor o igual a 0' })
  accuracy?: number;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'La URL de Facebook no es válida' })
  @MaxLength(255)
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'La URL de Instagram no es válida' })
  @MaxLength(255)
  instagramUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'El horario es requerido' })
  @MinLength(5, { message: 'El horario debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El horario no puede exceder 500 caracteres' })
  scheduleText!: string;

  @IsString()
  @IsNotEmpty({ message: 'La imagen de portada es requerida' })
  coverImageUrl!: string;

  @IsArray()
  @ArrayMinSize(3, { message: 'Debe proporcionar al menos 3 imágenes de galería' })
  @ArrayMaxSize(5, { message: 'No puede subir más de 5 imágenes de galería' })
  @IsString({ each: true })
  galleryUrls!: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos 1 documento' })
  @ArrayMaxSize(5, { message: 'No puede subir más de 5 documentos' })
  @IsString({ each: true })
  documentUrls!: string[];

  @IsString()
  @IsNotEmpty({ message: 'El nombre del solicitante es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, { message: 'El nombre no es válido' })
  applicantName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El primer apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, { message: 'El primer apellido no es válido' })
  applicantFirstLastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido es requerido' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El segundo apellido no puede exceder 100 caracteres' })
  @Matches(/^[\p{L}\s]+$/u, { message: 'El segundo apellido no es válido' })
  applicantSecondLastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono del solicitante es requerido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\d{4}-\d{4}$/, { message: 'El teléfono del solicitante debe tener el formato 8888-8888' })
  applicantPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'El correo electrónico del solicitante es requerido' })
  @MaxLength(100, { message: 'El correo electrónico no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'El correo electrónico del solicitante no es válido',
  })
  applicantEmail!: string;
}

